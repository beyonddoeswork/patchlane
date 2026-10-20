import nodemailer from "nodemailer";

function getTransporter() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();

  if (!user || !pass) {
    throw new Error(
      `SMTP Credentials missing! user: ${user ? "present" : "undefined"}, pass: ${pass ? "present" : "undefined"}`
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user,
      pass: pass,
    },
  });
}

// 1. Existing Invite Dispatcher
interface InviteMailOptions {
  to: string;
  projectName: string;
  projectSlug: string;
  role: string;
  temporaryPassword?: string;
  isExistingUser: boolean;
}

export async function sendDeveloperInviteEmail({
  to,
  projectName,
  projectSlug,
  role,
  temporaryPassword,
  isExistingUser,
}: InviteMailOptions) {
  const transporter = getTransporter();
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.03em;">
          Patchlane<span style="color: #4f46e5;">.</span>
        </span>
      </div>

      <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
        You've been added to ${projectName}
      </h2>

      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
        An agency owner or manager has assigned you as a <strong>${role}</strong> for the project workspace: 
        <code style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #4f46e5; font-family: monospace;">/report/${projectSlug}</code>.
      </p>

      ${
        !isExistingUser && temporaryPassword
          ? `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-top: 0; margin-bottom: 8px;">
            Your Login Credentials
          </p>
          <div style="font-size: 13px; color: #1e293b; margin-bottom: 4px;">
            <strong>Email:</strong> ${to}
          </div>
          <div style="font-size: 13px; color: #1e293b;">
            <strong>Temporary Password:</strong> <code style="background-color: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${temporaryPassword}</code>
          </div>
        </div>
        `
          : `
        <p style="font-size: 14px; color: #475569; margin-bottom: 24px;">
          You already have an existing Patchlane account. Log in with your standard credentials to access this new workspace.
        </p>
        `
      }

      <div style="margin-bottom: 28px;">
        <a href="${loginUrl}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; display: inline-block;">
          Sign In to Project Console &rarr;
        </a>
      </div>

      <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        If you did not expect this invitation, you can safely ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Patchlane" <${process.env.SMTP_USER}>`,
    to,
    subject: `You've been invited to ${projectName} on Patchlane`,
    html: htmlContent,
  });
}

// 2. Developer Removal Notification
interface RemovalMailOptions {
  to: string;
  projectName: string;
  projectSlug: string;
  reason: string;
}

export async function sendDeveloperRemovalEmail({
  to,
  projectName,
  projectSlug,
  reason,
}: RemovalMailOptions) {
  const transporter = getTransporter();

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.03em;">
          Patchlane<span style="color: #4f46e5;">.</span>
        </span>
      </div>

      <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
        Workspace Access Update: ${projectName}
      </h2>

      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 16px;">
        Your developer access to the project <strong>${projectName}</strong> (<code>/report/${projectSlug}</code>) has been revoked by the project manager.
      </p>

      <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #be123c; margin-top: 0; margin-bottom: 6px;">
          Reason Specified
        </p>
        <p style="font-size: 13px; color: #881337; margin: 0; line-height: 1.5;">
          ${reason || "Project assignment completed or reallocated."}
        </p>
      </div>

      <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        If you believe this was done in error, please reach out directly to your agency lead or project manager.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Patchlane" <${process.env.SMTP_USER}>`,
    to,
    subject: `Access revoked for project: ${projectName}`,
    html: htmlContent,
  });
}

// 3. Client Submission Confirmation
interface ClientConfirmMailOptions {
  to: string;
  projectName: string;
  summary: string;
  url?: string;
}

export async function sendClientReportConfirmationEmail({
  to,
  projectName,
  summary,
  url,
}: ClientConfirmMailOptions) {
  const transporter = getTransporter();

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.03em;">
          Patchlane<span style="color: #4f46e5;">.</span>
        </span>
      </div>

      <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
        We've received your request!
      </h2>

      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 16px;">
        Thank you for submitting your feedback for <strong>${projectName}</strong>. Our development team has received the item and is actively reviewing it.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-top: 0; margin-bottom: 8px;">
          Ticket Summary
        </p>
        <div style="font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 4px;">
          "${summary}"
        </div>
        ${url ? `<div style="font-size: 12px; color: #64748b;"><strong>Page URL:</strong> ${url}</div>` : ""}
      </div>

      <p style="font-size: 13px; color: #475569; line-height: 1.5; margin-bottom: 24px;">
        You will receive further updates as the team investigates and updates the status of this ticket.
      </p>

      <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        Automated notification sent via Patchlane on behalf of the engineering team.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Patchlane Support" <${process.env.SMTP_USER}>`,
    to,
    subject: `Request Received: ${summary}`,
    html: htmlContent,
  });
}

// 4. Password Reset Notice Dispatcher
interface PasswordResetNoticeOptions {
  to: string;
  newPassword?: string;
  resetLink?: string;
  resetBy: string;
}

export async function sendPasswordResetNoticeEmail({
  to,
  newPassword,
  resetLink,
  resetBy,
}: PasswordResetNoticeOptions) {
  const transporter = getTransporter();
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.03em;">
          Patchlane<span style="color: #4f46e5;">.</span>
        </span>
      </div>

      <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
        Your password has been reset
      </h2>

      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
        A password reset for your account (<strong>${to}</strong>) was processed by your <strong>${resetBy}</strong>.
      </p>

      ${
        newPassword
          ? `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-top: 0; margin-bottom: 8px;">
            Your New Password
          </p>
          <div style="font-size: 13px; color: #1e293b; margin-bottom: 4px;">
            <strong>Email:</strong> ${to}
          </div>
          <div style="font-size: 13px; color: #1e293b;">
            <strong>Temporary Password:</strong> <code style="background-color: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${newPassword}</code>
          </div>
        </div>
        `
          : ""
      }

      ${
        resetLink
          ? `
        <div style="margin-bottom: 28px;">
          <a href="${resetLink}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; display: inline-block;">
            Reset Your Password &rarr;
          </a>
        </div>
        `
          : `
        <div style="margin-bottom: 28px;">
          <a href="${loginUrl}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; display: inline-block;">
            Sign In with New Password &rarr;
          </a>
        </div>
        `
      }

      <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        If you did not expect this password reset, please contact your project manager or team admin immediately.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Patchlane Security" <${process.env.SMTP_USER}>`,
    to,
    subject: `Password Reset Notice: Patchlane Account`,
    html: htmlContent,
  });
}