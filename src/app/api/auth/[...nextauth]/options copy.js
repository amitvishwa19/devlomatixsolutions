import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { MemberRole } from "@prisma/client";
import { uuid } from "@/utils/functions";

export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,

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
                const user = await db.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) return null;

                const valid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!valid) return null;

                return user;
            },
        }),
    ],

    callbacks: {
        /** 🔑 WRITE TO DB ONLY HERE */
        async signIn({ user, account }) {
            if (!user?.email) return false;

            const dbUser = await db.user.upsert({
                where: { email: user.email },
                update: {
                    name: user.name,
                    avatar: user.image,
                },
                create: {
                    email: user.email,
                    name: user.name,
                    avatar: user.image,
                    uuid: uuid(),
                    profile: { create: {} },
                    medicalProfile: { create: {} },
                    credit: { create: { value: 0 } },
                },
            });

            // Ensure default server exists
            const existingServer = await db.server.findFirst({
                where: { userId: dbUser.id },
            });

            if (!existingServer) {
                await db.server.create({
                    data: {
                        userId: dbUser.id,
                        name: "default",
                        default: true,
                        selected: true,
                        inviteCode: uuidv4(),
                        setting: { create: {} },
                        channels: {
                            create: [{ name: "general", userId: dbUser.id }],
                        },
                        members: {
                            create: {
                                userId: dbUser.id,
                                role: MemberRole.ADMIN,
                            },
                        },
                    },
                });
            }

            return true;
        },

        /** 🔑 TOKEN = SMALL + SAFE */
        async jwt({ token, user }) {
            if (user) {
                token.userId = user.id;
            }
            return token;
        },

        /** ✅ READ ONLY — SAFE IN PROD */
        async session({ session, token }) {
            if (!token?.userId) return session;

            const user = await db.user.findUnique({
                where: { id: token.userId },
                include: {
                    roles: {
                        include: { permissions: true },
                    },
                },
            });

            session.user.userId = user.id;
            session.user.roles = user.roles;

            return session;
        },
    },

    pages: {
        signIn: "/login",
        error: "/error",
    },
};
