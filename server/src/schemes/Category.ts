import { Document, Schema, model } from "mongoose";

export interface ICategory {
  name: string;
}
const categorySchema = new Schema<ICategory & Document>({
  name: { type: String, required: true, unique: true },
});

export const Category = model("Category", categorySchema);
