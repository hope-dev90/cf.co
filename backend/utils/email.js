import nodemailer from 'nodemailer';

const createTransporter = () => {
    const host = process.env.EMAIL_HOST;
    const port = Number(process.env.EMAIL_PORT || 587);

    if (host) {
        return nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

export const sendEmail = async ({ to, subject, text, html }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('EMAIL_USER and EMAIL_PASS are required to send email');
    }

    const transporter = createTransporter();

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        text,
        html
    });
};

export const sendOtpEmail = async ({ to, otp, purpose = 'verify your email' }) => {
    await sendEmail({
        to,
        subject: 'C&F.co OTP code',
        text: `Use this OTP to ${purpose}: ${otp}. It expires in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; background: #fff8f0; padding: 24px; border-radius: 12px; color: #333;">
    
    <h2 style="color: #d35400; margin-bottom: 10px;">
        🍽️ Restaurant Verification Code
    </h2>

    <p>
        Welcome to our restaurant platform! Use the verification code below to ${purpose}:
    </p>

    <div style="
        background: #fff3e6;
        padding: 18px;
        text-align: center;
        border-radius: 10px;
        margin: 20px 0;
        border: 2px dashed #e67e22;
    ">
        <span style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 6px;
            color: #d35400;
        ">
            ${otp}
        </span>
    </div>

    <p>
        ⏳ This code will expire in <strong>10 minutes</strong>.
    </p>

    <p style="margin-top: 25px; font-size: 14px; color: #777;">
        If you did not request this code, please ignore this email.
    </p>

    <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" />

    <p style="font-size: 13px; color: #999;">
        © 2026 C&F.co — Fresh food, fast delivery 🍕
    </p>

</div>
        `
    });
};
