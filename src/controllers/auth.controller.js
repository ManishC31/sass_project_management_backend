import { validationResult } from "express-validator";
import { ApiError, ApiResponse } from "../utils/responses.util.js";
import { createOrganization, getOrganizationByName } from "../services/organization.service.js";
import {
  checkUserLoggedIn,
  createNewUser,
  createUserLoginSession,
  deleteUserLoginSession,
  getPasswordOfUserById,
  getUserByEmail,
  updateVerificationStatusOfUser,
} from "../services/user.service.js";
import pool from "../config/db.config.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UAParser } from "ua-parser-js";
import { sendEmailVerificationMail } from "../services/mail.service.js";

export const registerOrganizationController = async (req, res) => {
  // validations
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return ApiError(res, 400, result.errors[0].msg);
  }

  // connect to database
  const client = await pool.connect();

  const { firstName, lastName, email, password, organizationName, organizationSize, planName, billingPattern, roleId, countryCode, countryName } =
    req.body;
  try {
    const existingOrganization = await getOrganizationByName(client, organizationName);

    if (existingOrganization) {
      return ApiError(400, "Organization already present with the name");
    }

    const existingUser = await getUserByEmail(client, email);

    if (existingUser) {
      return ApiError(400, "User already present in another organization");
    }

    // create a transaction
    await client.query("BEGIN");

    const organization = await createOrganization(client, organizationName, organizationSize, countryCode, countryName, planName, billingPattern);
    const user = await createNewUser(client, firstName, lastName, organization.id, roleId, email, password);

    // commit transaction
    await client.query("COMMIT");

    return ApiResponse(res, 201, "Organization created successfully, verify your mail. The mail has been sent on your email.", {
      organization,
      user,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("registerOrganizationController err:", error);
    return ApiError(res, 500, "Failed to register new organization");
  } finally {
    client.release();
  }
};

export const loginUserController = async (req, res) => {
  // validations
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return ApiError(res, 400, result.errors[0].msg);
  }

  const { email, password } = req.body;
  const client = await pool.connect();
  try {
    const existingUser = await getUserByEmail(client, email);

    if (!existingUser || !existingUser.status) {
      return ApiError(res, 400, "User not found with email");
    }

    if (!existingUser.is_mail_verified) {
      // initiate mail verification
      await sendEmailVerificationMail(client, existingUser.id);
      return ApiResponse(res, 200, "Verify your mail first. The mail has been sent to your mail for verification.");
    }

    const userPassword = await getPasswordOfUserById(client, existingUser.id);
    const isValidPassword = await bcrypt.compare(password, userPassword);

    if (!isValidPassword) {
      return ApiError(res, 400, "Password is not matching");
    }

    const token = jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    // check if the user is already logged in another device or not
    const previousLoginDetails = await checkUserLoggedIn(client, existingUser.id);

    if (previousLoginDetails) {
      // delete previous session
      await deleteUserLoginSession(client, existingUser.id);
    }

    // get user device details
    const userAgent = req.headers["user-agent"];

    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser();
    const device = parser.getDevice();
    const os = parser.getOS();

    // create new login session
    await createUserLoginSession(client, existingUser.id, token, browser.name, browser.version, device.model, device.vendor, os.name, os.version);

    res.cookie("token", token, {
      httpOnly: true, // cannot access cookie via JS
      secure: process.env.NODE_ENV === "production", // only https in prod
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 day
    });

    return ApiResponse(res, 200, "User logged in successfully", {
      token: token,
      user: existingUser,
    });
  } catch (error) {
    console.log("loginUserController err:", error);
    return ApiError(res, 500, "Failed to login user");
  } finally {
    client.release();
  }
};

export const logoutUserController = async (req, res) => {
  const client = await pool.connect();
  try {
    await deleteUserLoginSession(client, req.user.id);
    res.clearCookie("token");
    return ApiResponse(res, 200, "User logged out successfully");
  } catch (error) {
    console.log("logoutUserController err:", error);
    return ApiError(res, 500, "Failed to logout user");
  } finally {
    client.release();
  }
};

export const mailVerificationController = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, otp } = req.body;

    const userData = await getUserByEmail(client, email);

    if (!userData) {
      return ApiError(res, 400, "No user found with mail");
    }

    const currentTimestamp = new Date().toISOString();

    if (userData.mail_verification_code !== otp) {
      return ApiError(res, 400, "Invalid OTP");
    }

    if (currentTimestamp > userData.mail_verification_expiry) {
      return ApiError(res, 400, "Expired OTP");
    }

    await updateVerificationStatusOfUser(client, userData.id, true);

    return ApiResponse(res, 200, "Mail verified successfully");
  } catch (error) {
    console.log("mailVerificationController err:", error);
    return ApiError(res, 500, "Failed to verify mail");
  } finally {
    client.release();
  }
};
