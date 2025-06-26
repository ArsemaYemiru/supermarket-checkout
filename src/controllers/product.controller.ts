import { Context } from "hono";
import Product from "../models/product.model";
import { isValidObjectId } from "mongoose";

export const getAllProducts = async (c: Context) => {
  try {
    const products = await Product.find();
    return c.json(products);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
};

export const createProduct = async (c: Context) => {
  const data = await c.req.json();
  const product = new Product(data);
  try {
    const saved = await product.save();
    return c.json(saved, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
};

export const getProductById = async (c: Context) => {
  const id = c.req.param("id");
  if (!isValidObjectId(id)) return c.json({ error: "Invalid ID" }, 400);

  try {
    const product = await Product.findById(id);
    if (!product) return c.json({ error: "Product not found" }, 404);
    return c.json(product);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
};

export const updateProductById = async (c: Context) => {
  const id = c.req.param("id");
  if (!isValidObjectId(id)) return c.json({ error: "Invalid ID" }, 400);

  const data = await c.req.json();
  try {
    const updated = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return c.json({ error: "Product not found" }, 404);
    return c.json(updated);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
};

export const deleteProductById = async (c: Context) => {
  const id = c.req.param("id");
  if (!isValidObjectId(id)) return c.json({ error: "Invalid ID" }, 400);

  try {
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return c.json({ error: "Product not found" }, 404);
    return c.json({ message: "Product deleted successfully" });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
};
