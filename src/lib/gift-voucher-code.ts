import { randomInt } from "node:crypto";
import { prisma } from "@/lib/db/prisma";

// Alphabet volontairement privé des caractères ambigus à l'oral/à l'écrit
// (0/O, 1/I/L) — le code doit pouvoir être relu au téléphone ou recopié à
// la main sans confusion, en salle, par le restaurateur qui le valide.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomSegment(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[randomInt(ALPHABET.length)];
  }
  return out;
}

/** Génère un code de bon cadeau unique, ex. "19BT-7F3K-QX9M". */
export async function generateUniqueVoucherCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `19BT-${randomSegment(4)}-${randomSegment(4)}`;
    const existing = await prisma.giftVoucher.findUnique({ where: { code: candidate }, select: { id: true } });
    if (!existing) return candidate;
  }
  throw new Error("Impossible de générer un code de bon cadeau unique après 10 tentatives.");
}
