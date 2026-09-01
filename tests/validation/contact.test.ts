import { describe, expect, it } from "vitest";
import { contactFormSchema } from "@/lib/validation/contact";

const validPayload = {
  fullName: "Jean Dupont",
  email: "jean@example.com",
  phone: "0243404208",
  subject: "Question",
  message: "Bonjour, je souhaiterais des informations sur les bons cadeaux.",
  consentGdpr: true,
  website: "",
};

describe("contactFormSchema", () => {
  it("accepte une soumission valide", () => {
    const result = contactFormSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejette un message trop court", () => {
    const result = contactFormSchema.safeParse({ ...validPayload, message: "Bonjour" });
    expect(result.success).toBe(false);
  });

  it("rejette un email invalide", () => {
    const result = contactFormSchema.safeParse({ ...validPayload, email: "pas-un-email" });
    expect(result.success).toBe(false);
  });

  it("rejette l'absence de consentement RGPD", () => {
    const result = contactFormSchema.safeParse({ ...validPayload, consentGdpr: false });
    expect(result.success).toBe(false);
  });

  it("accepte un honeypot vide et permet de le vérifier après coup", () => {
    const result = contactFormSchema.safeParse({ ...validPayload, website: "http://spam.example" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.website).toBe("http://spam.example");
    }
  });
});
