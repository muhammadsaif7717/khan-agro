import { NextResponse } from "next/server";
import clientPromise, { dbName } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { hashedUsername, hashedPassword } = await request.json();
    if (!hashedUsername || !hashedPassword) {
      return NextResponse.json({ authenticated: false }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    
    // Fetch the single admin document
    const adminDoc = await db.collection("admin").findOne({});
    
    if (!adminDoc) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Direct comparison of hashes
    if (adminDoc.username === hashedUsername && String(adminDoc.password) === String(hashedPassword)) {
      return NextResponse.json({ authenticated: true });
    } else {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch (error: unknown) {
    console.error("POST /api/verify error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
