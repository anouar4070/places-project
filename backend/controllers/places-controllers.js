const uuid = require("uuid/v4");

const fs = require("fs");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

// let DUMMY_PLACES = [
//   {
//     id: "p1",
//     title: "Empire State Building",
//     description: "One of the most famous sky scrapers in the world!",
//     location: {
//       lat: 40.7484405,
//       lng: -73.9878584,
//     },
//     address: "20 W 34th St, New York, NY 10001",
//     creator: "u1",
//   },
// ];

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; // { pid: 'p1' }

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "Could not find place for the provided id.",
      404
    );
    return next(error);
  }

  //res.json({ place }); // { place: place }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // const places = DUMMY_PLACES.filter((p) => {
  //   return p.creator === userId;
  // });

  //let places;

  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later.",
      500
    );
    return next(error);
  }

  // if (!places || places.length === 0) {
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user id.", 404)
    );
  }

  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  // ⚠️ NOTE: This validation requires corresponding route-level validation middleware using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  //const createdPlace = {id: uuidv4(), title, description, location: coordinates,address,creator,};

  // DUMMY_PLACES.push(createdPlace); //unshift(createdPlace)

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId,
  });

  let user;
  try {
    // Try to find the user in the database by their ID (creator)
    user = await User.findById(req.userData.userId);
  } catch (err) {
    // If there's an error during the database operation, return a 500 error
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }
  // If no user is found with the provided ID, return a 404 error
  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  console.log(user);

  try {
    // Start a new session for transaction
    const sess = await mongoose.startSession();
    sess.startTransaction();
    // Save the new place within the session
    await createdPlace.save({ session: sess });
    // Link the place to the user
    user.places.push(createdPlace);
    // Save the updated user within the session
    await user.save({ session: sess });
    // Finalize the transaction (apply all changes)
    await sess.commitTransaction();
  } catch (err) {
    // On error, the transaction will be rolled back automatically
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }
  // Return a 201 response with the newly created place
  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }

  //           *** Authorization ***
  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this place.", 401);
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }

  //DUMMY_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

// const deletePlace = (req, res, next) => {
//   const placeId = req.params.pid;
//   if (!DUMMY_PLACES.find((p) => p.id !== placeId)) {
//     throw new HttpError("Could not find a place for that ID.", 404);
//   }

//   DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
//   res.status(200).json({ message: "Deleted Place." });
// };

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    // .populate("creator") replaces the creator's ID with the full user document,
    // allowing direct access and modification (e.g., removing a place).
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError("Could not find place for this id.", 404);
    return next(error);
  }

  //           *** Authorization ***
  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this place.",
      401
    );
    return next(error);
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
    //await place.remove();
    //await place.deleteOne(); // 👈 preferred over remove()
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
