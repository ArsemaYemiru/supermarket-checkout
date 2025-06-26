import { Schema, model } from "mongoose";

export interface IProductsSchema {
  name: string;
  price: number;
  description: string;
  age_required: {
    required: boolean;
    age: number;
  };
  discount: number;
}

const ProductsSchema = new Schema<IProductsSchema>(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    age_required: {
      required: {
        type: Boolean,
        require: true,
        default: false,
      },
      age: {
        type: Number,
        required: false,
        default: 0,
      },
    },

    discount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

export default model("Product", ProductsSchema);
