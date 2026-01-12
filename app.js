const express = require("express");
const categoriesRouter = require("./src/routes/categoryRoutes");
const ProductsRouter = require("./src/routes/productRoutes");

const app = express();

app.use(express.json());
// app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", ProductsRouter);
app.use("/api/v1/categories", categoriesRouter);
// app.use("/api/v1/users", usersRouter);

module.exports = app;
