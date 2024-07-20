import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { User } from "../models/user.model.js"


const addFavorite = asyncHandler(async (req, res) => {
    const { propertyId } = req.params
    const user = await User.findById(req.user._id)
    if (user.favorites.includes(propertyId)) {
        throw new apiError(400, "Property already in favorites!")
    }
    user.favorites.push(propertyId)
    await user.save()
    return res
        .status(200)
        .json(new apiResponse(200, "Property added to favorites!"))
})

const removeFavorite = asyncHandler(async (req, res) => {
    const { propertyId } = req.params
    const user = await User.findById(req.user._id)
    const favoritePropertyIndex = user.favorites.indexOf(propertyId);
    if (favoritePropertyIndex === -1) {
        throw new apiError(404, "Property does not exists in favorites!");
    }
    user.favorites.splice(favoritePropertyIndex, 1);
    await user.save();
    return res
        .status(200)
        .json(new apiResponse(200, {}, "Property removed from favorites!"))
})

const getFavorite = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('favorites');
    if (user.favorites.length === 0) {
        return res
            .status(200)
            .json(new apiResponse(200, user.favorites, "Favorites empty!"))
    } else {
        return res
            .status(200)
            .json(new apiResponse(200, user.favorites, "Favorite properties fetched successfully!"))
    }
})

export { addFavorite, removeFavorite, getFavorite }