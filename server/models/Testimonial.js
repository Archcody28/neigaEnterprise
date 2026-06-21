import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    frontImage: String,
    backImage: String,
    quote: String,
    author: String
  },
  { timestamps: true }
);

export default mongoose.model("Testimonial", testimonialSchema);