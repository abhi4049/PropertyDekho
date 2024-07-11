import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new apiError(500, "Something went wrong while generating referesh and access token")
    }
}

const options = {
    httpOnly: true,
    secure: true
}

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body
    if ([name, email, phone, password].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All fields are required!")
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { phone }]
    })

    if (existingUser) {
        throw new apiError(409, "User with email or phone number already exists!")
    }
    const profilePicLocalPath = req.file?.path;
    let profilePic;
    if (profilePicLocalPath) {
        profilePic = await uploadOnCloudinary(profilePicLocalPath);
    }
    const user = await User.create({
        name,
        email,
        phone,
        password,
        profilePic: profilePic?.url || "https://res.cloudinary.com/dhpc9vkpj/image/upload/v1720417023/bggwfwa0g03cmbpeeh1w.png"
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new apiError(500, "Something went wrong while registering the user!")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered Successfully!")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, phone, password } = req.body
    if (!email && !phone) {
        throw new apiError(400, "Email or phone number is required!")
    }

    const user = await User.findOne({
        $or: [{ email }, { phone }]
    })
    if (!user) {
        throw new apiError(400, "No such user exists!")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new apiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully!"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "User logged out!"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
        if (!incomingRefreshToken) {
            throw new apiError(401, "unauthorized request!")
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new apiError(401, "Invalid Refresh Token!")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new apiError(401, "Refresh Token is already expired or used!")
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("newRefreshToken", newRefreshToken, options)
            .json(
                new apiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access Token refreshed!"
                )
            )
    } catch (error) {
        throw new apiError(401, error?.message || "invalid Refresh Token!")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)

    const isPasswordValid = user.isPasswordCorrect(oldPassword)
    if (!isPasswordValid) {
        throw new apiError(400, "Invalid Password!")
    }
    if (oldPassword === newPassword) {
        throw new apiError(400, "New passowrd cannot be same as old password!")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new apiResponse(200, {}, "Password changed successfully!"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new apiResponse(
            200,
            req.user,
            "Current user fetched successfully!"
        ))
})

const updateUserDetails = asyncHandler(async (req, res) => {
    const { name, email, phone } = req.body
    if (!name || !email || !phone) {
        throw new apiError(400, "All fields are mandatory!")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                name, email, phone // name: name, email: email, phone: phone
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new apiResponse(200, user, "User details updated succesfully!"))
})

const updateUserProfilePic = asyncHandler(async (req, res) => {
    const profilePicLocalPath = req.file?.path
    if (!profilePicLocalPath) {
        throw new apiError("profile picture file is missing!")
    }

    const profilePic = await uploadOnCloudinary(profilePicLocalPath)
    if (!profilePic.url) {
        throw new apiError(400, "Error while uploading profile picture!")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                profilePic: profilePic.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new apiResponse(200, user, "Profile picture updated successfully!")
        )
})


export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateUserDetails, updateUserProfilePic } 