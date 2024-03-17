import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    // Find the last document in descending order of createdAt
    const lastDocument = await prisma.ballEvent.findFirst({
      orderBy: {
        createdAt: "desc", // Ordering by createdAt field in descending order
      },
    });

    console.log(lastDocument);

    if (!lastDocument) {
      return NextResponse.json(
        { error: "No documents found in the collection" },
        { status: 404 },
      );
    }

    await prisma.ballEvent.delete({
      where: {
        id: lastDocument.id,
      },
    });

    return NextResponse.json({ message: "Document deleted" }, { status: 202 });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
