import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Adapter removed to avoid runtime dependency on @next-auth/mongodb-adapter.
// The app will use JWT sessions unless you add a MongoDB adapter and driver.
export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }
        
        // This is a demo app without a real user database
        // Accept any email/password to simulate a successful login/signup
        return {
          id: credentials.email,
          name: credentials.name || credentials.email.split('@')[0],
          email: credentials.email
        };
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret',
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth',
    error: '/auth'
  },
  callbacks: {
    async jwt({ token, user }){
      if(user) token.user = { name: user.name, email: user.email };
      return token;
    },
    async session({ session, token }){
      if(token?.user) session.user = token.user;
      return session;
    },
    async redirect({ url, baseUrl }){
      // After sign-in, redirect to home (role will be set from localStorage)
      return baseUrl;
    }
  }
});
