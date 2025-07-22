// src/types/user.ts
export interface UserType {
  _id: string;
  username: string;
  password: string;
  role: 'admin' | 'karyawan';
}

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      role: 'admin' | 'karyawan';
    }
  }
  
  interface User {
    id: string;
    name: string;
    role: 'admin' | 'karyawan';
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: 'admin' | 'karyawan';
  }
}