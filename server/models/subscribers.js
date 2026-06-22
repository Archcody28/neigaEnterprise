import mongoose from "mongoose";

const subscriberSchema =
  new mongoose.Schema({

    email: {
      type: String,
      required: true,
      unique: true
    }

  }, {
    timestamps: true
  });

export default mongoose.model(
  "Subscriber",
  subscriberSchema
);
