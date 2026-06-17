import { NextResponse } from "next/server";
import clientPromise, { dbName } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  let requestLang = "bn";
  try {
    const body = await request.json();
    const { oldPassword, newUsername, newPassword, language } = body;
    if (language) {
      requestLang = language;
    }
    
    if (!oldPassword) {
      const err = requestLang === "en" ? "Current password is required!" : "বর্তমান পাসওয়ার্ড আবশ্যক!";
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    
    // Fetch the single admin document
    const adminDoc = await db.collection("admin").findOne({});
    
    if (!adminDoc) {
      const err = requestLang === "en" ? "Admin not found!" : "অ্যাডমিন পাওয়া যায়নি!";
      return NextResponse.json({ success: false, error: err }, { status: 404 });
    }

    // Verify the old password before allowing changes
    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, String(adminDoc.password));
    if (!isOldPasswordCorrect) {
      const err = requestLang === "en" ? "Incorrect current password!" : "বর্তমান পাসওয়ার্ড ভুল!";
      return NextResponse.json({ success: false, error: err }, { status: 401 });
    }

    // Prepare updates
    const updates: Record<string, string> = {};
    const SALT_ROUNDS = 14;

    if (newUsername) {
      updates.username = await bcrypt.hash(newUsername, SALT_ROUNDS);
    }
    
    if (newPassword) {
      updates.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    }

    if (Object.keys(updates).length > 0) {
      await db.collection("admin").updateOne(
        { _id: adminDoc._id },
        { $set: updates }
      );
    }
    
    // Fetch the updated doc to return the new hashes
    const updatedAdminDoc = await db.collection("admin").findOne({ _id: adminDoc._id });
    
    const msg = requestLang === "en" ? "Credentials updated successfully!" : "ক্রেডেনশিয়ালস পরিবর্তন সফল হয়েছে!";
    return NextResponse.json({ 
      success: true, 
      message: msg,
      hashes: {
        username: updatedAdminDoc?.username,
        password: updatedAdminDoc?.password
      }
    });
  } catch (error: unknown) {
    console.error("PUT /api/credentials error:", error);
    const err = requestLang === "en" ? "Server error" : "সার্ভার এরর";
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}
