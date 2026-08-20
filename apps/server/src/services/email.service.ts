import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT);
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;
const emailFrom = process.env.EMAIL_FROM;

if (
  !smtpHost ||
  !smtpPort ||
  !smtpUser ||
  !smtpPassword ||
  !emailFrom
) {
  throw new Error(
    "Email configuration is missing"
  );
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPassword,
  },
});

export const emailService = {
  sendVerificationEmail: async (
    email: string,
    verificationToken: string
  ) => {
    const verificationUrl =
      `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: emailFrom,
      to: email,
      subject: "Verify your College Trading Platform account",
      html: `
        <h2>Verify your email</h2>

        <p>
          Welcome to the College Trading Platform.
        </p>

        <p>
          Click the link below to verify your email address:
        </p>

        <p>
          <a href="${verificationUrl}">
            Verify Email
          </a>
        </p>

        <p>
          This verification link will expire soon.
        </p>
      `,
    });
  },

  sendAdminInvitation: async (
    email: string,
    name: string,
    invitationToken: string
  ) => {
    const invitationUrl =
      `${process.env.CLIENT_URL}/admin-invitations/accept?token=${invitationToken}`;

    await transporter.sendMail({
      from: emailFrom,
      to: email,
      subject: "College Trading Platform Administrator Invitation",
      html: `
        <h2>College Administrator Invitation</h2>

        <p>
          Hello ${name},
        </p>

        <p>
          You have been invited to become a
          College Administrator on the College Trading Platform.
        </p>

        <p>
          <a href="${invitationUrl}">
            Accept Invitation
          </a>
        </p>

        <p>
          This invitation will expire in 24 hours.
        </p>
      `,
    });
  },
};