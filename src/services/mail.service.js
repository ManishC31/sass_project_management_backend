import SQL from "sql-template-strings";
import { handleMailSent } from "../utils/mail.util.js";
import { getUserById } from "./user.service.js";

export const sendEmailVerificationMail = async (client, userId) => {
  try {
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const query = SQL`update users set mail_verification_code = ${verificationCode}, mail_verification_expiry = ${verificationExpiry} where id = ${userId}`;
    await client.query(query);

    const userDetail = await getUserById(client, userId);

    await handleMailSent([userDetail.email], "Verify email to register account", `<h1>Verification code is ${verificationCode}</h1>`);
  } catch (error) {
    throw error;
  }
};
