import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise, { dbName } from "@/lib/db";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  if (sessionId) {
    try {
      const client = await clientPromise;
      const db = client.db(dbName);
      await db.collection("sessions").deleteOne({ sessionId });
    } catch (e) {
      console.error("Logout session deletion error:", e);
    }
  }

  cookieStore.delete("auth_token");
  cookieStore.delete("session_id");
  return NextResponse.json({ success: true });
}
