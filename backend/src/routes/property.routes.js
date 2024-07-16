import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { addProperty, getAllProperties, getPropertyById, getUserProperties, removeProperty, updateProperty } from "../controllers/property.controller.js";
const router = Router()
router.use(verifyJWT)
router.route("/add").post(upload.array('images', 10), addProperty)
router.route("/update/:propertyId").patch(upload.array('images', 10), updateProperty)
router.route("/remove/:propertyId").delete(removeProperty)
router.route("/get/:id").get(getPropertyById)
router.route("/get-my-properties").get(getUserProperties)
router.route("/get-all-properties").get(getAllProperties)
export default router