
import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "drivora_admin_session";

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET is missing or too short");
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret())
    .update(value)
    .digest("hex");
}

export function createAdminToken() {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  const payload = Buffer.from(
    JSON.stringify({ role: "admin", expiresAt })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token: string) {
  try {
    const [payload, signature] = token.split(".");

    if (!payload || !signature) return false;

    const expectedSignature = sign(payload);
    const actual = Buffer.from(signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      actual.length !== expected.length ||
      !timingSafeEqual(actual, expected)
    ) {
      return false;
    }

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    return (
      data.role === "admin" &&
      typeof data.expiresAt === "number" &&
      data.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}
