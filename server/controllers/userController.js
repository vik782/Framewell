/**
 * @fileoverview Uses the parsed request, transforms it into logic based on the
 *               provided request (and any additional required data) and sends
 *               an appropriate response, based on what the client requested
 * Dependencies
 * - BCrypt to implement encrypted security
 * - JSON Web Token to send URL-safe claims between the server and client-side
 *   code
 * - FS to handle local upload of images into a local folder
 */

/* Imports of packages */
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const mongoose = require("mongoose");
const { put } = require("@vercel/blob"); /* Vercel Blob */
const LIMIT = 16; // record limit per page

/* Imports of mongoose models */
const { User, Artefact, Category, Associated } = require("../models/user");

/* Main implementation */

/* Uncomment/comment-out whichever variables are needed for
 * different modes */
/* ------------------------------------------------------------
 * For dev-mode
 * ------------------------------------------------------------ */

// const URL = process.env.LOCAL_URL;

/* ------------------------------------------------------------
 * For deployment-mode
 * ------------------------------------------------------------ */
const URL = process.env.DEPLOY_URL;

/**
 * MongoDB aggregate pipeline for the search index: "associated_index"
 * @param {Query} query
 */
const associatedIndex = (query) =>
  Artefact.aggregate([
    {
      $search: {
        index: "associated_index",
        autocomplete: {
          query: query,
          path: "associated.person",
        },
      },
    },
  ]);

/**
 * MongoDB aggregate pipeline for the search index: "category_index"
 * @param {Query} query
 */
const categoryIndex = (query) =>
  Artefact.aggregate([
    {
      $search: {
        index: "category_index",
        autocomplete: {
          query: query,
          path: "category.category_name",
        },
      },
    },
  ]);

/**
 * Sends a JWT token upon a user login session. Successfully logs a
 * user in only if both the user's username and password are valid.
 * @param {Request} req
 * @param {Response} res
 */
const loginUser = (req, res) => {
  User.findOne({ username: req.body.username })
    .then((user) => {
      bcrypt.compare(req.body.password, user.password, (err, checkPass) => {
        if (err) {
          return res.status(500).send({
            message: "Internal Server Error, on loginUser()",
            isValid: false,
            err,
          });
        }

        if (!checkPass) {
          return res.status(500).send({
            message: "Invalid Password",
            isValid: false,
            err,
          });
        } else {
          //generate JWT token
          const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
          );
          return res.status(200).send({
            message: "Login Successful",
            username: user.username,
            isValid: true,
            token,
          });
        }
      });
    })

    // user is not registered in database
    .catch((error) => {
      res.status(500).send({
        message: "Invalid Username",
        isValid: false,
        error,
      });
    });
};

/**
 * Sends a JWT token upon a user login session. Successfully logs a
 * user in only if both the user's username and password are valid.
 * @param {Request} req
 * @param {Response} res
 */
const signUpUser = (req, res) => {
  User.findOne({ username: req.body.username }).then(async (user) => {
    if (user) {
      return res.status(500).send({
        message: "Username already exists",
        isValid: false,
      });
    } else {
      // Create a new user
      const newUser = new User({
        username: req.body.username,
        password: req.body.password,
      });
      newUser
        .save()
        .then((user) => {
          // Generate JWT token
          const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
          );
          return res.status(200).send({
            message: "Login Successful",
            username: user.username,
            isValid: true,
            token,
          });
        })
        .catch((error) => {
          return res.status(500).send({
            message: "Internal Server Error, on signUpUser()",
            isValid: false,
            error,
          });
        });
    }
  });
};

/**
 * Sends all artefacts recorded that matches the search query
 * based on the the category field
 * @param {Request} req
 * @param {Response} res
 */
const searchCategory = (req, res) => {
  const query = req.params.query;
  const pageNum = req.params.page;

  let idx = (pageNum - 1) * LIMIT;
  categoryIndex(query)
    .then((artefactRecords) => {
      const totalSearched = artefactRecords.length;
      if (totalSearched == 0) {
        // no artefact matched the query
        res.status(200).send({
          message: `${totalSearched} artefacts matched the query: ${query}`,
          artefactRecords,
          totalSearched,
          query,
        });
      } else {
        categoryIndex(query)
          .sort({ _id: -1 })
          .skip(idx)
          .limit(LIMIT)
          .then((searched) => {
            const totalPages = Math.ceil(totalSearched / LIMIT);
            res.status(200).send({
              message: `${totalSearched} artefacts matched the query: ${query}`,
              totalPages,
              totalSearched,
              searched,
              query,
            });
          })
          .catch((error) => {
            res.status(500).send({
              message: "Internal Server Error, on searchCategory()",
              error,
            });
          });
      }
    })
    .catch((error) => {
      res.status(500).send({
        message: "Internal Server Error, on searchCategory()",
        error,
      });
    });
};

/**
 * Sends all artefacts recorded that matches the search query
 * based on the the associated field
 * @param {Request} req
 * @param {Response} res
 */
const searchAssociated = (req, res) => {
  const query = req.params.query;
  const pageNum = req.params.page;

  let idx = (pageNum - 1) * LIMIT;
  associatedIndex(query)
    .then((artefactRecords) => {
      const totalSearched = artefactRecords.length;
      if (totalSearched == 0) {
        // no artefact matchd the query
        res.status(200).send({
          message: `${totalSearched} artefacts matched the query: ${query}`,
          artefactRecords,
          totalSearched,
          query,
        });
      } else {
        associatedIndex(query, idx)
          .sort({ _id: -1 })
          .skip(idx)
          .limit(LIMIT)
          .then((searched) => {
            const totalPages = Math.ceil(totalSearched / LIMIT);

            res.status(200).send({
              message: `${totalSearched} artefacts matched the query: ${query}`,
              totalPages,
              searched,
              totalSearched,
              query,
            });
          })
          .catch((error) => {
            res.status(500).send({
              message: "Internal Server Error, on searchAssociated()",
              error,
            });
          });
      }
    })
    .catch((error) => {
      res.status(500).send({
        message: "Internal Server Error, on searchAssociated()",
        error,
      });
    });
};

/**
 * Sends a response containing a list of all Category objects
 * @param {Request} req
 * @param {Response} res
 */
const getCategories = (req, res) => {
  Category.find()
    .then((result) => {
      res.status(200).send({
        message: "Categories recieved successfully",
        result,
      });
    })
    .catch((error) => {
      res.status(500).send({
        message: "Internal Server Error, on getCategories()",
        error,
      });
    });
};

/**
 * Sends a response containing a list of all PersonAssociated objects
 * @param {Request} req
 * @param {Response} res
 */
const getAssociated = (req, res) => {
  Associated.find()
    .then((result) => {
      res.status(200).send({
        message: "Associated recieved successfully",
        result,
      });
    })
    .catch((error) => {
      res.status(500).send({
        message: "Internal Server Error, on getCategories()",
        error,
      });
    });
};

/**
 * Sends a response containing a single artefact, based on the artefact ID
 * provided on the request data
 * @param {Request} req
 * @param {Response} res
 */
const getArtefactDetails = async (req, res) => {
  Artefact.findById(req.params.id)
    .then((result) => {
      res.status(200).send({
        message: "Artefact retrieved successfully",
        result,
      });
    })
    .catch((error) => {
      res.status(500).send({
        message: "Internal Server Error, on getArtefactDetails()",
        error,
      });
    });
};

/*
/* ------------------------------------------------------------
 * For local storage
 * Registers a new artefact, based on the provided and filtered request data
 * @param {Request} req
 * @param {Response} res
 * // (add / after * to uncomment the code below)
const registerArtefact = async (req, res) => {
  const dateNow = Date.now();
  const path = `/../storage/${dateNow}_${req.body.record.nameImg}`;
  const pathFile = __dirname + path;
  const pathImg = `${URL}/getImage/${dateNow}_${req.body.record.nameImg}`;

  // Write the image file to the storage folder
  fs.writeFile(
    pathFile,
    req.body.record.artefactImg.split(",")[1],
    { encoding: "base64" },
    async function (err) {
      if (err) {
        // Send error response if file writing fails
        return res.status(500).send({
          message: "Internal Server Error, on registerArtefact()",
          err,
        });
      }

      const userId = new mongoose.Types.ObjectId(req.user.userId);
      // Create a new artefact
      const artefact = new Artefact({
        userId,
        artefactName: req.body.record.artefactName,
        description: req.body.record.description,
        memories: req.body.record.memories,
        associated: null,
        category: null,
        location: req.body.record.location,
        "artefactImg.imgURL": pathImg,
        "artefactImg.imgName": req.body.record.nameImg,
        "artefactImg.imgType": req.body.record.typeImg,
        "artefactImg.imgSize": req.body.record.sizeImg,
        "artefactImg.localPath": path,
      });

      // Save the artefact to the database
      const savedArtefact = await artefact.save();

      // Handle category logic
      const categoryObject = await Category.findOne({
        category_name: req.body.record.category,
      });
      if (categoryObject) {
        await Artefact.updateOne(
          { _id: savedArtefact._id },
          { $set: { category: categoryObject } }
        );
      } else {
        const newCategory = new Category({
          category_name: req.body.record.category,
        });
        await newCategory.save();
        await Artefact.updateOne(
          { _id: savedArtefact._id },
          { $set: { category: newCategory } }
        );
      }

      // Handle associated logic
      const associatedObject = await Associated.findOne({
        person: req.body.record.associated,
      });
      if (associatedObject) {
        await Artefact.updateOne(
          { _id: savedArtefact._id },
          { $set: { associated: associatedObject } }
        );
      } else {
        const newAssociated = new Associated({
          person: req.body.record.associated,
        });
        await newAssociated.save();
        await Artefact.updateOne(
          { _id: savedArtefact._id },
          { $set: { associated: newAssociated } }
        );
      }

      // Send success response
      return res.status(200).send({
        message: "Artefact registered successfully",
        artefact: savedArtefact,
      });
    }
  );
};
*/ // (remove to uncomment the code above)

/* ------------------------------------------------------------
 * For online storage (Vercel Blob)
 * Registers a new artefact, based on the provided and filtered request data
 * @param {Request} req
 * @param {Response} res
 */ // (add / after * to uncomment the code below)
const registerArtefact = async (req, res) => {
  const imageBuffer = Buffer.from(
    req.body.record.artefactImg.split(",")[1],
    "base64"
  );
  const { pathImg } = await put(req.body.record.nameImg, imageBuffer, {
    access: "public",
    addRandomSuffix: true,
  });

  const userId = new mongoose.Types.ObjectId(req.user.userId);
  // Create a new artefact
  const artefact = new Artefact({
    userId,
    artefactName: req.body.record.artefactName,
    description: req.body.record.description,
    memories: req.body.record.memories,
    associated: null,
    category: null,
    location: req.body.record.location,
    "artefactImg.imgURL": pathImg,
    "artefactImg.imgName": req.body.record.nameImg,
    "artefactImg.imgType": req.body.record.typeImg,
    "artefactImg.imgSize": req.body.record.sizeImg,
    "artefactImg.localPath": "",
  });

  // Save the artefact to the database
  const savedArtefact = await artefact.save();

  // Handle category logic
  const categoryObject = await Category.findOne({
    category_name: req.body.record.category,
  });
  if (categoryObject) {
    await Artefact.updateOne(
      { _id: savedArtefact._id },
      { $set: { category: categoryObject } }
    );
  } else {
    const newCategory = new Category({
      category_name: req.body.record.category,
    });
    await newCategory.save();
    await Artefact.updateOne(
      { _id: savedArtefact._id },
      { $set: { category: newCategory } }
    );
  }

  // Handle associated logic
  const associatedObject = await Associated.findOne({
    person: req.body.record.associated,
  });
  if (associatedObject) {
    await Artefact.updateOne(
      { _id: savedArtefact._id },
      { $set: { associated: associatedObject } }
    );
  } else {
    const newAssociated = new Associated({
      person: req.body.record.associated,
    });
    await newAssociated.save();
    await Artefact.updateOne(
      { _id: savedArtefact._id },
      { $set: { associated: newAssociated } }
    );
  }

  // Send success response
  return res.status(200).send({
    message: "Artefact registered successfully",
    artefact: savedArtefact,
  });
};
// */ (uncomment // to comment out the code above)

/**
 * Sends a response containing a single artefact, based on the artefact ID
 * provided on the request data. Used to provide the user with the feature to
 * edit a currently-existing artefact
 * @param {Request} req
 * @param {Response} res
 */
const editArtefact = async (req, res) => {
  try {
    const artefact = await Artefact.findByIdAndUpdate(
      { _id: req.params.id },
      {
        artefactName: req.body.record.artefactName,
        description: req.body.record.description,
        memories: req.body.record.memories,
        location: req.body.record.location,
      },
      { new: true }
    );

    if (!artefact) {
      return res.status(404).send({
        message: "Artefact not found",
      });
    }

    // Handle category logic
    const categoryObject = await Category.findOne({
      category_name: req.body.record.category,
    });
    if (categoryObject) {
      await Artefact.updateOne(
        { _id: artefact._id },
        { $set: { category: categoryObject } }
      );
    } else {
      const newCategory = new Category({
        category_name: req.body.record.category,
      });
      await newCategory.save();
      await Artefact.updateOne(
        { _id: artefact._id },
        { $set: { category: newCategory } }
      );
    }

    // Handle associated logic
    const associatedObject = await Associated.findOne({
      person: req.body.record.associated,
    });
    if (associatedObject) {
      await Artefact.updateOne(
        { _id: artefact._id },
        { $set: { associated: associatedObject } }
      );
    } else {
      const newAssociated = new Associated({
        person: req.body.record.associated,
      });
      await newAssociated.save();
      await Artefact.updateOne(
        { _id: artefact._id },
        { $set: { associated: newAssociated } }
      );
    }

    return res.status(200).send({
      message: "Edit artefact successfully",
      artefact,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error, on editArtefact()",
      error,
    });
  }
};

/**
 * Deletes a currently-existing artefact
 * @param {Request} req
 * @param {Response} res
 */
// delete artefact function for route: '/delete-artefact/:id'
const deleteArtefact = async (req, res) => {
  const artefact_id = req.params.id;
  const artefact_record = await Artefact.findOne({ _id: artefact_id });

  Artefact.deleteOne({ _id: artefact_id })
    .then((artefact) => {
      const pathFile = __dirname + artefact_record.artefactImg.localPath;

      fs.unlink(pathFile, async function (err) {
        if (err) {
          return res.status(500).send({
            message: "Internal Server Error, on deleteArtefact()",
            err,
          });
        } else {
        }
      });

      return res.status(200).send({
        message: "Deleted artefact successfully",
        artefact,
      });
    })
    .catch((error) => {
      return res.status(500).send({
        message: "Internal Server Error, on deleteArtefact()",
        error,
      });
    });
};

/**
 * Sends all artefacts in the database to be rendered on the dashboard.
 * Artefacts are sent based on the page at which it is placed in
 * @param {Request} req
 * @param {Response} res
 */
const getPage = async (req, res) => {
  const pageNum = req.params.page;

  const userId = new mongoose.Types.ObjectId(req.user.userId);

  const totalArtefact = await Artefact.countDocuments({ userId: userId });
  const totalPages = Math.ceil(totalArtefact / LIMIT);

  const idx = (pageNum - 1) * LIMIT;

  await Artefact.find({ userId: userId })
    .sort({ _id: -1 })
    .skip(idx)
    .limit(LIMIT)
    .then((dataInPage) => {
      const dataPerPage = dataInPage.length;
      // console.log(dataInPage)
      if (dataPerPage > 0) {
        return res.status(200).send({
          message: `Successfully retrieved page ${pageNum}`,
          dataPerPage,
          dataInPage,
          totalPages,
          totalArtefact,
        });
      } else if (dataPerPage == 0 && totalPages == 0) {
        return res.status(200).send({
          message: `Successfully retrieved page ${pageNum}`,
          dataPerPage,
          dataInPage,
          totalPages,
          totalArtefact,
        });
      } else {
        return res.status(200).send({
          message: `Invalid Page Number`,
          dataPerPage,
          dataInPage,
          totalPages,
          totalArtefact,
        });
      }
    })
    .catch((error) => {
      res.status(500).send({
        message: "Internal Server Error, on getPage()",
        error,
      });
    });
};

// exports objects containing functions imported by router
module.exports = {
  loginUser,
  signUpUser,
  getArtefactDetails,
  getCategories,
  getAssociated,
  registerArtefact,
  editArtefact,
  deleteArtefact,
  getPage,
  searchCategory,
  searchAssociated,
};
