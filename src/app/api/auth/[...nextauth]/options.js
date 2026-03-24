import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
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
                },
                create: {
                    email: user.email,
                    displayName: user.name ?? "",
                    avatar: user.picture ?? "",
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

        async session({ session, token, trigger, }) {

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

            session.user.userId = usr.id;
            session.user.displayName = usr.displayName;
            session.user.avatar = usr.avatar;
            session.user.role = usr.role;
            session.user.roles = usr.roles;



            return session
        },

        async jwt({ token, user, account, profile, isNewUser }) {

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
    secret: process.env.NEXTAUTH_SECRET

}
