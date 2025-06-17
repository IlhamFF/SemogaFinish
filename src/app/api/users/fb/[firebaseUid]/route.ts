
// This endpoint is specific to Firebase UID lookup and is no longer needed
// for the custom token-based authentication.
// It will be effectively deprecated or should be removed.
// Returning a 404 for now.

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { firebaseUid: string } }
) {
  return NextResponse.json({ message: "Endpoint tidak digunakan untuk sistem autentikasi saat ini." }, { status: 404 });
}
