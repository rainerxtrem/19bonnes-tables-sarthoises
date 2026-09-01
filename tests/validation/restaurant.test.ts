import { describe, expect, it } from "vitest";
import { restaurantSchema } from "@/lib/validation/restaurant";

describe("restaurantSchema", () => {
  it("accepte une fiche minimale valide", () => {
    const result = restaurantSchema.safeParse({ name: "Le Cheval Blanc", status: "DRAFT" });
    expect(result.success).toBe(true);
  });

  it("rejette un nom trop court", () => {
    const result = restaurantSchema.safeParse({ name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejette un code postal invalide", () => {
    const result = restaurantSchema.safeParse({ name: "Le Cheval Blanc", postalCode: "ABC" });
    expect(result.success).toBe(false);
  });

  it("rejette un email invalide", () => {
    const result = restaurantSchema.safeParse({ name: "Le Cheval Blanc", email: "pas-un-email" });
    expect(result.success).toBe(false);
  });

  it("rejette un statut inconnu", () => {
    const result = restaurantSchema.safeParse({ name: "Le Cheval Blanc", status: "PUBLIE" });
    expect(result.success).toBe(false);
  });
});
