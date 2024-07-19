import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateUserDetails, updateUserProfilePic, deleteUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(upload.single("profilePic"), registerUser)
router.route("/login").post(loginUser)

// secured routes
router.use(verifyJWT)
router.route("/logout").post(logoutUser)
router.route("/refresh-access-token").post(refreshAccessToken)
router.route("/change-password").post(changeCurrentPassword)
router.route("/current-user").get(getCurrentUser)
router.route("/update-details").patch(updateUserDetails)
router.route("/update-profilepic").post(upload.single("profilePic"), updateUserProfilePic)
router.route('/delete').delete(deleteUser)
export default router