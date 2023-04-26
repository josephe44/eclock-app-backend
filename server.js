const express = require("express");
const dotenv = require("dotenv").config();
const { errorHandler } = require("./middleware/errorMiddleware");
const PORT = process.env.PORT || 5000;

const app = express();

// get data from body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Eclock App API",
  });
});

// Routes
app.use("/api/users", require("./routes/userRoutes"));

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server started ${PORT}`));
