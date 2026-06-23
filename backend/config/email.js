const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const FROM = `"PlaceCell" <${process.env.GMAIL_USER}>`;
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';

exports.sendVerificationEmail = async (email, name, token) => {
  const url = `${BACKEND}/api/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    from: FROM, to: email,
    subject: 'Verify your PlaceCell account',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px">
        <h2 style="color:#1e40af;margin-bottom:8px">Welcome to PlaceCell, ${name}!</h2>
        <p style="color:#475569">Please verify your email address to activate your account.</p>
        <a href="${url}" style="display:inline-block;margin:24px 0;background:#2563eb;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">Verify Email</a>
        <p style="color:#94a3b8;font-size:13px">Link expires in 24 hours. If you didn't create this account, ignore this email.</p>
      </div>`,
  });
};

exports.sendPasswordResetEmail = async (email, name, token) => {
  const url = `${FRONTEND}/auth/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM, to: email,
    subject: 'Reset your PlaceCell password',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px">
        <h2 style="color:#1e40af">Password Reset Request</h2>
        <p style="color:#475569">Hi ${name}, click the button below to reset your password.</p>
        <a href="${url}" style="display:inline-block;margin:24px 0;background:#2563eb;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
        <p style="color:#94a3b8;font-size:13px">Link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>`,
  });
};

exports.sendDriveNotificationEmail = async (email, name, drive) => {
  await transporter.sendMail({
    from: FROM, to: email,
    subject: `New Placement Drive: ${drive.company_name}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px">
        <h2 style="color:#1e40af">New Placement Drive!</h2>
        <p style="color:#475569">Hi ${name}, a new placement drive has been posted.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;color:#64748b">Company</td><td style="padding:8px;font-weight:600">${drive.company_name}</td></tr>
          <tr style="background:#f8fafc"><td style="padding:8px;color:#64748b">Role</td><td style="padding:8px;font-weight:600">${drive.job_role}</td></tr>
          <tr><td style="padding:8px;color:#64748b">Package</td><td style="padding:8px;font-weight:600">${drive.package_lpa} LPA</td></tr>
          <tr style="background:#f8fafc"><td style="padding:8px;color:#64748b">Deadline</td><td style="padding:8px;font-weight:600">${new Date(drive.application_deadline).toLocaleDateString()}</td></tr>
        </table>
        <a href="${FRONTEND}/student/drives" style="display:inline-block;background:#2563eb;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">View Drive</a>
      </div>`,
  });
};
