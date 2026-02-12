import { MongoClient, Collection, ObjectId as MongoObjectId } from "mongodb";

declare global {
  // Track MongoDB client promise across hot reloads
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI!;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!globalThis._mongoClientPromise) {
  client = new MongoClient(uri);
  clientPromise = client.connect();
  globalThis._mongoClientPromise = clientPromise;
} else {
  clientPromise = globalThis._mongoClientPromise;
}

export async function getCollection(): Promise<Collection> {
  const client = await clientPromise;
  const db = client.db("festival"); // DB name
  return db.collection("artists"); // Collection name
}

export { MongoObjectId as ObjectId };
