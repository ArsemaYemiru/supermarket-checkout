import { Hono } from "hono";
import {
  createOrder,
  getAllOrders,
  getOrderById,
} from "../controllers/order.controller";

const router = new Hono();

router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);

export default router;
