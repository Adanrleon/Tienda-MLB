import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

type BackendAuthResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    role: 'USER' | 'ADMIN';
  };
};

const providers: any[] = [
  Credentials({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials?.email,
          password: credentials?.password,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as BackendAuthResponse;

      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        image: data.user.image ?? undefined,
        role: data.user.role,
        apiToken: data.accessToken,
      };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? 'change-me',
  trustHost: true,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider === 'credentials') {
        return true;
      }

      if (!user.email || !user.name) {
        return false;
      }

      const response = await fetch(`${API_URL}/auth/session/exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          image: user.image,
          authProvider: account.provider,
          providerAccountId: account.providerAccountId,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as BackendAuthResponse;

      user.id = data.user.id;
      user.role = data.user.role;
      user.apiToken = data.accessToken;

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.apiToken = user.apiToken;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === 'string' ? token.id : '';
        session.user.role = token.role === 'ADMIN' ? 'ADMIN' : 'USER';
        session.user.apiToken =
          typeof token.apiToken === 'string' ? token.apiToken : undefined;
      }

      return session;
    },
  },
});
