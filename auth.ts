import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Temporarily disable adapter to bypass database issues
  // adapter: DrizzleAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Mock session for testing
      if (token.id === 'test-user-123') {
        session.user = {
          id: 'test-user-123',
          name: 'Shriyansh Dash',
          email: 'shriyanshdash12@gmail.com',
          image: 'https://via.placeholder.com/150',
          emailVerified: null
        };
      }
      return session;
    }
  },
})
