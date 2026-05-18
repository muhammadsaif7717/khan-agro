import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise, { dbName } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Missing credentials" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    
    // Fetch the single admin document
    const adminDoc = await db.collection("admin").findOne({});
    
    if (!adminDoc) {
      return NextResponse.json({ success: false, message: "Admin not found in DB" }, { status: 401 });
    }

    // Compare username and password with bcrypt
    const usernameMatch = await bcrypt.compare(username, adminDoc.username);
    const passwordMatch = await bcrypt.compare(password, String(adminDoc.password));

    if (usernameMatch && passwordMatch) {
      // Set the auth_token cookie for Next.js Middleware protection
      const cookieStore = await cookies();
      cookieStore.set("auth_token", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });

      return NextResponse.json({ 
        success: true, 
        message: "Login successful",
        hashes: {
          username: adminDoc.username,
          password: adminDoc.password
        }
      });
    } else {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }
  } catch (error: unknown) {
    console.error("POST /api/login error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
