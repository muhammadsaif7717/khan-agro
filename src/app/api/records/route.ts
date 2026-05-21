import { NextResponse } from "next/server";
import clientPromise, { dbName } from "@/lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    
    const data = await db.collection("farm_data").findOne({ _id: "dashboard_data" as unknown as import("mongodb").ObjectId });
    
    if (!data) {
      return NextResponse.json({
        income: [],
        expense: [],
        donation: [],
        withdraw: [],
        investment: [],
        reinvestment: [],
        returnedCash: [],
        savedTotals: {}
      });
    }
    
    // Return document fields (excluding _id)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rest } = data;
    return NextResponse.json(rest);
  } catch (error: unknown) {
    console.error("GET /api/records database offline fallback:", (error as Error).message);
    return NextResponse.json({
      income: [],
      expense: [],
      donation: [],
      withdraw: [],
      investment: [],
      reinvestment: [],
      returnedCash: [],
      savedTotals: {},
      dbOffline: true
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db(dbName);
    
    const { income, expense, donation, withdraw, investment, reinvestment, returnedCash, savedTotals } = body;
    
    // Validate inputs
    const payload = {
      income: Array.isArray(income) ? income : [],
      expense: Array.isArray(expense) ? expense : [],
      donation: Array.isArray(donation) ? donation : [],
      withdraw: Array.isArray(withdraw) ? withdraw : [],
      investment: Array.isArray(investment) ? investment : [],
      reinvestment: Array.isArray(reinvestment) ? reinvestment : [],
      returnedCash: Array.isArray(returnedCash) ? returnedCash : [],
      savedTotals: savedTotals && typeof savedTotals === "object" ? savedTotals : {},
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("farm_data").updateOne(
      { _id: "dashboard_data" as unknown as import("mongodb").ObjectId },
      { $set: payload },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true, message: "ডাটাবেজে সংরক্ষণ সফল হয়েছে!" });
  } catch (error: unknown) {
    console.error("POST /api/records database offline error:", (error as Error).message);
    return NextResponse.json({ error: "Database offline", dbOffline: true }, { status: 503 });
  }
}
