import NextAuthImport from "next-auth"

const NextAuth = NextAuthImport.default || NextAuthImport

export async function GET(request) {
  const { authOptions } = await import("./options")
  return NextAuth(authOptions)(request)
}

export async function POST(request) {
  const { authOptions } = await import("./options")
  return NextAuth(authOptions)(request)
}