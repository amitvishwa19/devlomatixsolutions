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
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "Email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {



                const user = await db.user.findFirst({
                    where: {
                        email: credentials.email
                    }
                })

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password)


                console.log('isPasswordValid', isPasswordValid)

                if (isPasswordValid) {
                    return user
                } else {
                    return null
                    throw new Error('Incorrect credentials')
                }



            }
        })
    ],
    callbacks: {

        // async redirect({ url, baseUrl }) {
        //     console.log('middleware redirect after login')
        // },

        async signIn({ user, account, profile, email, credentials }) {

            if (account.provider === 'google') {

            }
            return true
        },

        async session({ session, token, trigger, }) {

            let usr
            let server


            if (token) {


                usr = await db.user.upsert({
                    where: {
                        email: token.email
                    },
                    update: {
                        name: token.name,
                        displayName: token.name,
                        avatar: token.picture,
                        webDeviceToken: 'sfsfsfsfsdf'
                    },
                    create: {
                        email: token.email,
                        name: token.name,
                        displayName: token.name,
                        avatar: token.picture,
                        webDeviceToken: 'deviceToken',
                        uuid: uuid(),
                        profile: {
                            create: {
                                displayname: '',
                            }
                        },
                        medicalProfile: {
                            create: {}
                        },
                        credit: {
                            create: {
                                value: 0
                            }
                        },
                    },
                })

                if (usr) {
                    server = await db.server.findFirst({
                        where: { userId: usr.id }
                    })

                    if (!server) {
                        server = await db.server.create({
                            data: {
                                userId: usr?.id,
                                name: 'default',
                                default: true,
                                inviteCode: uuidv4(),
                                selected: true,
                                setting: {
                                    create: {}
                                },
                                channels: {
                                    create: [{ name: 'general', userId: usr?.id }]
                                },
                                members: {
                                    create: [
                                        {
                                            userId: usr?.id,
                                            role: MemberRole.ADMIN
                                        }
                                    ]
                                }
                            }
                        })
                    }
                }

                const refreshUser = await db.user.findUnique({
                    where: { email: usr.email },
                    include: {
                        roles: {
                            include: {
                                permissions: true
                            },
                        },
                        servers: true,
                    },
                })

                session.user.userId = usr.id;
                session.user.displayName = usr.displayName
                session.user.avatar = usr.avatar
                session.user.role = usr.role
                session.user.roles = refreshUser.roles

            }

            return session
        },

        async jwt({ token, user, account, profile, isNewUser }) {
            // if (user) {
            //     console.log('jwt', 'user', user, 'token', token)
            //}
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
