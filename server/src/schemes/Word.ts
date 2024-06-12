import { Document, Schema, model } from "mongoose";
import { ICategory } from "./Category";

export interface IWord {
  value: string;
  categories: ICategory[];
}

const wordSchema = new Schema<IWord & Document>({
  value: { type: String, required: true },
  categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
});

export const Word = model("Word", wordSchema);
