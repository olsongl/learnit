import { getBaseUrl } from "./utils";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  // In development, log emails to console
  if (process.env.NODE_ENV === "development") {
    console.log("--- EMAIL ---");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html}`);
    console.log("--- END EMAIL ---");
    return;
  }

  // Production: implement AWS SES or other provider here
  // For now, just log
  console.log(`Would send email to ${to}: ${subject}`);
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${getBaseUrl()}/auth/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your Cmart email address",
    html: `
      <h1>Welcome to Cmart!</h1>
      <p>Click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${getBaseUrl()}/auth/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Reset your Cmart password",
    html: `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `,
  });
}

export async function sendCredentialApprovedEmail(
  email: string,
  name: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: "Your credentials have been verified!",
    html: `
      <h1>Congratulations, ${name}!</h1>
      <p>Your teacher credentials have been verified. You can now create and publish courses on Cmart.</p>
      <a href="${getBaseUrl()}/teacher">Go to Teacher Dashboard</a>
    `,
  });
}
