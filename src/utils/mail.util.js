import nodemailer from "nodemailer";

export const handleMailSent = async (reveivers, subject, body) => {
  try {
    // Create a test account or replace with real credentials.
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from: `Manish Chavan <Project Management Application>`,
      to: reveivers,
      subject: subject,
      html: body,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.log("handleMailSent err:", error);
    throw error;
  }
};
