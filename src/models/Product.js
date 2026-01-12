const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    brand: {
      type: String,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
    },

    isBestSeller: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    new: {
      type: Boolean,
      default: false,
    },

    colors: {
      type: [String],
      default: [],
    },

    spec: {
      type: Map,
      of: String,
      default: {},
    },

    images: {
      type: [String],
      required: true,
      validate: [(arr) => arr.length === 4, "4 images required"],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
