import { describe, expect, it, vi, beforeEach } from "vitest";
import { slugifyText } from "@/lib/slug";

describe("slugifyText", () => {
  it("convertit les accents et espaces", () => {
    expect(slugifyText("L'Insouciant à Malicorne")).toBe("l-insouciant-a-malicorne");
  });

  it("gère les caractères spéciaux", () => {
    expect(slugifyText("Château de Belair !")).toBe("chateau-de-belair");
  });
});

const { findUniqueRestaurant, findUniquePage } = vi.hoisted(() => ({
  findUniqueRestaurant: vi.fn(),
  findUniquePage: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    restaurant: { findUnique: findUniqueRestaurant },
    page: { findUnique: findUniquePage },
    article: { findUnique: vi.fn() },
    galleryAlbum: { findUnique: vi.fn() },
  },
}));

describe("ensureUniqueSlug", () => {
  beforeEach(() => {
    findUniqueRestaurant.mockReset();
    findUniquePage.mockReset();
  });

  it("retourne le slug de base si disponible", async () => {
    findUniqueRestaurant.mockResolvedValue(null);
    findUniquePage.mockResolvedValue(null);

    const { ensureUniqueSlug } = await import("@/lib/slug");
    const slug = await ensureUniqueSlug("restaurant", "Le Cheval Blanc");
    expect(slug).toBe("le-cheval-blanc");
  });

  it("ajoute un suffixe numérique en cas de collision", async () => {
    findUniqueRestaurant.mockResolvedValueOnce({ id: "existing-1" }).mockResolvedValueOnce(null);
    findUniquePage.mockResolvedValue(null);

    const { ensureUniqueSlug } = await import("@/lib/slug");
    const slug = await ensureUniqueSlug("restaurant", "Le Cheval Blanc");
    expect(slug).toBe("le-cheval-blanc-2");
  });

  it("exclut l'enregistrement courant lors d'une modification", async () => {
    findUniqueRestaurant.mockResolvedValue({ id: "current-id" });
    findUniquePage.mockResolvedValue(null);

    const { ensureUniqueSlug } = await import("@/lib/slug");
    const slug = await ensureUniqueSlug("restaurant", "Le Cheval Blanc", "current-id");
    expect(slug).toBe("le-cheval-blanc");
  });
});
