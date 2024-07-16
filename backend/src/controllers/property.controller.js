import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { Property } from "../models/property.model.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"

const extractPublicIdFromUrl = (url) => {
    const parts = url.split('/')
    const publicId = parts[parts.length - 1].split('.')[0]
    return publicId
}

const addProperty = asyncHandler(async (req, res) => {
    const { description, price, flat, building, street, city, state, pincode, type, size, bedrooms, bathrooms, amenities, yearBuilt, status, rentalPeriod } = req.body;
    const owner = req.user._id;
    const existingProperty = await Property.findOne({
        flat,
        building,
        street
    })
    if (existingProperty) {
        throw new apiError(400, "Property already listed!")
    }
    const images = [];
    for (const file of req.files) {
        const image = await uploadOnCloudinary(file.path);
        images.push(image.url);
    }
    const property = await Property.create({
        description, price, flat, building, street, city, state, pincode, type, size, bedrooms, bathrooms, amenities, images, yearBuilt, status, rentalPeriod, owner
    })
    // console.log(property)
    return res.status(201).json(
        new apiResponse(200, property, "Property listed Successfully!")
    )

})

const updateProperty = asyncHandler(async (req, res) => {
    const { propertyId } = req.params
    const { description, price, flat, building, street, city, state, pincode, type, size, bedrooms, bathrooms, amenities, yearBuilt, status, rentalPeriod } = req.body;

    const property = await Property.findById(propertyId)
    if (!property) {
        throw new apiError(404, "Property not found");
    }

    const images = []
    if (req.files) {
        for (const imgurl of property.images) {
            await deleteFromCloudinary(extractPublicIdFromUrl(imgurl))
          }

        for (const file of req.files) {
            const image = await uploadOnCloudinary(file.path);
            images.push(image.url);
        }
    } else {
        images = property.images
    }
    
    property.description = description || property.description;
    property.price = price || property.price;
    property.flat = flat || property.flat;
    property.building = building || property.building;
    property.street = street || property.sreet;
    property.city = city || property.city;
    property.state = state || property.state;
    property.pincode = pincode || property.pincode;
    property.type = type || property.type;
    property.size = size || property.size;
    property.bedrooms = bedrooms || property.bedrooms;
    property.bathrooms = bathrooms || property.bathrooms;
    property.amenities = amenities || property.amenities;
    property.images = images;
    property.yearBuilt = yearBuilt || property.yearBuilt;
    property.status = status || property.status;
    property.rentalPeriod = rentalPeriod || property.rentalPeriod;

    await property.save();
    return res
        .status(200)
        .json(new apiResponse(200, property, "Property details updated succesfully!"))
})

const removeProperty = asyncHandler(async (req, res) => {
    const { propertyId } = req.params

    const propertyToDelete = await Property.findById(propertyId)
    if (!propertyToDelete) {
        throw new apiError(404, "No such property exists!")
    }
    for (const imgurl of propertyToDelete.images) {
        await deleteFromCloudinary(extractPublicIdFromUrl(imgurl))
      }

    await propertyToDelete.deleteOne()

    return res
        .status(200)
        .json(new apiResponse(200, propertyToDelete, "Property deleted successfully!"))
})

const getPropertyById = asyncHandler(async (req, res) => {
    const { propertyId } = req.params
    const property = await Property.findOne(propertyId)
    return res
        .status(200)
        .json(new apiResponse(200, property, `property listed with ${propertyId} fetched succesfully!`))
})

const getUserProperties = asyncHandler(async (req, res) => {
    const userProperties = await Property.find({ owner: req.user._id })
    return res
        .status(200)
        .json(new apiResponse(200, userProperties, "USer's properties fetched succesfully!"))
})

const getAllProperties = asyncHandler(async (req, res) => {
    const properties = await Property.find()
    return res
        .status(200)
        .json(new apiResponse(200, properties, "All properties fetched succesfully!"))
})


export { addProperty, removeProperty, updateProperty, getPropertyById, getUserProperties, getAllProperties } 