
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { clearTokenCookie } from "@/lib/auth-utils-node";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ message: "Logout berhasil." });
    clearTokenCookie(response);
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan saat logout." }, { status: 500 });
  }
}
