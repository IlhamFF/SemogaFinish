
import "reflect-metadata"; // Ensure this is the very first import
import NextAuth, { type NextAuthOptions, type User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { TypeORMAdapter } from "@auth/typeorm-adapter";
import { dataSourceOptions, getInitializedDataSource } from "@/lib/data-source"; // Corrected import
import { UserEntity } from "@/entities/user.entity";
import bcrypt from "bcryptjs";
import type { Role } from "@/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      isVerified: boolean;
      fullName?: string | null;
      // name and email are already part of NextAuthUser
      // Add other custom fields that you want in the session.user object
      phone?: string | null;
      address?: string | null;
      birthDate?: string | null; // Store as string for session if needed
      bio?: string | null;
      nis?: string | null;
      nip?: string | null;
      joinDate?: string | null; // Store as string
      kelasId?: string | null; 
      mataPelajaran?: string[] | null; 
    } & NextAuthUser; 
  }

  interface User extends NextAuthUser {
    role: Role;
    isVerified: boolean;
    fullName?: string | null;
    passwordHash?: string | null; 
    // Add fields from UserEntity that authorize and jwt callbacks might need
    phone?: string | null;
    address?: string | null;
    birthDate?: string | null;
    bio?: string | null;
    nis?: string | null;
    nip?: string | null;
    joinDate?: string | null;
    kelasId?: string | null;
    mataPelajaran?: string[] | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    isVerified: boolean;
    picture?: string | null; 
    name?: string | null;
    fullName?: string | null;
    // Add other custom fields from UserEntity that you want in the JWT
    phone?: string | null;
    address?: string | null;
    birthDate?: string | null;
    bio?: string | null;
    nis?: string | null;
    nip?: string | null;
    joinDate?: string | null;
    kelasId?: string | null;
    mataPelajaran?: string[] | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: TypeORMAdapter(dataSourceOptions), // Use dataSourceOptions here
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          console.log("Authorize: Missing credentials");
          return null;
        }
        
        const dataSource = await getInitializedDataSource(); // This is correct for authorize
        const userRepo = dataSource.getRepository(UserEntity);
        
        console.log("Authorize: Attempting to find user by email:", credentials.email);
        const user = await userRepo.findOne({ where: { email: credentials.email } });

        if (!user) {
          console.log("Authorize: No user found with email:", credentials.email);
          return null;
        }

        if (!user.passwordHash) {
          console.log("Authorize: User found but has no passwordHash:", user.email);
          return null; 
        }
        
        console.log("Authorize: User found, comparing password for:", user.email);
        const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValidPassword) {
          console.log("Authorize: Invalid password for user:", user.email);
          return null;
        }
        
        console.log("Authorize: Credentials valid for user:", user.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name, 
          image: user.image,
          role: user.role,
          isVerified: user.isVerified,
          fullName: user.fullName,
          phone: user.phone,
          address: user.address,
          birthDate: user.birthDate,
          bio: user.bio,
          nis: user.nis,
          nip: user.nip,
          joinDate: user.joinDate,
          kelasId: user.kelasId,
          mataPelajaran: user.mataPelajaran,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session: newSessionData }) { 
      if (user) { 
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.name = user.name; 
        token.picture = user.image;
        token.fullName = user.fullName;
        token.phone = user.phone;
        token.address = user.address;
        token.birthDate = user.birthDate;
        token.bio = user.bio;
        token.nis = user.nis;
        token.nip = user.nip;
        token.joinDate = user.joinDate;
        token.kelasId = user.kelasId;
        token.mataPelajaran = user.mataPelajaran;
      }
      if (trigger === "update" && newSessionData?.user) {
        const updatedUser = newSessionData.user as User; 
        token.name = updatedUser.name; 
        token.picture = updatedUser.image;
        token.fullName = updatedUser.fullName;
        token.phone = updatedUser.phone;
        token.address = updatedUser.address;
        token.birthDate = updatedUser.birthDate;
        token.bio = updatedUser.bio;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isVerified = token.isVerified;
        session.user.name = token.name; 
        session.user.image = token.picture;
        session.user.fullName = token.fullName;
        session.user.phone = token.phone;
        session.user.address = token.address;
        session.user.birthDate = token.birthDate;
        session.user.bio = token.bio;
        session.user.nis = token.nis;
        session.user.nip = token.nip;
        session.user.joinDate = token.joinDate;
        session.user.kelasId = token.kelasId;
        session.user.mataPelajaran = token.mataPelajaran;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
