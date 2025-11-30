import pool from "../config/db.config.js";
import { getUserById } from "../services/user.service.js";
import { ApiError } from "../utils/responses.util.js";
import jwt from "jsonwebtoken";

export const checkLogin = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const token = req.cookies.token;
    console.log("token:", token);

    if (!token) {
      return ApiError(res, 401, "Unauthenticated user");
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return ApiError(res, 401, "Unauthenticated user");
    }

    const userInformation = await getUserById(client, decoded.id);
    console.log("user information:", userInformation);

    req.user.id = userInformation.id;
    req.user.email = userInformation.email;
    req.user.firstname = userInformation.firstname;
    req.user.lastname = userInformation.lastname;
    req.user.role_id = userInformation.role_id;
    req.user.organization_id = userInformation.organization_id;
  } catch (error) {
    console.log("checkLogin err:", error);
    return ApiError(res, 401, "Unauthenticated user");
  } finally {
    client.release();
  }
};
