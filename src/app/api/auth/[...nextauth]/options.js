import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { OAuth2Client } from "google-auth-library";

const GoogleProvider = Google.default || Google;
const GitHubProvider = GitHub.default || GitHub;
const CredentialsProvider = Credentials.default || Credentials;

import bcrypt from 'bcryptjs'
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";
import { uuid } from "@/utils/functions";

const googleOneTapClient = new OAuth2Client(process.env.GOOGLE_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);




export const authOptions = {


    providers: [

        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),

        CredentialsProvider({
            id: "google-one-tap",
            name: "Google One Tap",
            credentials: {
                credential: { label: "Google Credential", type: "text" },
            },
            async authorize(credentials) {
                const clientId = process.env.GOOGLE_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

                if (!clientId || !credentials?.credential) {
                    return null;
                }

                const ticket = await googleOneTapClient.verifyIdToken({
                    idToken: credentials.credential,
                    audience: clientId,
                });
                const payload = ticket.getPayload();

                if (!payload?.email || !payload.email_verified) {
                    return null;
                }

const user = await db.user.upsert({
                    where: {
                        email: payload.email,
                    },
                    update: {
                        displayName: payload.name ?? undefined,
                        avatar: payload.picture ?? undefined,
                        isActive: true, // Re-activate on login
                    },
                    create: {
                        email: payload.email,
                        displayName: payload.name ?? "",
                        avatar: payload.picture ?? "",
                        webDeviceToken: "deviceToken",
                        uuid: uuid(),
                        isActive: true,
                        profile: { create: {} },
                        setting: { create: {} },
                        credit: { create: { value: 0 } },
                    },
                });

                // Check if user is inactive
                if (!user.isActive) {
                    return null;
                }

                let server = await db.server.findFirst({
                    where: { userId: user.id },
                });

                if (!server) {
                    server = await db.server.create({
                        data: {
                            userId: user.id,
                            name: "default",
                            default: true,
                            selected: true,
                            inviteCode: uuidv4(),
                        },
                    });

                    await db.channel.create({
                        data: { name: "general", serverId: server.id, userId: user.id },
                    });

                    await db.member.create({
                        data: { userId: user.id, serverId: server.id, role: MemberRole.ADMIN },
                    });
                }

                return user;
            }
        }),

        GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET
        }),

        CredentialsProvider({

            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "Email" },
                password: { label: "Password", type: "password" }
            },


            async authorize(credentials) {
                // 1. Find user
                const user = await db.user.findFirst({
                    where: { email: credentials.email }
                });

                // 2. USER NOT FOUND
                if (!user) {
                    return Promise.reject(new Error("USER_NOT_FOUND"));
                }

                // 3. USER INACTIVE
                if (!user.isActive) {
                    return Promise.reject(new Error("USER_INACTIVE"));
                }

                // 4. HAS NO PASSWORD (Google/Github user)
                if (!user.password) {
                    return Promise.reject(new Error("NO_PASSWORD"));
                }

                // 4. Validate password
                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    return Promise.reject(new Error("WRONG_PASSWORD"));
                }

                // 5. SUCCESS
                return user;
            }

        })
    ],

    callbacks: {

        async signIn({ user }) {

            if (!user?.email) return false;

            const usr = await db.user.upsert({
                where: {
                    email: user.email,
                },
                update: {
                    displayName: user.name ?? undefined,
                    avatar: user.picture ?? undefined,
                    isActive: true, // Re-activate on login
                },
                create: {
                    email: user.email,
                    displayName: user.name ?? "",
                    avatar: user.picture ?? "",
                    webDeviceToken: "deviceToken",
                    uuid: uuid(),
                    isActive: true,
                    profile: { create: {} },
                    setting: { create: {} },
                    credit: { create: { value: 0 } },
                },
            });

            // Check if user is inactive
            if (!usr?.isActive) {
                return false;
            }

            //Removed the server and caannel creation

            if (usr) {
                let server = await db.server.findFirst({
                    where: { userId: usr.id },
                });



                if (!server) {
                    server = await db.server.create({
                        data: {
                            // ✅ REQUIRED by Server schema
                            userId: usr.id,
                            name: "default",
                            default: true,
                            selected: true,
                            inviteCode: uuidv4(),
                        },
                    });

                    //Create default channel
                    await db.channel.create({
                        data: { name: "general", serverId: server.id, userId: usr.id },
                    });

                    //Create admin member
                    await db.member.create({
                        data: { userId: usr.id, serverId: server.id, role: MemberRole.ADMIN },
                    });

                }
            }

            return true
        },

        async session({ session, token }) {
            if (token?.userId) {
                // Token has userId from JWT callback - just assign it
                session.user.userId = token.userId;
                session.user.displayName = token.displayName;
                session.user.avatar = token.avatar;
                session.user.role = token.role;
                session.user.roles = token.roles;
                session.user.workspaces = token.workspaces;
            }
            return session
        },

        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.userId = user.id;
            }

            // Fetch roles and extra info on sign-in or when an update is triggered
            if (!token.roles || trigger === "signIn" || trigger === "update") {
                try {
                    const usr = await db.user.findUnique({
                        where: { email: token.email },
                        select: { 
                            id: true, 
                            displayName: true, 
                            avatar: true, 
                            role: true, 
                            isActive: true,
                            members: {
                                select: { serverId: true, role: true }
                            },
                            roles: {
                                include: { permissions: true }
                            }
                        }
                    });

                    if (usr && usr.isActive) {
                        token.userId = usr.id;
                        token.displayName = usr.displayName;
                        token.avatar = usr.avatar;
                        token.role = usr.role;
                        token.roles = usr.roles;
                        token.workspaces = usr.members.map(m => m.serverId);
                    }
                } catch (error) {
                    console.error("[NextAuth Security Layer] Failed to enrich session token:", error);
                }
            }

            return token
        }
    },
    pages: {
        signIn: '/login',
        signOut: '/logout',
        error: '/error',
        verifyRequest: '/verify-request',
        newUser: '/new-user'
    },
    secret: process.env.ENCRYPTION_KEY

}
