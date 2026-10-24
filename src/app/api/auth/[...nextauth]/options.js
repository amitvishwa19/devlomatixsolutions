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
                // Record web login session and notify user via email
                try {
                    const { recordUserLoginSession } = await import("@/lib/sessionAuth");
                    await recordUserLoginSession({
                        userId: usr.id,
                        email: usr.email,
                        userName: usr.displayName || user.name,
                        platform: "web",
                    });
                } catch (sessErr) {
                    console.warn("[NextAuth] Failed to record web session:", sessErr?.message);
                }

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
                console.log(`[NextAuth] Web session invalidated for ${token.email} - Superseded by mobile or invalid in DB`);
                return {
                    ...session,
                    user: null,
                    expires: new Date(0).toISOString(),
                    error: "SESSION_SUPERSEDED",
                };
            }

            if (token && session?.user) {
                session.user.userId = token.userId;
                session.user.displayName = token.displayName;
                session.user.avatar = token.avatar;
                session.user.role = token.role;
                session.user.roles = token.roles;
                session.user.workspaces = token.workspaces;
            }
            return session;
        },

        async jwt({ token, user, trigger, session }) {
            // 1. Initial sign in - capture provider/authorize data
            if (user) {
                token.userId = user.id;
                token.role = user.role;
                token.platform = "web";
            }

            // 2. Continuous Enrichment & Single-Device Session Validation
            const now = Date.now();
            const lastEnriched = token.lastEnriched || 0;
            const isStale = (now - lastEnriched) > 60 * 1000;
            const needsEnrichment = !token.roles || trigger === "signIn" || trigger === "update" || isStale;

            if (needsEnrichment && token.email) {
                try {
                    const isFullFetch = !token.roles || trigger === "signIn" || trigger === "update";
                    const usr = await db.user.findUnique({
                        where: { email: token.email },
                        select: {
                            id: true,
                            displayName: true,
                            avatar: true,
                            role: true,
                            activeSession: true,
                            ...(isFullFetch ? {
                                members: {
                                    select: {
                                        serverId: true,
                                        role: true
                                    }
                                },
                                roles: {
                                    select: {
                                        id: true,
                                        title: true,
                                        color: true,
                                        permissions: {
                                            select: {
                                                value: true,
                                                status: true
                                            }
                                        }
                                    }
                                }
                            } : {})
                        }
                    });

                    if (usr) {
                        // Single-device mutual exclusivity:
                        // If user logged into Mobile, this Web session is automatically terminated
                        const sessionData = usr.activeSession;
                        if (sessionData && typeof sessionData === "object" && sessionData.platform === "mobile") {
                            console.log(`[NextAuth Security] Web session revoked for ${token.email} - User is now active on Mobile (${sessionData.device || 'Mobile App'})`);
                            token.invalidUser = true;
                            return token;
                        }

                        // Force the internal Prisma ID into the token
                        token.userId = usr.id;
                        token.displayName = usr.displayName;
                        token.avatar = usr.avatar;
                        token.role = usr.role;
                        if (usr.roles) {
                            token.roles = usr.roles.map(r => ({
                                id: r.id,
                                title: r.title,
                                color: r.color,
                                permissions: (r.permissions || []).map(p => ({ value: p.value, status: p.status }))
                            }));
                        }
                        if (usr.members) {
                            token.workspaces = usr.members.map(m => m.serverId);
                        }
                        token.invalidUser = false;
                        token.lastEnriched = now;
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

            return token;
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
