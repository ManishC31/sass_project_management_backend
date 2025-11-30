import { body } from "express-validator";

export const registerOrganizationValidations = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Invalid email address").toLowerCase(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("planName").notEmpty().withMessage("Selected plan name is required"),
  body("roleId").notEmpty().withMessage("User role id is required"),
  body("organizationName").notEmpty().withMessage("Organization name is required"),
  body("organizationSize").notEmpty().withMessage("Organization size is required"),
];

export const loginUserValidations = [
  body("email").isEmail().withMessage("Invalid email address").toLowerCase(),
  body("password").notEmpty().withMessage("Invalid Password"),
];

export const mailVerificationValidations = [
  body("otp").notEmpty().withMessage("Valid OTP is required"),
  body("email").isEmail().withMessage("Invalid email address").toLowerCase(),
];
