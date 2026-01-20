const express = require("express");
const {
  getProducts,
  createProduct,
  getProductById,
  getNewArrivalProducts,
  getFeaturedProducts,
  getBestSellerProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const upload = require("../middleware/uploadMiddleware");

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const router = express.Router();

router.get("/", getProducts);
router.post("/", adminMiddleware, upload.array("images", 4), createProduct);
router.get(
  "/new-arrivals",
  getNewArrivalProducts,
);
router.get("/featured", getFeaturedProducts);
router.get(
  "/best-sellers",
  getBestSellerProducts,
);

router.get("/:id", authMiddleware, adminMiddleware, getProductById);
router.put("/:id", adminMiddleware, upload.array("images", 4), updateProduct);
router.delete("/:id", adminMiddleware, deleteProduct);

module.exports = router;
