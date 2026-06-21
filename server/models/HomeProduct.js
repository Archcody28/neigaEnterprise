import mongoose from "mongoose";

const homeProductSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    description: String,
    image: String
  },
  { timestamps: true }
);

export default mongoose.model("HomeProduct", homeProductSchema);