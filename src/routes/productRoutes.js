const express = require("express");
const {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getProducts);
router.post("/", upload.array("images", 4), createProduct);
router.get("/:id", getProductById);
router.put("/:id", upload.array("images", 4), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
