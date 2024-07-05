import mongoose, { Schema } from mongoose
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const propertySchema = new Schema(
    {
        description: { type: String, required: true },
        price: { type: Number, required: true },
        location: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pinCode: { type: String, required: true }
        },
        type: { type: String, required: true, enum: ['flat', 'villa', 'bungalow'] },
        size: { type: Number, required: true },  // in square feet
        bedrooms: { type: Number, required: true },
        bathrooms: { type: Number, required: true },
        amenities: { type: [String] },  // List of amenities
        images: { type: [String], required: true },  // List of image URLs
        yearBuilt: { type: Number, required: true },
        listedDate: { type: Date, default: Date.now },
        status: { type: String, required: true, enum: ['available', 'pending', 'sold', 'rented'] },
        rentalPeriod: {type: Number}, // in months
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    },
    {
        timestamps: true
    }
)
propertySchema.plugin(mongooseAggregatePaginate)
export const Propert = mongoose.model("Property", propertySchema)