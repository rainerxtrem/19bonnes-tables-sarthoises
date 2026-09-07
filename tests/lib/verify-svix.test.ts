import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifySvixSignature } from "@/lib/webhooks/verify-svix";

const SECRET = "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw";

function sign(svixId: string, svixTimestamp: string, rawBody: string) {
  const key = Buffer.from(SECRET.replace(/^whsec_/, ""), "base64");
  const signed = `${svixId}.${svixTimestamp}.${rawBody}`;
  const sig = createHmac("sha256", key).update(signed).digest("base64");
  return `v1,${sig}`;
}

describe("verifySvixSignature", () => {
  it("accepte une signature valide et récente", () => {
    const svixId = "msg_1";
    const svixTimestamp = String(Math.floor(Date.now() / 1000));
    const rawBody = '{"type":"email.received"}';
    const svixSignature = sign(svixId, svixTimestamp, rawBody);

    expect(verifySvixSignature({ secret: SECRET, svixId, svixTimestamp, svixSignature, rawBody })).toBe(true);
  });

  it("accepte quand plusieurs signatures sont présentes (rotation de secret)", () => {
    const svixId = "msg_1";
    const svixTimestamp = String(Math.floor(Date.now() / 1000));
    const rawBody = "{}";
    const valid = sign(svixId, svixTimestamp, rawBody);
    const svixSignature = `v1,bogus== ${valid}`;

    expect(verifySvixSignature({ secret: SECRET, svixId, svixTimestamp, svixSignature, rawBody })).toBe(true);
  });

  it("rejette une signature invalide", () => {
    const svixId = "msg_1";
    const svixTimestamp = String(Math.floor(Date.now() / 1000));
    const rawBody = "{}";

    expect(
      verifySvixSignature({ secret: SECRET, svixId, svixTimestamp, svixSignature: "v1,invalide==", rawBody })
    ).toBe(false);
  });

  it("rejette un corps modifié après signature", () => {
    const svixId = "msg_1";
    const svixTimestamp = String(Math.floor(Date.now() / 1000));
    const svixSignature = sign(svixId, svixTimestamp, '{"a":1}');

    expect(
      verifySvixSignature({ secret: SECRET, svixId, svixTimestamp, svixSignature, rawBody: '{"a":2}' })
    ).toBe(false);
  });

  it("rejette un timestamp trop ancien (au-delà de la tolérance)", () => {
    const svixId = "msg_1";
    const svixTimestamp = String(Math.floor(Date.now() / 1000) - 10 * 60);
    const rawBody = "{}";
    const svixSignature = sign(svixId, svixTimestamp, rawBody);

    expect(verifySvixSignature({ secret: SECRET, svixId, svixTimestamp, svixSignature, rawBody })).toBe(false);
  });

  it("rejette quand un header requis est absent", () => {
    expect(
      verifySvixSignature({ secret: SECRET, svixId: null, svixTimestamp: "1", svixSignature: "v1,x", rawBody: "{}" })
    ).toBe(false);
  });
});
