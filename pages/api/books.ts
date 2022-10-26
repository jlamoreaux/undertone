import path from "path";
import { promises as fs } from "fs";
import { NextApiRequest, NextApiResponse } from "next";

const getBooks = async (req: NextApiRequest, res: NextApiResponse) => {
  const jsonDirectory = path.join(process.cwd(), "json");
  const fileContents = await fs.readFile(jsonDirectory + "/books.json", "utf8");

  const id = req.query.id;

  if (!id) {
    const books = JSON.parse(fileContents);
    return res.status(200).json(books);
  }

  if (isNaN(Number(id))) {
    res.status(400).end();
  }
  if (id) {
    const book = JSON.parse(fileContents)[Number(id)];
    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).end();
    }
    return;
  }
}

export default getBooks;