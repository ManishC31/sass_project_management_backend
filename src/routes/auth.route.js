import express from "express";
import { registerOrganizationController } from "../controllers/auth.controller.js";
import { registerOrganizationValidations } from "../validators/auth.validator.js";
const router = express.Router();

router.post("/register", registerOrganizationValidations, registerOrganizationController);

export default router;
