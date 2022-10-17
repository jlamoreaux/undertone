import path from "path";
import { promises as fs } from "fs";
import { NextApiRequest, NextApiResponse } from "next";

const getBooks = async (req: NextApiRequest, res: NextApiResponse) => {
  const jsonDirectory = path.join(process.cwd(), "json");
  const fileContents = await fs.readFile(jsonDirectory + "/books.json", "utf8");

  const {id} = req.query
  if (id) {
    const book = JSON.parse(fileContents)[Number(id)];
    if (book) {
      res.status(200).json(book);
    } else {
      res.status(400).end();
    }
    return;
  }
  const books = JSON.parse(fileContents);
  return res.status(200).json(books);
}

export default getBooks; 