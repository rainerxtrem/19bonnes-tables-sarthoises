import { describe, expect, it, vi } from "vitest";

describe("permissions", () => {
  it("requireContentAccess autorise ADMIN et SUPER_ADMIN", async () => {
    vi.resetModules();
    vi.doMock("@/lib/auth", () => ({
      auth: vi.fn().mockResolvedValue({ user: { id: "1", role: "ADMIN", email: "a@a.fr", name: "A" } }),
    }));
    const { requireContentAccess } = await import("@/lib/auth/permissions");
    await expect(requireContentAccess()).resolves.toBeDefined();
  });

  it("requireSuperAdmin rejette un compte ADMIN simple", async () => {
    vi.resetModules();
    vi.doMock("@/lib/auth", () => ({
      auth: vi.fn().mockResolvedValue({ user: { id: "1", role: "ADMIN", email: "a@a.fr", name: "A" } }),
    }));
    const { requireSuperAdmin, ForbiddenError } = await import("@/lib/auth/permissions");
    await expect(requireSuperAdmin()).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("requireSuperAdmin autorise SUPER_ADMIN", async () => {
    vi.resetModules();
    vi.doMock("@/lib/auth", () => ({
      auth: vi.fn().mockResolvedValue({ user: { id: "1", role: "SUPER_ADMIN", email: "a@a.fr", name: "A" } }),
    }));
    const { requireSuperAdmin } = await import("@/lib/auth/permissions");
    await expect(requireSuperAdmin()).resolves.toBeDefined();
  });

  it("requireSession rejette un visiteur non authentifié", async () => {
    vi.resetModules();
    vi.doMock("@/lib/auth", () => ({
      auth: vi.fn().mockResolvedValue(null),
    }));
    const { requireSession, UnauthorizedError } = await import("@/lib/auth/permissions");
    await expect(requireSession()).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
