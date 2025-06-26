import { Schema, model, Types } from "mongoose";
import User from "./user.model";
import Product from "./product.model";

export interface IOrdersSchema {
  user: Types.ObjectId;
  products: {
    product: Types.ObjectId;
    quantity: number;
  }[];
  totalAmount: number;
  status: string;
  discountedAmount: number;
}

const orderSchema = new Schema<IOrdersSchema>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    discountedAmount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

//  Pre-save validation logic
orderSchema.pre("save", async function (next) {
  const order = this as any;

  const user = await User.findById(order.user);
  if (!user) return next(new Error("User not found"));

  const birthDate = new Date(user.DateOfBirth);
  const today = new Date();
  const userAge = today.getFullYear() - birthDate.getFullYear();

  for (const item of order.products) {
    const product = await Product.findById(item.product);
    if (!product) {
      return next(new Error("Product not found"));
    }

    if (product.age_required?.required && userAge < product.age_required.age) {
      return next(new Error("User is underage for this product"));
    }
  }

  next();
});

export default model("Order", orderSchema);
