import { createHmac, timingSafeEqual } from "node:crypto";

// Resend signe ses webhooks (dont Inbound) au format Svix — pas de SDK
// dédié installé (le projet parle à Resend en HTTP brut, voir mailer.ts) :
// vérification manuelle, algorithme documenté par Svix
// (https://docs.svix.com/receiving/verifying-payloads/how-manual).
//
// Contenu signé : `${svix-id}.${svix-timestamp}.${rawBody}` (corps brut,
// non reparsé). Secret : partie après `whsec_`, décodée en base64 pour
// obtenir la clé HMAC-SHA256. Le header svix-signature contient une ou
// plusieurs signatures séparées par un espace, chacune préfixée par une
// version ("v1,<signature base64>").

const TOLERANCE_SECONDS = 5 * 60;

export function verifySvixSignature(params: {
  secret: string;
  svixId: string | null;
  svixTimestamp: string | null;
  svixSignature: string | null;
  rawBody: string;
}): boolean {
  const { secret, svixId, svixTimestamp, svixSignature, rawBody } = params;
  if (!svixId || !svixTimestamp || !svixSignature) return false;

  const timestamp = Number(svixTimestamp);
  if (!Number.isFinite(timestamp)) return false;
  const nowSeconds = Date.now() / 1000;
  if (Math.abs(nowSeconds - timestamp) > TOLERANCE_SECONDS) return false;

  const secretKey = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
  const expected = createHmac("sha256", secretKey).update(signedContent).digest();

  return svixSignature
    .split(" ")
    .map((part) => part.split(",")[1])
    .filter((sig): sig is string => Boolean(sig))
    .some((sig) => {
      let candidate: Buffer;
      try {
        candidate = Buffer.from(sig, "base64");
      } catch {
        return false;
      }
      return candidate.length === expected.length && timingSafeEqual(candidate, expected);
    });
}
