
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
    } & NextAuthUser; 
  }

  interface User extends NextAuthUser {
    role: Role;
    isVerified: boolean;
    fullName?: string | null;
    passwordHash?: string | null; // Added for internal use during authorize if needed, but not sent to client
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    isVerified: boolean;
    picture?: string | null;
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
          console.log("Authorize: User found but has no passwordHash (possibly OAuth user or error):", user.email);
          return null; // Or handle differently if you allow users without passwords
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
          name: user.name, // NextAuth expects name
          image: user.image, // NextAuth expects image
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
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.picture = session.user.image;
        token.fullName = session.user.fullName as string | null | undefined; // Type assertion if needed
      }
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.picture = user.image; 
        token.fullName = user.fullName;
        token.name = user.name; // Ensure name is in token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) { // Ensure token.id exists
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isVerified = token.isVerified;
        session.user.image = token.picture;
        session.user.name = token.name; 
        session.user.fullName = token.fullName;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  // debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
