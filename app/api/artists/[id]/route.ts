import { NextRequest, NextResponse } from "next/server";
import { getCollection, ObjectId } from "../../../lib/mongodb";

type Artist = {
  _id?: string;
  name: string;
  response: "Yes" | "No";
  available: "Yes" | "No";
  cost: number;
  saved?: boolean;
};

type ArtistField = keyof Omit<Artist, "_id">; // all fields except _id

type SingleUpdateBody = {
  field: ArtistField;
  value: string | number | boolean;
};

type BulkUpdateBody = {
  ids: string[];
  field: ArtistField;
  value: string | number | boolean;
};

// PATCH single artist OR bulk update
export async function PATCH(
  req: NextRequest,
  context: { params?: Promise<{ id: string }> }
) {
  const collection = await getCollection();
  const body: SingleUpdateBody | BulkUpdateBody = await req.json();

  // Bulk update (save-selected)
  if ("ids" in body && Array.isArray(body.ids)) {
    const ops = body.ids.map((id: string) =>
      collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { [body.field]: body.value } }
      )
    );
    await Promise.all(ops);
    return NextResponse.json({ updated: body.ids.length });
  }

  // Single artist update
  if (!context.params) {
    return NextResponse.json(
      { error: "Missing artist ID" },
      { status: 400 }
    );
  }

  const { id } = await context.params;
  const artistId = new ObjectId(id);

  const { field, value } = body as SingleUpdateBody;
  if (!field || value === undefined) {
    return NextResponse.json(
      { error: "Missing field or value" },
      { status: 400 }
    );
  }

  await collection.updateOne({ _id: artistId }, { $set: { [field]: value } });
  const updatedArtist = await collection.findOne({ _id: artistId });

  return NextResponse.json({
    ...updatedArtist,
    _id: updatedArtist!._id.toString(),
  });
}
