import nodemailer from 'nodemailer';

const getTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const codeEmailHTML = (code, email) => `
<div style="font-family: Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border-radius: 20px; background: #f4f1ee;">
  <div style="display: flex; align-items: center; justify-content: space-between;">
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 20px; color: #2b1d1a;">cf.co</span>
    </div>
    <span style="font-size: 12px; letter-spacing: 2px; color: #8c6f63;">ORDER SAFELY</span>
  </div>
  <hr style="border: none; border-top: 1px solid #e0d8d3; margin: 25px 0;">
  <h2 style="font-size: 26px; color: #2b1d1a; margin-bottom: 10px;">Verify your identity</h2>
  <p style="font-size: 16px; color: #6e5a52; line-height: 1.5;">Enter the 6-digit verification code we sent to your email address. It expires in 10 minutes.</p>
  <div style="text-align: center; margin: 30px 0;">
    <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 12px; color: #2b1d1a;">${code}</span>
  </div>
  <div style="text-align: center;">
    <div style="background: #e6e0dc; color: #b5a9a3; padding: 14px; border-radius: 10px; font-size: 14px;">Verify Code</div>
  </div>
  <p style="text-align: center; margin-top: 25px; font-size: 14px; color: #8c6f63;">
    Didn't receive a code? 
    <a href="${process.env.BASE_URL}/auth/resend-otp?email=${encodeURIComponent(email)}" style="color: #6e4b3a; font-weight: 500; text-decoration: none;">Resend code</a>
  </p>
</div>`;

export const sendVerificationEmail = async (to, code) => {
    await getTransporter().sendMail({
        from: `"cf.co" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'cf.co — Verify your email',
        html: codeEmailHTML(code, to),
    });
};

export const sendPasswordResetEmail = async (to, code) => {
    await getTransporter().sendMail({
        from: `"cf.co" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'cf.co — Reset your password',
        html: codeEmailHTML(code, to),
    });
};
