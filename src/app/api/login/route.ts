import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise, { dbName } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  let requestLang = "bn";
  try {
    const { username, password, logoutAll, language } = await request.json();
    if (language) {
      requestLang = language;
    }
    if (!username || !password) {
      const err = requestLang === "en" ? "Please enter your username and password!" : "ব্যবহারকারী নাম ও পাসওয়ার্ড দিন!";
      return NextResponse.json({ success: false, message: err }, { status: 400 });
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
      if (logoutAll) {
        await db.collection("sessions").deleteMany({});
      } else {
        // Check session limit (max 3 concurrent active sessions)
        const activeSessionsCount = await db.collection("sessions").countDocuments({});
        if (activeSessionsCount >= 3) {
          const limitMsg = requestLang === "en"
            ? "For security reasons, you cannot log in to more than 3 devices at the same time. Please log out from another device."
            : "নিরাপত্তাজনিত কারণে ৩টির বেশি ডিভাইসে একসাথে লগইন করা সম্ভব নয়। দয়া করে অন্য কোনো ডিভাইস থেকে লগআউট করুন।";
          return NextResponse.json({ 
            success: false, 
            limitReached: true, 
            message: limitMsg 
          }, { status: 403 });
        }
      }

      const sessionId = "session_" + Math.random().toString(36).substring(2, 15);
      const userAgent = request.headers.get("user-agent") || "";
      const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

      await db.collection("sessions").insertOne({
        sessionId,
        device: getDeviceDetails(userAgent),
        ip: ip.split(",")[0].trim(),
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      });

      // Set cookies
      const cookieStore = await cookies();
      cookieStore.set("auth_token", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
      cookieStore.set("session_id", sessionId, {
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
      const err = requestLang === "en" ? "Incorrect username or password" : "ভুল ব্যবহারকারী নাম অথবা পাসওয়ার্ড";
      return NextResponse.json({ success: false, message: err }, { status: 401 });
    }
  } catch (error: unknown) {
    console.error("POST /api/login error:", error);
    const err = requestLang === "en" ? "Server error" : "সার্ভারে সমস্যা হয়েছে!";
    return NextResponse.json({ success: false, message: err }, { status: 500 });
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
