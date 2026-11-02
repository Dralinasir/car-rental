
import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

export const CUSTOMER_COOKIE_NAME = "drivora_customer_session";

function getSecret() {
  const secret = process.env.CUSTOMER_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "CUSTOMER_SESSION_SECRET is missing or too short"
    );
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret())
    .update(value)
    .digest("hex");
}

export function createCustomerToken(customerId: number) {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  const payload = Buffer.from(
    JSON.stringify({
      role: "customer",
      customerId,
      expiresAt,
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifyCustomerToken(token: string) {
  try {
    const [payload, signature] = token.split(".");

    if (!payload || !signature) return null;

    const expectedSignature = sign(payload);

    const actual = Buffer.from(signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      actual.length !== expected.length ||
      !timingSafeEqual(actual, expected)
    ) {
      return null;
    }

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (
      data.role !== "customer" ||
      !Number.isSafeInteger(data.customerId) ||
      data.customerId < 1 ||
      typeof data.expiresAt !== "number" ||
      data.expiresAt <= Date.now()
    ) {
      return null;
    }

    return {
      customerId: data.customerId as number,
    };
  } catch {
    return null;
  }
}
