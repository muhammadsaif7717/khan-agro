/* eslint-disable @typescript-eslint/no-require-imports */
const { MongoClient } = require("mongodb");

async function main() {
  const uri = "mongodb://127.0.0.1:27017";
  const client = new MongoClient(uri);
  try {
    console.log("Connecting to local MongoDB...");
    await client.connect();
    console.log("Connected successfully!");
    const db = client.db("khan_agro");
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await client.close();
  }
}

main();
