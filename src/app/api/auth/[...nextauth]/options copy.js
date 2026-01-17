import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { MemberRole } from "@prisma/client";
import { uuid } from "@/utils/functions";

const isProd = process.env.NODE_ENV === "production";

export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,

    cookies: {
        sessionToken: {
            name: isProd
                ? "__Secure-next-auth.session-token"
                : "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: isProd,
            },
        },
    },

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),

        GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),

        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await db.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) return null;

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) return null;

                return user;
            },
        }),
    ],

    callbacks: {
        /**
         * ✅ SAFE PLACE FOR DB WRITES
         * Runs once per login
         */
        async signIn({ user }) {
            if (!user?.email) return false;

            let dbUser = await db.user.findUnique({
                where: { email: user.email },
            });

            if (!dbUser) {
                dbUser = await db.user.create({
                    data: {
                        email: user.email,
                        name: user.name ?? "",
                        displayName: user.name ?? "",
                        avatar: user.image ?? "",
                        uuid: uuid(),

                        profile: { create: {} },
                        medicalProfile: { create: {} },
                        credit: { create: { value: 0 } },

                        servers: {
                            create: {
                                name: "default",
                                default: true,
                                selected: true,
                                inviteCode: uuidv4(),
                                setting: { create: {} },
                                channels: {
                                    create: [{ name: "general", userId: undefined }],
                                },
                                members: {
                                    create: {
                                        role: MemberRole.ADMIN,
                                    },
                                },
                            },
                        },
                    },
                });
            }

            return true;
        },

        /**
         * ✅ READ-ONLY — SAFE FOR SERVER COMPONENTS
         */
        async session({ session, token }) {
            if (!token?.email) return session;

            const usr = await db.user.findUnique({
                where: { email: token.email },
                include: {
                    roles: {
                        include: {
                            permissions: true,
                        },
                    },
                },
            });

            if (!usr) return session;

            session.user.userId = usr.id;
            session.user.displayName = usr.displayName;
            session.user.avatar = usr.avatar;
            session.user.role = usr.role;
            session.user.roles = usr.roles;

            return session;
        },

        async jwt({ token, user }) {
            if (user?.email) {
                token.email = user.email;
            }
            return token;
        },
    },

    pages: {
        signIn: "/login",
        error: "/error",
    },
};
