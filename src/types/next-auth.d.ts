import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "private" | "enterprise" | "admin";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "private" | "enterprise" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: "private" | "enterprise" | "admin";
  }
}
