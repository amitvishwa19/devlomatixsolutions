import NextAuth from "next-auth"
import { authOptions } from "./options"

export const runtime = "nodejs"; // ✅ ADD THIS

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }