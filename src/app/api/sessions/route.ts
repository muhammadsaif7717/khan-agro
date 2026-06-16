import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise, { dbName } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const currentSessionId = cookieStore.get("session_id")?.value;

    const client = await clientPromise;
    const db = client.db(dbName);

    const sessions = await db.collection("sessions").find({}).toArray();

    const formattedSessions = sessions.map((session) => ({
      id: session.sessionId,
      device: session.device || "Unknown Device",
      ip: session.ip || "Unknown IP",
      createdAt: session.createdAt,
      lastActiveAt: session.lastActiveAt,
      isCurrent: session.sessionId === currentSessionId
    }));

    // Sort: Current device first, then rest by login time descending
    formattedSessions.sort((a, b) => {
      if (a.isCurrent) return -1;
      if (b.isCurrent) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json(formattedSessions);
  } catch (error: unknown) {
    console.error("GET /api/sessions error:", error);
    return NextResponse.json({ error: "Failed to retrieve sessions" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const currentSessionId = cookieStore.get("session_id")?.value;

    const client = await clientPromise;
    const db = client.db(dbName);

    await db.collection("sessions").deleteOne({ sessionId });

    // If logging out the current session, clean cookies
    if (sessionId === currentSessionId) {
      cookieStore.delete("auth_token");
      cookieStore.delete("session_id");
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE /api/sessions error:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
