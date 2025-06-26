// tests/order.controller.test.ts
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

import Order from "../models/order.model";
import User from "../models/user.model";
import Product from "../models/product.model";

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error("MONGODB_URL must be set in .env");
}

let adultUser: mongoose.Document & any;
let teenUser: mongoose.Document & any;
let regularProduct: mongoose.Document & any;
let ageRestrictedProduct: mongoose.Document & any;

beforeAll(async () => {
  // Connect to your real MongoDB instance (e.g. Docker container)
  await mongoose.connect(MONGODB_URL);

  // Clear collections before starting tests
  await User.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});

  // Create required users and products for tests
  adultUser = await User.create({
    name: "Adult",
    email: "adult@example.com",
    DateOfBirth: new Date("1990-01-01"),
  });

  teenUser = await User.create({
    name: "Teen",
    email: "teen@example.com",
    DateOfBirth: new Date("2010-01-01"),
  });

  regularProduct = await Product.create({
    name: "Bread",
    price: 10,
    description: "Fresh bread",
    age_required: { required: false, age: 0 },
    discount: 0,
  });

  ageRestrictedProduct = await Product.create({
    name: "Wine",
    price: 100,
    description: "Red wine",
    age_required: { required: true, age: 21 },
    discount: 10,
  });
});

beforeEach(async () => {
  // Clear orders before each test
  await Order.deleteMany({});
});

afterAll(async () => {
  // Cleanup: disconnect mongoose
  await mongoose.disconnect();
});

describe("Order Controller Logic", () => {
  it("should create an order with valid user and regular product", async () => {
    const order = await Order.create({
      user: adultUser._id,
      products: [{ product: regularProduct._id, quantity: 2 }],
      totalAmount: 20,
      discountedAmount: 0,
    });

    expect(order.totalAmount).toBe(20);
    expect(order.products).toHaveLength(1);
  });

  it("should apply discount correctly", async () => {
    const order = await Order.create({
      user: adultUser._id,
      products: [{ product: ageRestrictedProduct._id, quantity: 1 }],
      totalAmount: 90,
      discountedAmount: 10,
    });

    expect(order.totalAmount).toBe(90);
    expect(order.discountedAmount).toBe(10);
  });

  it("should reject an order if user is underage for a product", async () => {
    await expect(
      Order.create({
        user: teenUser._id,
        products: [{ product: ageRestrictedProduct._id, quantity: 1 }],
        totalAmount: 0,
        discountedAmount: 0,
      })
    ).rejects.toThrow(/underage/);
  });

  it("should throw error if product not found", async () => {
    await expect(
      Order.create({
        user: adultUser._id,
        products: [{ product: new mongoose.Types.ObjectId(), quantity: 1 }],
        totalAmount: 0,
        discountedAmount: 0,
      })
    ).rejects.toThrow(/not found/);
    
  });
});
