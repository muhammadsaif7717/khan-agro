import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise, { dbName } from "@/lib/db";

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
      const cookieStore = await cookies();
      const sessionId = cookieStore.get("session_id")?.value;

      if (sessionId) {
        const session = await db.collection("sessions").findOne({ sessionId });
        if (session) {
          // Update active status
          await db.collection("sessions").updateOne(
            { sessionId },
            { $set: { lastActiveAt: new Date().toISOString() } }
          );
          return NextResponse.json({ authenticated: true });
        } else {
          // Session was deleted or expired
          cookieStore.delete("auth_token");
          cookieStore.delete("session_id");
          return NextResponse.json({ authenticated: false }, { status: 401 });
        }
      } else {
        // No session cookie, check legacy sessions count
        const activeSessionsCount = await db.collection("sessions").countDocuments({});
        if (activeSessionsCount < 3) {
          // Auto-generate session for this legacy login
          const newSessionId = "session_" + Math.random().toString(36).substring(2, 15);
          const userAgent = request.headers.get("user-agent") || "";
          const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

          await db.collection("sessions").insertOne({
            sessionId: newSessionId,
            device: getDeviceDetails(userAgent),
            ip: ip.split(",")[0].trim(),
            createdAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString()
          });

          cookieStore.set("session_id", newSessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
          });

          return NextResponse.json({ authenticated: true });
        } else {
          // Exceeded limit, reject
          cookieStore.delete("auth_token");
          return NextResponse.json({ authenticated: false }, { status: 401 });
        }
      }
    } else {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch (error: unknown) {
    console.error("POST /api/verify error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

function getDeviceDetails(userAgentStr: string) {
  const ua = userAgentStr;
  let os = "Unknown OS";
  let browser = "Unknown Browser";

  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh/i.test(ua)) os = "macOS";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/linux/i.test(ua)) os = "Linux";

  if (/chrome|crios/i.test(ua) && !/edge|opr/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome|crios|opr|edge/i.test(ua)) browser = "Safari";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/edge|edg/i.test(ua)) browser = "Edge";
  else if (/opr|opera/i.test(ua)) browser = "Opera";

  return `${os} (${browser})`;
}
