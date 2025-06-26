import { Context } from "hono";
import Order from "../models/order.model";
import Product from "../models/product.model";
import User from "../models/user.model";

export const createOrder = async (c: Context) => {
  const body = await c.req.json();
  const { userId, items } = body;

  try {
    // Fetch user
    const user = await User.findById(userId);
    if (!user) return c.json({ error: "User not found" }, 404);

    // Calculate user age from DateOfBirth
    const birthDate = new Date(user.DateOfBirth);
    const today = new Date();
    let userAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      userAge--;
    }

    let total = 0;
    let discountedAmount = 0;
    const productRefs = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return c.json(
          { error: `Product with ID ${item.productId} not found` },
          404
        );
      }

      // Check age restriction
      const ageReq = product.age_required;
      if (ageReq?.required && ageReq.age) {
        if (userAge < ageReq.age) {
          return c.json(
            {
              error: `User is underage for product: ${product.name}`,
              requiredAge: ageReq.age,
              userAge,
            },
            403
          );
        }
      }

      const quantity = item.quantity;
      const price = product.price;
      const discountRate = product.discount ? product.discount / 100 : 0;

      const originalCost = price * quantity;
      const discountValue = originalCost * discountRate;
      const finalCost = originalCost - discountValue;

      total += finalCost;
      discountedAmount += discountValue;

      productRefs.push({
        product: product._id,
        quantity,
      });
    }

    const newOrder = await Order.create({
      user: user._id,
      products: productRefs,
      totalAmount: total,
      discountedAmount,
    });

    return c.json(newOrder, 201);
  } catch (err: any) {
    return c.json({ error: err.message || "Internal server error" }, 500);
  }
};

export const getAllOrders = async (c: Context) => {
  try {
    const order = await Order.find()
      .populate("user")
      .populate("products.product");

    if (!order) return c.json({ error: "Order not found" }, 404);
    return c.json(order);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
};

export const getOrderById = async (c: Context) => {
  const id = c.req.param("id");

  try {
    const order = await Order.findById(id)
      .populate("user")
      .populate("products.product");

    if (!order) return c.json({ error: "Order not found" }, 404);
    return c.json(order);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
};
