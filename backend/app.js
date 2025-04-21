require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  //Allows all domains (*) to access the server's resources.
  res.setHeader("Access-Control-Allow-Origin", "*");
  //Specifies the headers allowed in incoming requests.
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  //Indicates which HTTP methods are permitted for cross-origin requests.
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

//Handling Errors for Unsupported Routes
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

// Global Error Handling Middleware
// This will catch any errors passed through next(error) or thrown in previous middleware/routes
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to database!");
    app.listen(5000);
  })
  .catch((err) => console.log(err));

/**
                          *** using CORS ***
1/ npm install cors

2/
       const cors = require('cors');

        app.use(cors({
         origin: '*', // or specify origin like 'http://localhost:3000'
         methods: ['GET', 'POST', 'PATCH', 'DELETE'],
         allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
        }));

   */
