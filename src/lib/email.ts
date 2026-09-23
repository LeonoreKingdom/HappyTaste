import "server-only";

import { Resend } from "resend";

export type PasswordResetEmailInput = {
  to: string;
  resetUrl: string;
};

type EmailEnvironment = {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
};

export function validatePasswordResetEmailInput(input: unknown): asserts input is PasswordResetEmailInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Invalid password reset email input.");
  }

  const candidate = input as Partial<PasswordResetEmailInput>;
  if (
    typeof candidate.to !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.to)
  ) {
    throw new Error("A valid recipient email is required.");
  }

  if (typeof candidate.resetUrl !== "string") {
    throw new Error("A valid password reset URL is required.");
  }

  let resetUrl: URL;
  try {
    resetUrl = new URL(candidate.resetUrl);
  } catch {
    throw new Error("A valid password reset URL is required.");
  }

  if (
    !["http:", "https:"].includes(resetUrl.protocol) ||
    resetUrl.username.length > 0 ||
    resetUrl.password.length > 0
  ) {
    throw new Error("A valid password reset URL is required.");
  }
}

export function validateEmailConfiguration(
  environment: EmailEnvironment = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
  },
) {
  if (!environment.RESEND_API_KEY?.trim()) {
    throw new Error("RESEND_API_KEY is required to send email.");
  }

  if (!environment.EMAIL_FROM?.trim()) {
    throw new Error("EMAIL_FROM is required to send email.");
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

export async function sendPasswordResetEmail(input: PasswordResetEmailInput) {
  validatePasswordResetEmailInput(input);
  validateEmailConfiguration();

  const resend = new Resend(process.env.RESEND_API_KEY!.trim());
  const resetUrl = escapeHtml(input.resetUrl);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!.trim(),
    to: input.to,
    subject: "Reset kata sandi HappyTaste",
    text: [
      "Kami menerima permintaan untuk mengatur ulang kata sandi akun HappyTaste Anda.",
      `Buka tautan ini untuk melanjutkan: ${input.resetUrl}`,
      "Jika Anda tidak meminta reset kata sandi, abaikan email ini.",
    ].join("\n\n"),
    html: [
      "<p>Kami menerima permintaan untuk mengatur ulang kata sandi akun HappyTaste Anda.</p>",
      `<p><a href="${resetUrl}">Atur ulang kata sandi</a></p>`,
      "<p>Jika Anda tidak meminta reset kata sandi, abaikan email ini.</p>",
    ].join(""),
  });

  if (error) {
    throw new Error("Password reset email delivery failed.");
  }
}
