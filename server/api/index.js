/**
 * @fileoverview The starting point of the server file, used to securely serve
 * the dynamically stored files to the front-end upon request
 * Dependencies:
 * - ExpressJS to build a RESTful API on top of Node.js
 * - body-parser to parse HTTP request methods
 * - CORS to safely transfer data between restricted resources (the artefacts)
 *   to the font-end
 */

// imports libraries and frameworks used for the project
const express = require('express'),
      bodyParser = require('body-parser'),
      cors = require('cors'),
      path = require('path')

// configure dotenv to load the .env file from the server folder
const dotenv = require('dotenv')
dotenv.config();
  
// app runs on express.js
const app = express()

// app uses cors HTTP protocol
app.use(cors());
  
// app uses bodyParser to parse JSON objects from HTTP requests
app.use(bodyParser.json({limit: '4mb'}));
app.use(bodyParser.urlencoded({ limit: '4mb', extended: true }));
app.use(express.json())

// router of app in server
const userRouter = require('../routers/userRouter')
app.use('/api', userRouter)

// fetch image locally
app.use('/api/getImage', express.static(path.join(__dirname, '/../storage')))

// Tells the app to listen on port 5100 and logs that information to the console.
app.listen(5100, () => {
    console.log('Server is alive!')
})

// connect mongoose index in models folder
require('../models')

module.exports = app
