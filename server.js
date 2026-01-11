const mongoose = require("mongoose");

require("dotenv/config");
const app = require("./app");

mongoose.connect(process.env.CONNECTION_DB).then(() => {
  console.log("Connected to DB successfully");
});

app.listen(3000, () => {
  console.log("Server running on port 3000 ");
});
