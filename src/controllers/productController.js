const Product = require("../models/Product");
const Category = require("../models/Category");

const getProducts = async (req, res) => {
  try {
    /*Pagination */
    const page = req.query.page || 1;
    const limit = req.query.limit || 3;
    const skip = (page - 1) * limit;

    /*Filter: if we have one category or more then we split and save them
    in the filter object, and it's gonna filter the cars that it's category 
    are IN the filter */
    const filter = {};
    // if (req.query.category) {
    //   const categories = req.query.category.split(",");
    //   filter.category = { $in: categories };
    // }

    if (req.query.brand) {
      const brands = req.query.brand.split(",");
      filter.brand = { $in: brands };
    }

    if (req.query.price) {
      const maxPrice = req.query.price;
      filter.price = { $lte: Number(maxPrice) };
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
      return res.status(400).json({
        message: "no products exist",
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

    if (!req.files || req.files.length !== 3) {
      return res.status(400).json({ message: "3 images are required" });
    }

    const imageUrls = req.files.map((file) => file.path);

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
      colors: req.body.colors,
      spec: req.body.spec,
      category: req.body.category,
    });

    const newProduct = await product.save();
    const populatedProduct = await Product.findById(newProduct._id).populate(
      "category",
      "name"
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
      "name"
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

const updateProduct = async (req, res) => {
  try {
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid Category" });
    }

    let imageUrls = existingProduct.images;

    if (req.files && req.files.length > 0) {
      // if (req.files !== 3) {
      //   return res.status(400).json({ message: "3 images are required" });
      // }

      imageUrls = req.files.map(
        (file, i) => file.path ?? existingProduct.req.files[i]
      );
    }

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
        colors: req.body.colors ?? existingProduct.colors,
        spec: req.body.spec ?? existingProduct.spec,
        images: imageUrls,
        category: req.body.category ?? existingProduct.category,
      },
      { new: true }
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

module.exports = { getProducts, createProduct, getProductById, updateProduct, deleteProduct };
