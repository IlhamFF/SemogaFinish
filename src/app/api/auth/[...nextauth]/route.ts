
import NextAuth, { type NextAuthOptions, type User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { TypeORMAdapter } from "@auth/typeorm-adapter";
import { AppDataSource, getInitializedDataSource } from "@/lib/data-source";
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
    } & NextAuthUser; 
  }

  interface User extends NextAuthUser {
    role: Role;
    isVerified: boolean;
    fullName?: string | null;
    passwordHash?: string | null; 
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    isVerified: boolean;
    picture?: string | null; // Corresponds to image in User
    name?: string | null;
    fullName?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: TypeORMAdapter(AppDataSource),
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
        
        const dataSource = await getInitializedDataSource();
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
        // Return the user object that NextAuth expects, including custom fields
        return {
          id: user.id,
          email: user.email,
          name: user.name, 
          image: user.image,
          role: user.role,
          isVerified: user.isVerified,
          fullName: user.fullName,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session: newSessionData }) { // Renamed session to newSessionData to avoid conflict
      // On initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.name = user.name;
        token.picture = user.image;
        token.fullName = user.fullName;
      }
      // If session is updated (e.g., profile update)
      if (trigger === "update" && newSessionData?.user) {
        token.name = newSessionData.user.name;
        token.picture = newSessionData.user.image;
        // Potentially update other fields if they can be changed and you want them in the token
        if (newSessionData.user.fullName) token.fullName = newSessionData.user.fullName;
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
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    // signOut: '/auth/signout',
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (UNUSED) Used for email/passwordless login
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave an empty string to disable)
  },
  secret: process.env.NEXTAUTH_SECRET,
  // debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
