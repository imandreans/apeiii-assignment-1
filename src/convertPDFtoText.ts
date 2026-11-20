import { PDFParse } from "pdf-parse";
import * as fs from "fs";

export async function convertPDFtoText(filename: string) {
  const dataBuffer = fs.readFileSync(filename);
  const parser = new PDFParse({ data: dataBuffer });
  const data = await parser.getText();
  return data.text;
}
