import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials";

const GoogleProvider = Google.default || Google;
const CredentialsProvider = Credentials.default || Credentials;

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "Email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                return { 
                    id: "1", 
                    email: credentials.email, 
                    name: credentials.email.split('@')[0],
                    image: null
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                try {
                    // Send user data to Devlomatix eCommerce backend to save the user
                    const apiUrl = process.env.NEXT_PUBLIC_DEVLOMATIX_API_URL || "http://localhost:3001";
                    const response = await fetch(`${apiUrl}/api/auth/register-sync`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name,
                            image: user.image,
                            provider: 'google',
                            providerAccountId: account.providerAccountId,
                        }),
                    });

                    if (!response.ok) {
                        console.error('Failed to sync user with Devlomatix backend:', await response.text());
                    }
                } catch (error) {
                    console.error('Error syncing user with Devlomatix backend:', error);
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.sub
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id
            }
            return token
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET || "development-secret-key"
}