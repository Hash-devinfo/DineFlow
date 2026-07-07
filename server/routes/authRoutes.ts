import {Router} from "express";
import { getMe, loginUser, registerUser } from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";



const authRouter = Router()


authRouter.post("./register", protect,registerUser)
authRouter.post("./login", protect,loginUser)

authRouter.post("./me", protect,getMe)


export default authRouter;