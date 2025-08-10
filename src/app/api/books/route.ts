import path from "path";
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const jsonDirectory = path.join(process.cwd(), "json");
    const fileContents = await fs.readFile(jsonDirectory + "/books.json", "utf8");

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      const books = JSON.parse(fileContents);
      return NextResponse.json(books);
    }

    if (isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const book = JSON.parse(fileContents)[Number(id)];
    if (book) {
      return NextResponse.json(book);
    } else {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
  } catch (error) {

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
