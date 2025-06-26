import { Hono } from "hono";
import {
  getAllProducts,
  createProduct,
  getProductById,
  updateProductById,
  deleteProductById,
  // other controller imports
} from "../controllers/product.controller";

const router = new Hono();

router.get("/", getAllProducts);
router.post("/", createProduct);
router.get("/:id", getProductById);
router.patch("/:id", updateProductById);
router.delete("/:id", deleteProductById);

export default router;
