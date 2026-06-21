import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      default: "Guest Customer"
    },

    customerPhone: {
      type: String,
      default: ""
    },

    note: {
      type: String,
      default: ""
    },

    items: [
      {
        name: {
          type: String,
          required: true
        },

        price: {
          type: Number,
          required: true
        },

        image: String,

        qty: {
          type: Number,
          required: true,
          default: 1
        }
      }
    ],

    total: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;