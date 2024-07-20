import { Router } from "express";
import { addFavorite, removeFavorite, getFavorite } from "../controllers/favourite.controler.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.use(verifyJWT);
router.route("/add/:propertyId").post(addFavorite)
router.route("/remove/:propertyId").delete(removeFavorite)
router.route("/get").get(getFavorite)

export default router
