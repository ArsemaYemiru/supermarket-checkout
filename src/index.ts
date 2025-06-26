import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";
import connectDB from "./db/connect";

import productRoutes from "./routes/product.routes";
import userRoutes from "./routes/user.routes";
import orderRoutes from "./routes/order.routes";

const app = new Hono();

app.use("*", poweredBy());
app.use("*", logger());

// Mount routes
app.route("/products", productRoutes);
app.route("/users", userRoutes);
app.route("/orders", orderRoutes);

// Connect DB and start server
(async () => {
  await connectDB();

  Bun.serve({
    fetch: app.fetch,
    port: 3000,
  });
})();

console.log("🚀 Server running at http://localhost:3000");
