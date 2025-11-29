import { validationResult } from "express-validator";
import { ApiError, ApiResponse } from "../utils/responses.util.js";
import { createOrganization, getOrganizationByName } from "../services/organization.service.js";
import { createNewUser, getUserByEmail } from "../services/user.service.js";
import pool from "../config/db.config.js";

export const registerOrganizationController = async (req, res) => {
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

    return ApiResponse(res, 201, "Organization created successfully", {
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
