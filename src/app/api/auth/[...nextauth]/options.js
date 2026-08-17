import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";

const GoogleProvider = Google.default || Google;
const GitHubProvider = GitHub.default || GitHub;
const CredentialsProvider = Credentials.default || Credentials;

import bcrypt from 'bcryptjs'
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { MemberRole } from "@prisma/client";
import { uuid } from "@/utils/functions";




export const authOptions = {


    providers: [

        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
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

                // 3. HAS NO PASSWORD (Google/Github user)
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

                // 5. CHECK VERIFICATION
                if (!user.isVerified) {
                    return Promise.reject(new Error("ACCOUNT_NOT_VERIFIED"));
                }

                // 6. SUCCESS
                return user;
            }

        })
    ],

    callbacks: {

        async signIn({ user }) {

            console.log('user from auth', user)

            if (!user?.email) return false;

            const usr = await db.user.upsert({
                where: {
                    email: user.email,
                },
                update: {
                    displayName: user.name ?? undefined,
                    avatar: user.image ?? undefined,
                },
                create: {
                    email: user.email,
                    displayName: user.name ?? "",
                    avatar: user.image ?? "",
                    webDeviceToken: "deviceToken",
                    uuid: uuid(),
                    profile: { create: {} },
                    setting: { create: {} },
                    credit: { create: { value: 0 } },
                },
            });

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
            if (token?.invalidUser) {
                console.log(`[NextAuth] Invalidating session for ${token.email} - User not found in DB`);
                return null; // This will effectively sign the user out
            }

            if (token) {
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
            // 1. Initial sign in - capture provider/authorize data
            if (user) {
                token.userId = user.id;
                token.role = user.role;
            }

            // 2. Continuous Enrichment & Validation
            // We verify against the DB on sign-in, update, or if crucial info is missing
            const needsEnrichment = !token.roles || trigger === "signIn" || trigger === "update";

            if (needsEnrichment && token.email) {
                try {
                    const usr = await db.user.findUnique({
                        where: { email: token.email },
                        include: {
                            members: {
                                select: {
                                    serverId: true,
                                    role: true
                                }
                            },
                            roles: {
                                include: {
                                    permissions: true
                                }
                            }
                        }
                    });

                    if (usr) {
                        // Force the internal Prisma ID into the token
                        token.userId = usr.id;
                        token.displayName = usr.displayName;
                        token.avatar = usr.avatar;
                        token.role = usr.role;
                        token.roles = usr.roles;
                        token.workspaces = usr.members.map(m => m.serverId);
                        token.invalidUser = false;
                    } else {
                        // User was deleted or not found
                        console.warn(`[NextAuth] User ${token.email} not found in database during JWT enrichment.`);
                        token.invalidUser = true;
                    }
                } catch (error) {
                    console.error("[NextAuth Security Layer] Failed to enrich session token:", error);
                    // On error, we don't invalidate immediately to avoid lockouts during DB downtime
                }
            }

            return token
        }
    },
    pages: {
        signIn: '/login',
        signOut: '/logout',
        error: '/error', // Error code passed in query string as ?error=
        verifyRequest: '/verify-request', // (used for check email message)
        newUser: '/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
    },
    secret: process.env.ENCRYPTION_KEY,
    debug: true

}
