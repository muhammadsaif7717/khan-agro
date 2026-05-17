/* eslint-disable @typescript-eslint/no-require-imports */
const { MongoClient } = require("mongodb");

async function main() {
  // ── Read MONGODB_URI from environment variables ──
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ ERROR: MONGODB_URI is not defined in environment variables!");
    console.log("👉 Please run the script using Node's env-file flag:");
    console.log("   node --env-file=.env.local test_mongo.js\n");
    process.exit(1);
  }

  console.log("🔌 Connecting to MongoDB Cluster using URI from env file...");
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  });

  try {
    await client.connect();
    console.log("✅ Successfully connected to MongoDB Database!");

    const db = client.db("khan_agro");
    const testCollection = db.collection("test_crud");

    console.log("\n🚀 Starting CRUD Test Operations...");

    // 1. CREATE Operation
    console.log("\n📝 [1/4] Performing CREATE Operation...");
    const sampleRecord = {
      farm_id: "khan_agro_test_001",
      name: "Standard test record",
      description: "Verifying CRUD functions using MONGODB_URI",
      status: "active",
      createdAt: new Date(),
    };
    const insertResult = await testCollection.insertOne(sampleRecord);
    console.log(`🟢 Successfully inserted record! InsertedId: ${insertResult.insertedId}`);

    // 2. READ Operation
    console.log("\n📖 [2/4] Performing READ Operation...");
    const fetchedRecord = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log("🟢 Successfully fetched record from database:");
    console.log(JSON.stringify(fetchedRecord, null, 2));

    // 3. UPDATE Operation
    console.log("\n🔄 [3/4] Performing UPDATE Operation...");
    const updateResult = await testCollection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { status: "verified", name: "Premium verified test record", updatedAt: new Date() } }
    );
    console.log(`🟢 Successfully updated record! ModifiedCount: ${updateResult.modifiedCount}`);

    // Read again to verify the update
    const updatedRecord = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log("🟢 Fetched updated record from database:");
    console.log(JSON.stringify(updatedRecord, null, 2));

    // 4. DELETE Operation
    console.log("\n🗑️ [4/4] Performing DELETE Operation (Cleanup)...");
    const deleteResult = await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log(`🟢 Successfully deleted record! DeletedCount: ${deleteResult.deletedCount}`);

    console.log("\n🎉 ALL CRUD OPERATIONS COMPLETED SUCCESSFULLY!");

  } catch (err) {
    console.error("❌ DATABASE OPERATIONS FAILED:", err.message || err);
  } finally {
    await client.close();
    console.log("\n🔌 Disconnected from MongoDB safely.");
  }
}

main();
