import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role: 'USER' | 'ADMIN';
      apiToken?: string;
    };
  }

  interface User {
    id: string;
    role: 'USER' | 'ADMIN';
    apiToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: 'USER' | 'ADMIN';
    apiToken?: string;
  }
}
