import { describe, expect, it, vi, beforeEach } from "vitest";

const restaurantFindUniqueOrThrow = vi.fn();
const restaurantUpdate = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    restaurant: {
      findUniqueOrThrow: (...args: unknown[]) => restaurantFindUniqueOrThrow(...args),
      update: (...args: unknown[]) => restaurantUpdate(...args),
    },
  },
}));

describe("setRestaurantStatus (publication / dépublication)", () => {
  beforeEach(() => {
    restaurantFindUniqueOrThrow.mockReset();
    restaurantUpdate.mockReset();
  });

  it("fixe publishedAt à la première publication", async () => {
    restaurantFindUniqueOrThrow.mockResolvedValue({ id: "r1", status: "DRAFT", publishedAt: null });
    restaurantUpdate.mockImplementation(({ data }) => ({ id: "r1", ...data }));

    const { setRestaurantStatus } = await import("@/lib/services/restaurant.service");
    const result = await setRestaurantStatus("r1", "PUBLISHED");

    expect(restaurantUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "r1" },
        data: expect.objectContaining({ status: "PUBLISHED" }),
      })
    );
    expect(result.publishedAt).toBeInstanceOf(Date);
  });

  it("conserve publishedAt existant en cas de republication", async () => {
    const existingDate = new Date("2025-01-01");
    restaurantFindUniqueOrThrow.mockResolvedValue({ id: "r1", status: "ARCHIVED", publishedAt: existingDate });
    restaurantUpdate.mockImplementation(({ data }) => ({ id: "r1", ...data }));

    const { setRestaurantStatus } = await import("@/lib/services/restaurant.service");
    const result = await setRestaurantStatus("r1", "PUBLISHED");

    expect(result.publishedAt).toBe(existingDate);
  });

  it("archive un restaurant publié", async () => {
    restaurantFindUniqueOrThrow.mockResolvedValue({ id: "r1", status: "PUBLISHED", publishedAt: new Date() });
    restaurantUpdate.mockImplementation(({ data }) => ({ id: "r1", ...data }));

    const { setRestaurantStatus } = await import("@/lib/services/restaurant.service");
    const result = await setRestaurantStatus("r1", "ARCHIVED");

    expect(result.status).toBe("ARCHIVED");
  });
});
