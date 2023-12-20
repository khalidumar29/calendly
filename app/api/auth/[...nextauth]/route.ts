import { access } from "fs";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_PROVIDER_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_PROVIDER_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "https://www.googleapis.com/auth/calendar.events.freebusy",
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
            "openid",
          ].join(" "),
        },
      },
      profile(profile, tokens) {
        const user = {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          accessToken: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires: tokens.expires_at,
        };

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refresh_token = user.refresh_token;
        token.expires = user.expires;
      }

      return { ...token };
    },
    async session({ session, token }) {
      return {
        ...session,
        user: { ...session.user, accessToken: token.accessToken },
      };
    },
  },
});

export { handler as GET, handler as POST };
