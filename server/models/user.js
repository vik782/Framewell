/**
 * @fileoverview Defines the user schema, including artefact data and user
 *               data, to implement data validation through datatype checks
 *               and encrypted checks
 * Dependencies
 * - Mongoose to validate data and connect to the MongoDB database
 * - BCrypt to implement encrypted security
 */

/* Imports of packages */
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/** {mongoose.Schema} schema for category */
const categorySchema = new mongoose.Schema({
  category_name: { type: String },
});

/** {mongoose.Schema} schema for people associated */
const associatedSchema = new mongoose.Schema({
  person: { type: String },
});

/** {mongoose.Schema} schema for artefact */
const artefactSchema = new mongoose.Schema({
  artefactName: {
    type: String,
    required: [true, "Artefact Name is Required"],
  },
  category: categorySchema,
  description: { type: String },
  memories: { type: String },
  associated: associatedSchema,
  location: { type: String },
  artefactDate: { type: Date },
  artefactImg: {
    imgURL: { type: String },
    imgName: { type: String },
    imgType: { type: String },
    imgSize: { type: String },
    localPath: { type: String },
  },
  userId: { type: mongoose.Types.ObjectId },
});
/** {mongoose.Schema} schema for user */
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

// hash password before saving
userSchema.pre("save", function save(next) {
  const user = this; // go to next if password field has not been modified
  if (!user.isModified("password")) {
    return next();
  }

  const salt = Number.parseInt(process.env.BCRYPT_SALT);
  // auto-generate salt/hash
  bcrypt.hash(user.password, salt, (err, hash) => {
    if (err) {
      return next(err);
    }
    //replace password with hash
    user.password = hash;
    next();
  });
});

// constants to export as collections in DB to be used in userController
const User = mongoose.model("User", userSchema, "Users");
const Artefact = mongoose.model("Artefacts", artefactSchema, "Artefacts");
const Category = mongoose.model("Categories", categorySchema, "Categories");
const Associated = mongoose.model("Associated", associatedSchema, "Associated");

// export the constants
module.exports = { User, Artefact, Category, Associated };
