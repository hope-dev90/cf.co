import nodemailer from "nodemailer";
import config from "../config/env.js";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
    html,
  });
};

export const sendOtpEmail = async ({ to, otp, purpose }) => {
  await sendEmail({
    to,
    subject: "Verification Code",
    text: `Your verification code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 32px; border-radius: 12px;">
        <h2 style="color: #1a1a1a; margin: 0 0 16px;">Verification Code</h2>
        <p style="color: #4a4a4a; margin: 0 0 20px;">Use this code to ${purpose}:</p>
        <div style="background: #ffffff; padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 20px; border: 1px solid #e0e0e0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${otp}</span>
        </div>
        <p style="color: #888888; margin: 0; font-size: 14px;">This code will expire in 10 minutes.</p>
      </div>
    `,
  });
};
