import NextAuth, { Session } from "next-auth";

interface CustomSession extends Session {
  accessToken?: string;
}

declare module "next-auth" {
  interface Session extends CustomSession {}
}

declare module "next-auth/react" {
  interface Session extends CustomSession {}
}
