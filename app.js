const express = require("express");
const categoriesRouter = require("./src/routes/categoryRoutes");
const productsRouter = require("./src/routes/productRoutes");
const usersRouter = require("./src/routes/userRoutes");
const authRouter = require("./src/routes/authRoutes");
const authJwt = require("./src/auth/jwt");

const app = express();

app.use(authJwt());
app.use(express.json());
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/users", usersRouter);

module.exports = app;
