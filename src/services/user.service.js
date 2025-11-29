import SQL from "sql-template-strings";
import bcrypt from "bcryptjs";
import { StandardCase } from "../utils/format.util.js";

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
