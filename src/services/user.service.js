import SQL from "sql-template-strings";
import bcrypt from "bcryptjs";
import { StandardCase } from "../utils/format.util.js";

export const getUserById = async (client, id) => {
  try {
    const query = SQL`select * from users where id = ${id}`;
    const userData = await client.query(query);

    if (userData.rows.length > 0) {
      const user = userData.rows[0];
      user.password = undefined;
      return user;
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

export const getUserByEmail = async (client, email) => {
  try {
    const query = SQL`select * from users where email = ${email}`;
    const userData = await client.query(query);

    if (userData.rows.length > 0) {
      const user = userData.rows[0];
      user.password = undefined;
      return user;
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

export const createNewUser = async (client, firstName, lastName, organizationId, role, email, password) => {
  try {
    const encPassword = await bcrypt.hash(password, 10);
    const query = SQL`insert into users (firstname, lastname, email, password, organization_id, role_id) values (${StandardCase(
      firstName
    )}, ${StandardCase(lastName)}, ${email}, ${encPassword}, ${organizationId}, ${role}) returning *`;
    const user = (await client.query(query)).rows[0];
    user.password = undefined;
    return user;
  } catch (error) {
    throw error;
  }
};

export const getPasswordOfUserById = async (client, id) => {
  try {
    const query = SQL`select password from users where id = ${id}`;
    const user = await client.query(query);
    if (user.rows.length === 0) {
      return null;
    }
    return user.rows[0].password;
  } catch (error) {
    throw error;
  }
};

export const checkUserLoggedIn = async (client, id) => {
  try {
    const loginUserQuery = `select * from user_sessions where user_id = ${id} order by created_date desc limit 1`;
    const loginUserDetail = await client.query(loginUserQuery);

    if (loginUserDetail.rows.length === 0) {
      return null;
    } else {
      return loginUserDetail.rows[0];
    }
  } catch (error) {
    throw error;
  }
};

export const deleteUserLoginSession = async (client, userId) => {
  try {
    const query = SQL`delete from user_sessions where user_id = ${userId} order by created_date desc limit 1`;
    await client.query(query);
  } catch (error) {
    throw error;
  }
};

export const createUserLoginSession = async (client, userId, token, browserName, browserVersion, deviceModel, deviceVendor, osName, osVersion) => {
  try {
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const query = SQL`insert into user_sessions (user_id, token, expiry_date, browser_name, browser_version, os_name, os_version) values (${userId}, ${token}, ${expiryDate}, ${browserName}, ${browserVersion}, ${osName}, ${osVersion}) returning *`;

    const data = await client.query(query);
    return data.rows[0];
  } catch (error) {
    throw error;
  }
};

export const updateVerificationStatusOfUser = async (client, userId, status) => {
  try {
    const query = `update users set is_mail_verified = ${status} where id = ${userId}`;
    await client.query(query);
  } catch (error) {
    throw error;
  }
};
