const Product = require("../models/Product");
const Category = require("../models/Category");

const getProducts = async (req, res) => {
  try {
    /*Pagination */
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    /*Filter: if we have one category or more then we split and save them
    in the filter object, and it's gonna filter the cars that it's category 
    are IN the filter */

    const filter = {};
    if (req.query.category) {
      const categories = req.query.category.split(",");
      filter.category = { $in: categories };
    }

    if (req.query.brand) {
      const brands = req.query.brand.split(",");
      filter.brand = { $in: brands };
    }

    if (req.query.priceRanges) {
      const ranges = req.query.priceRanges;
      const rangeArray = Array.isArray(ranges) ? ranges : [ranges];

      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: rangeArray.map((range) => {
          if (range.endsWith("+")) {
            const min = Number(range.replace("+", ""));
            return { price: { $gte: min } };
          }
          const [min, max] = range.split("-").map(Number);
          const condition = {};
          if (!isNaN(min)) condition.$gte = min;
          if (!isNaN(max)) condition.$lte = max;
          return { price: condition };
        }),
      });
    }

    /*The Promise.all: we wait for all the promises to resolve and then run */
    //we find the cars that match the filter, and the second promise to get the amount of the cars

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category")
        .sort({ createdAt: -1 }) //the recently created products will be at the beginning
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit); //how many page we've got left

    if (products.length === 0) {
      return res.status(200).json({
        data: [],
        total: 0,
        page,
        totalPages: 0,
      });
    }

    const response = {
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to gets products",
      error: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const categoryExists = await Category.findById(req.body.category);

    if (!categoryExists) {
      return res.status(400).json({ message: "Category doesn't exist" });
    }

    if (!req.files || req.files.length !== 4) {
      return res.status(400).json({ message: "4 images are required" });
    }

    const imageUrls = req.files.map((file) => file.path);

    const spec = {};
    Object.keys(req.body).forEach((key) => {
      console.log(key);
      if (key.startsWith("spec.")) {
        const specKey = key.replace("spec.", "");
        spec[specKey] = req.body[key];
      }
    });

    const hasIncomingSpec = Object.keys(spec).length > 0;

    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      images: imageUrls,
      price: req.body.price,
      brand: req.body.brand,
      discount: req.body.discount,
      isBestSeller: req.body.isBestSeller,
      isFeatured: req.body.isFeatured,
      new: req.body.new,
      salesCount: req.body.salesCount,
      colors: req.body.colors,
      spec: hasIncomingSpec ? spec : {},
      category: req.body.category,
    });

    const newProduct = await product.save();
    const populatedProduct = await Product.findById(newProduct._id).populate(
      "category",
      "name",
    );

    res.status(201).json(populatedProduct);
  } catch (error) {
    console.log("Error details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name",
    );
    if (!product) {
      console.log(product);
      return res.status(400).json({
        message: "product not found!",
      });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

const getNewArrivalProducts = async (req, res) => {
  try {
    const products = await Product.find({ new: true })
      .sort({ createdAt: -1 })
      .limit(5);
    return res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch newly created products",
      error: error.message,
    });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(5);
    return res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured products",
      error: error.message,
    });
  }
};

const getBestSellerProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ salesCount: -1 }).limit(6);
    return res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch best seller products",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const categoryExists = await Category.findById(existingProduct.category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid Category" });
    }

    let imageUrls = existingProduct.images;

    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(
        (file, i) => file.path ?? existingProduct.req.files[i],
      );
    }

    const spec = {};
    Object.keys(req.body).forEach((key) => {
      console.log(key);
      if (key.startsWith("spec.")) {
        const specKey = key.replace("spec.", "");
        spec[specKey] = req.body[key];
      }
    });

    const hasIncomingSpec = Object.keys(spec).length > 0;
    //we have to convert the object to a plain js object, because it has some internal methods of mongoose that we don't want to include in the response
    const existingSpecObj = existingProduct.spec
      ? existingProduct.spec.toObject()
      : {};

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name ?? existingProduct.name,
        description: req.body.description ?? existingProduct.description,
        price: req.body.price ?? existingProduct.price,
        brand: req.body.brand ?? existingProduct.brand,
        discount: req.body.discount ?? existingProduct.discount,
        isBestSeller: req.body.isBestSeller ?? existingProduct.isBestSeller,
        isFeatured: req.body.isFeatured ?? existingProduct.isFeatured,
        new: req.body.new ?? existingProduct.new,
        salesCount: req.body.salesCount ?? existingProduct.salesCount,
        colors: req.body.colors ?? existingProduct.colors,
        spec: hasIncomingSpec
          ? { ...existingSpecObj, ...spec }
          : existingSpecObj,
        images: imageUrls,
        category: req.body.category ?? existingProduct.category,
      },
      { new: true },
    ).populate("category", "name");

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update product!",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(400).json({ message: "Product Not Found" });
    }
    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  createProduct,
  getProductById,
  getNewArrivalProducts,
  getFeaturedProducts,
  getBestSellerProducts,
  updateProduct,
  deleteProduct,
};
