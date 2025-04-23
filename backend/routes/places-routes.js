const express = require('express');
const { check } = require('express-validator');

const placesControllers = require('../controllers/places-controllers');

const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);

router.post(
  '/',
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address')
      .not()
      .isEmpty()
  ],
  placesControllers.createPlace
);

router.patch(
  '/:pid',
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);

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
