import { asyncHandler } from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend (postman)
    // validation -not empty
    // check i fuser alreadu exists or not: check with username or email or both
    // check for images - avatar and cover image => if avaialble then upload to cloudinary
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response 
    
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

export {registerUser}