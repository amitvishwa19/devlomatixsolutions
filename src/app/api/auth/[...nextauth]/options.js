import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

const GoogleProvider = Google.default || Google;
const GitHubProvider = GitHub.default || GitHub;
const CredentialsProvider = Credentials.default || Credentials;

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId:
        process.env.GOOGLE_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Return a dummy user since database is removed and everything works via API
        return {
          id: "1",
          email: credentials.email,
          name: credentials.email.split("@")[0],
          image: null,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Database syncing removed as per request
      return true;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-key",
};