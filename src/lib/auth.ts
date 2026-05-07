import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        login: { label: "登录方式", type: "text", placeholder: "手机号或邮箱" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) {
          return null
        }

        const login = credentials.login as string
        const password = credentials.password as string

        // 查询用户 - 支持手机号或邮箱登录
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: login },
              { email: login },
            ],
          },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        // 验证密码
        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) {
          return null
        }

        // 返回用户信息
        return {
          id: user.id,
          name: user.nickname || user.phone || user.email,
          email: user.email,
          image: user.avatar,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  pages: {
    signIn: "/shop/login",
  },
  session: {
    strategy: "jwt",
  },
})
