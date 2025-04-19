<img src="https://github.com/user-attachments/assets/2b3dcafd-212a-4ab7-bf35-bcaed87a5371" width="325" height="450"/>

# Framewell
Your artefacts, your memories

Framewell is a home for all your artefacts. Easily preserve all of your precious legacy and memories. Stay organised and cherish your beloved with Framewell. The web-app has been deployed and you can try it out now live at https://framewell.vercel.app on your computer or mobile devices.

## Acknowledgement
Framewell is adopted from Sterling Family Artefact, a project by my Group 098 (Five Fingers) of University of Melbourne's COMP30022 IT Project. It is a CRUD (Create, Read, Update, Delete) interface web application to store photos of our client's family artefacts. Shoutout to my group members and contributors: 
| Name                    | Student Email 
| ----------------------- | ----------------------------------|
| Leoni Angela            | leonia@student.unimelb.edu.au     | 
| Nadya Aurelia Herryyanto| nherryyanto@student.unimelb.edu.au| 
| Nicholas Riykco Widjaya | riykco.widjaya@unimelb.edu.au     | 
| Tahmin Ahmed            | tahmin@student.unimelb.edu.au     | 
| Vincent Kurniawan (me)  | vkurniawan@student.unimelb.edu.au | 

## Features
- Sign-up an account and log-in through a secured account authentication and authorization system
- Dashboard to view all your uploaded artefacts
- Add artefacts with an image and its details
- View Partial Data of the artefact
- View Full Data of the artefact
- Make edits to your artefact (title, description, etc.)
- Add specific Categories or Associations for an artefact
- Delete existing artefacts

## Demo Footage
https://github.com/user-attachments/assets/2feb540f-8552-4023-a6d8-c9ccbd809910

## Technical details

### Stack

This section lists any major frameworks/libraries used to bootstrap this project. In short, the MERN stack adopting an MCV pattern was used and the project is deployed to Vercel. For security, Bcrypt was used to hash plain text passwords and JWT to sign and verify user sessions.

[![My Skills](https://skillicons.dev/icons?i=html,css,js,mongodb,express,react,nodejs,vercel)](https://skillicons.dev)


### Folder Structure
```js
/
├── client/  // front-end directory 
│   │           
│   ├── build/
│   │
│   ├── components/ 
│   │
│   ├── pages/ // landing pages for routes
│   │       
│   └── package.json // client modules list
│               
├── server/  // backed-end directory 
│   │           
│   ├── api/
│   │   │
│   │   ├── index.js // server file
│   │   
│   ├── routers/ // api routes
│   │      
│   ├── controllers/ // functions mapped for each route
│   │
│   ├── models/ // database schema definitions
│   │
│   ├── storage/ // for local development only
│   │
│   ├── vercel.json/ // deploy config
│   │
│   ├── package.json/ // server modules list
│              
├── package.json 
```

## Getting Started
Framewell can be also be used and developed locally! This means instead of uploading your artefacts online, you could upload it to your local `server` directory under a folder called `storage`. Another alternative is you could deploy the application to your own Vercel account and Vercel Blob (file storage), and connect the app to your own MongoDB cluster. Choose the most appropriate guideline for your needs:

### Local Development Guideline

- Clone the project

```bash
  git clone https://github.com/vik782/Framewell.git
```
- Under the `server` directory, create a `.env` file with the following constants:
  - MONGO_URL (your MongoDB cluster connection string)
  - LOCAL_URL = "http://localhost:5100/api"
  - BCRYPT_SALT (salt to hash and compare plain text passwords)
  - JWT_SECRET (string to sign JWT tokens)
   
- Under the `client` directory, create a `.env` file with the following constant:
  - REACT_APP_LOCAL_URL = "http://localhost:5100/api"

- Headover to `/client/src/utils/dataHandler.js` and use `const URL = process.env.REACT_APP_LOCAL_URL;`
- Headover to `/server/controllers/userController.js` and use `const URL = process.env.LOCAL_URL;`
- In `userController.js`file, use `registerArtefact()` and `deleteArtefact()` functions that are commented for local storage
- Under `client` root, run the following commands to start front-end
```bash
  npm install
  npm start
```
- Under `server` root, run the following commands to start back-end
```bash
  npm install
  npm start
```
- Done, create a new account and go store some memories!
