import { NextResponse } from "next/server";
import clientPromise, { dbName } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { oldPassword, newUsername, newPassword } = body;
    
    if (!oldPassword) {
      return NextResponse.json({ success: false, error: "বর্তমান পাসওয়ার্ড আবশ্যক!" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    
    // Fetch the single admin document
    const adminDoc = await db.collection("admin").findOne({});
    
    if (!adminDoc) {
      return NextResponse.json({ success: false, error: "অ্যাডমিন পাওয়া যায়নি!" }, { status: 404 });
    }

    // Verify the old password before allowing changes
    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, String(adminDoc.password));
    if (!isOldPasswordCorrect) {
      return NextResponse.json({ success: false, error: "বর্তমান পাসওয়ার্ড ভুল!" }, { status: 401 });
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
    
    return NextResponse.json({ 
      success: true, 
      message: "ক্রেডেনশিয়ালস পরিবর্তন সফল হয়েছে!",
      hashes: {
        username: updatedAdminDoc?.username,
        password: updatedAdminDoc?.password
      }
    });
  } catch (error: unknown) {
    console.error("PUT /api/credentials error:", error);
    return NextResponse.json({ success: false, error: "সার্ভার এরর" }, { status: 500 });
  }
}
