import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      restaurantId: string | null;
    };
  }
  interface User {
    role: Role;
    restaurantId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    restaurantId: string | null;
  }
}
