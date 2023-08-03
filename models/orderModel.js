import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [{
        _id     : { type: mongoose.ObjectId, ref: 'Product', required: true },
        name   : { type: String, required: true },
        description    : { type: String, required: true },
        size    : { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      }
    ],
    payment: {}, 
    buyer: {
      type: mongoose.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      default: "No procesada",
      enum: ["No procesada", "Procesada", "Enviada", "Recibida", "Cancelada"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
