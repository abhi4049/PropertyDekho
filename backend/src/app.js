import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express()
 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routes import
import userRouter from "../src/routes/user.routes.js"
import propertyRouter from "../src/routes/property.routes.js"
import favoriteRouter from "../src/routes/favorite.routes.js"
// routes declaration
app.use("/api/v1/user", userRouter)
app.use("/api/v1/property", propertyRouter)
app.use("/api/v1/favorites", favoriteRouter)

export {app}