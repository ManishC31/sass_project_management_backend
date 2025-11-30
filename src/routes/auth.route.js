import express from "express";
import {
  loginUserController,
  logoutUserController,
  mailVerificationController,
  registerOrganizationController,
} from "../controllers/auth.controller.js";
import { loginUserValidations, mailVerificationValidations, registerOrganizationValidations } from "../validators/auth.validator.js";
import { checkLogin } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/register", registerOrganizationValidations, registerOrganizationController);

router.post("/login", loginUserValidations, loginUserController);

router.get("/logout", checkLogin, logoutUserController);

router.post("/mail-verification", mailVerificationValidations, mailVerificationController);

export default router;
