
import "reflect-metadata"; // Ensure this is the very first import
import NextAuth, { type NextAuthOptions, type User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { TypeORMAdapter } from "@auth/typeorm-adapter";
import { dataSourceOptions, getInitializedDataSource } from "@/lib/data-source";
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
      name?: string | null; // Already part of NextAuthUser if available
      email?: string | null; // Already part of NextAuthUser
      image?: string | null; // Already part of NextAuthUser (maps to avatarUrl in our case)
      phone?: string | null;
      address?: string | null;
      birthDate?: string | null; // Store as string for session
      bio?: string | null;
      nis?: string | null;
      nip?: string | null;
      joinDate?: string | null; // Store as string
      kelasId?: string | null; 
      mataPelajaran?: string[] | null; 
    };
  }

  interface User extends NextAuthUser { // This interface is used by the authorize callback and adapter
    role: Role;
    isVerified: boolean;
    fullName?: string | null;
    passwordHash?: string | null; 
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
    name?: string | null; // from NextAuthUser
    email?: string | null; // from NextAuthUser
    picture?: string | null; // from NextAuthUser, maps to user.image
    fullName?: string | null;
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
  adapter: TypeORMAdapter(dataSourceOptions),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        
        const dataSource = await getInitializedDataSource();
        const userRepo = dataSource.getRepository(UserEntity);
        
        const user = await userRepo.findOne({ where: { email: credentials.email } });

        if (!user || !user.passwordHash) {
          return null;
        }
        
        const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValidPassword) {
          return null;
        }
        
        // Return all fields needed for the JWT and Session objects
        return {
          id: user.id,
          email: user.email,
          name: user.name, 
          image: user.image, // This will be user.avatarUrl from your form/db
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
      if (user) { // user object is available on sign-in
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.name = user.name; 
        token.picture = user.image; // maps to image from authorize, which should be avatarUrl
        token.email = user.email;
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
      // Handle session updates, e.g., after profile update
      if (trigger === "update" && newSessionData?.user) {
        const updatedUserFields = newSessionData.user as Partial<User>; // Cast to your extended User type
        token.name = updatedUserFields.name ?? token.name;
        token.picture = updatedUserFields.image ?? token.picture; // image for avatar
        token.fullName = updatedUserFields.fullName ?? token.fullName;
        token.phone = updatedUserFields.phone ?? token.phone;
        token.address = updatedUserFields.address ?? token.address;
        token.birthDate = updatedUserFields.birthDate ?? token.birthDate;
        token.bio = updatedUserFields.bio ?? token.bio;
        // Role and isVerified are typically not updated this way, handle via specific admin APIs
      }
      return token;
    },
    async session({ session, token }) {
      // Transfer properties from JWT token to session object
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.isVerified = token.isVerified;
      session.user.name = token.name; 
      session.user.image = token.picture; // `image` in session, from `picture` in token
      session.user.email = token.email;
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
      return session;
    },
  },
  pages: {
    signIn: ROUTES.LOGIN, // Use constant for maintainability
    // signOut: '/auth/signout',
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (Email provider) Used for check email page
    // newUser: null // If set, new users will be directed here on first sign in
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

    