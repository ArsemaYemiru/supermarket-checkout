import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "bun:test";
import mongoose from "mongoose";
import "dotenv/config"; 
import Product from "../models/product.model";

const MONGODB_URL = process.env.MONGODB_URL;

beforeAll(async () => {
  if (!MONGODB_URL) throw new Error("MONGODB_URL not set in environment");
  await mongoose.connect(MONGODB_URL);
});

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  await Product.deleteMany({});
});

describe("Product Controller", () => {
  it("should create a product successfully", async () => {
    const productData = {
      name: "Bread",
      price: 5,
      description: "Fresh bread",
      age_required: { required: false, age: 0 },
      discount: 0,
    };
    const product = new Product(productData);
    const saved = await product.save();

    expect(saved._id).toBeDefined();
    expect(saved.name).toBe(productData.name);
  });

  it("should fail to create a product with missing required fields", async () => {
    const product = new Product({});
    let error;
    try {
      await product.save();
    } catch (err: any) {
      error = err;
    }
    expect(error).toBeDefined();
  });

  it("should get all products", async () => {
    await Product.create([
      {
        name: "Milk",
        price: 10,
        description: "Milk",
        age_required: { required: false, age: 0 },
        discount: 0,
      },
      {
        name: "Eggs",
        price: 3,
        description: "Eggs",
        age_required: { required: false, age: 0 },
        discount: 0,
      },
    ]);
    const products = await Product.find();
    expect(products.length).toBe(2);
  });

  it("should get product by valid ID", async () => {
    const product = await Product.create({
      name: "Cheese",
      price: 20,
      description: "Cheese",
      age_required: { required: false, age: 0 },
      discount: 0,
    });
    const found = await Product.findById(product._id);
    expect(found).not.toBeNull();
    expect(found!.name).toBe("Cheese");
  });

  it("should return null for non-existing product ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const product = await Product.findById(fakeId);
    expect(product).toBeNull();
  });

  it("should update a product", async () => {
    const product = await Product.create({
      name: "Butter",
      price: 8,
      description: "Butter",
      age_required: { required: false, age: 0 },
      discount: 0,
    });

    const updated = await Product.findByIdAndUpdate(
      product._id,
      { price: 9 },
      { new: true }
    );
    expect(updated).not.toBeNull();
    expect(updated!.price).toBe(9);
  });

  it("should delete a product", async () => {
    const product = await Product.create({
      name: "Yogurt",
      price: 4,
      description: "Yogurt",
      age_required: { required: false, age: 0 },
      discount: 0,
    });

    await Product.findByIdAndDelete(product._id);
    const deleted = await Product.findById(product._id);
    expect(deleted).toBeNull();
  });
});
