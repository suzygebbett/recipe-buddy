import NextAuth from "next-auth"
import { authOptions } from "@recipe-buddy/server/auth"

export default NextAuth(authOptions)
