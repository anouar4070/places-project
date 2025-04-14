const express = require("express");
const HttpError = require("../models/http-error");

const router = express.Router();

const DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: "u1",
  },
];

router.get("/:pid", (req, res, next) => {
  const placeId = req.params.pid; // { pid: 'p1' }
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });

  if (!place) {
    throw new HttpError("Could not find a place for the provided id.", 404);
  }

  res.json({ place }); // { place: place }
});

router.get("/user/:uid", (req, res, next) => {
  const userId = req.params.uid; // { pid: 'p1' }
  const place = DUMMY_PLACES.find((p) => {
    return p.creator === userId;
  });

  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided user id.", 404)
    );
  }

  res.json({ place }); // { place: place }
});

module.exports = router;

/**
 next(error) is the recommended way to handle errors in Express.
✅ It's clean, Express-standard, and works well with asynchronous code.
❗ But it's specific to Express — not a general JavaScript pattern.

throw error is natural in plain JavaScript.
✅ Simple and intuitive.
❗ But not ideal in Express routes — it can crash the app or bypass Express error handling unless used with try/catch and next().
 */

/**
 //                 *** Without using Error Model ***
//0-
     const error = new Error('Could not find a place for the provided id.');
     error.code = 404;
     throw error; // this one trigger the error handling middleware
//1-
     const error = new Error('Could not find a place for the provided user id.');
     error.code = 404;
     return next(error);

//     *** Using neither an Error model nor an error middleware in "app.js" ***
//2- 
      return res
      .status(404)
       .json({ message: "Could not find a place for the provided user id." });

 */
