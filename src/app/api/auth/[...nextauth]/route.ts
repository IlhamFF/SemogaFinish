
// This file is no longer used for NextAuth.js as Firebase Authentication is in place.
// It's kept to avoid breaking existing file structure references during transition if any.
// It can be safely deleted once all NextAuth.js dependencies are removed.

// import "reflect-metadata"; 
// import NextAuth, { type NextAuthOptions, type User as NextAuthUser } from "next-auth";
// // ... (rest of the old NextAuth.js code) ...

// const handler = NextAuth(authOptions); // authOptions would be undefined now

// export { handler as GET, handler as POST };

export async function GET() {
  return new Response("NextAuth.js endpoint is deprecated. Using custom token auth.", { status: 404 });
}

export async function POST() {
  return new Response("NextAuth.js endpoint is deprecated. Using custom token auth.", { status: 404 });
}
