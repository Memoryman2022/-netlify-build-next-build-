import { NextRequest, NextResponse } from "next/server";
import { getCollection, ObjectId } from "../../lib/mongodb";

export type Artist = {
  _id?: string;
  name: string;
  response: "Yes" | "No";
  available: "Yes" | "No";
  cost: number;
  saved?: boolean;
};

type BulkUpdateRequest = {
  ids: string[];
  field: keyof Artist;
  value: Artist[keyof Artist];
};

type SingleUpdateRequest = {
  field: keyof Artist;
  value: Artist[keyof Artist];
};

// GET all artists
export async function GET() {
  const collection = await getCollection();
  const artists = await collection.find().toArray();
  // Convert MongoDB ObjectId to string
  const formatted = artists.map((a) => ({ ...a, _id: a._id.toString() }));
  return NextResponse.json(formatted);
}

// POST new artist
export async function POST(req: NextRequest) {
  const data: Omit<Artist, "_id"> = await req.json();
  const collection = await getCollection();

  const result = await collection.insertOne(data);
  const newArtist = await collection.findOne({ _id: result.insertedId });
  return NextResponse.json({ ...newArtist, _id: newArtist!._id.toString() });
}

// PATCH single or bulk update
export async function PATCH(req: NextRequest) {
  const body: BulkUpdateRequest | SingleUpdateRequest = await req.json();
  const collection = await getCollection();

  // Bulk update
  if ("ids" in body && Array.isArray(body.ids)) {
    const ops = body.ids.map((id) =>
      collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { [body.field]: body.value } }
      )
    );
    await Promise.all(ops);
    return NextResponse.json({ updated: body.ids.length });
  }

  // If it's a single update without ids, return 400
  return NextResponse.json({ error: "Invalid PATCH request, missing ids for bulk update" }, { status: 400 });
}
