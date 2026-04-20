import NextAuth from "next-auth"
import { authOptions } from "./options"

export const runtime = "nodejs";

const handler = (NextAuth.default || NextAuth)(authOptions)

export { handler as GET, handler as POST }