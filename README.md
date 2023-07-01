# 13-Korotu-T
![Korotu_Logo](https://user-images.githubusercontent.com/55993520/216847981-c57d13c5-839a-40b5-9951-de8204d7bee4.png)
## Description
The product we are building with our partner, Korotu, is a mobile application for tree identification designed to run on mobile devices. This application utilizes two main components, a machine learning model and mobile interaction (user interface to login etc. see key features), to provide users with a reliable and efficient tool for identifying trees.

The machine learning model will be trained on large datasets of tree images to perform tree identification, with the goal of achieving an accuracy rate of 70%.

The main target users are foresters, forest ecologists, forest scientists, researchers and academics in related fields such as environmental science, botany, and ecology who study forests, the plants and animals within them. Additionally, environmentalists, conservationists, eco-activists, sustainability advocates, green activists, nature lovers, eco-enthusiasts

## Key Features
User can login, register, edit profile. Take a picture to classify tree species (using PlantID API and our deployed ML model API). Image library (store user pictures)

## Instructions

1. Run the app
   1. `git clone` the repo
   2. run `cd korotu-app` to access the expo app folder
   3. run `npm install` to install required node packages
   4. run `npx expo start` to run the app (expo docs: https://docs.expo.dev/get-started/create-a-new-app/)
   5. run app on simulator, web, or the mobile Expo Go app by scanning the QR code (if by mobile, must download Expo Go app https://apps.apple.com/us/app/expo-go/id982107779/https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en_CA&gl=US)
   
2. Login/Register

   You can either register a new account or use our test account to login
   
   - username: test
   - password: dummy
   
3. Tree/plant species classification

   1. Go to the 'Camera' tab in the naviagtion bar.
   2. Capture a tree/plant image with the 'Capture' button.
   3. Click 'PlantID' or 'Custom ML'.
   4. The app will start fetching the API call
   5. The message will show the name of the species.
   
## Development requirements


### Frontend: 

1. Instructions
   1. run `cd korotu-app` to access the expo app folder
   2. run `npm install` to install required node packages
   3. run `npx expo start` to run the app (expo docs: https://docs.expo.dev/get-started/create-a-new-app/)
   4. run app on simulator, web, or the mobile Expo Go app by scanning the QR code (if by mobile, must download Expo Go app https://apps.apple.com/us/app/expo-go/id982107779/https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en_CA&gl=US)

2. External dependencies and third-party software

   - JavaScript
   - Node
   - React
   - React Native
   - Expo
   (see package.json for additional dependencies)
   
### Backend:
#### Getting Started

To get started run `npm install`, and wait until the node packages install into your `node_modules` folder. We suggest using `nvm` to manage your node versions, and the backend was built on node version `19.x` (see Github Actions for succeeding builds). Then try running `npm run dev` for a sanity check.

#### Source code docs

All environment variables are located in `.env` as we use `dotenv` for the loading/storing env vars.

The backend for user data/authentication is built entirely using [`Parse`](https://parseplatform.org/). Then testing is done using [`Jest`](https://jestjs.io/).

Note: `tsconfig.json` is used only for typechecking, but you may use it alternatively to build the app; however it is not configured to be used by `npm`. We use babel instead for better compatibility with Javascript files.

#### `npm` Commands

You can see a full list of them in `package.json` in the script entry of the JSON object. It will look something like:

``` json
 "scripts": {
    "dev": "nodemon --exec babel-node src/index.ts --extensions \".ts\" ",
    "check-types": "tsc",
    "build": "babel src/index.ts -d dist",
    "start": "npm run check-types && npm run build && node dist/index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
 }
```
#### Building

The backend requires `Node.js` and `Express.js` with `Typescript`. The packages needed are located in `package.json`, and `package-lock.json`; you will likely need both of these. To install the dependencies run: `npm install` in the root of the backend folder.

Once dependencies are installed, you can test the app by running `npm start`. **When developing it is important to use `npm run dev`** **as this will let your run your server than fully compiling it, and you can see live changes through `nodemon`**.

Before deploying, run `npm run build` to create a complied version of the app, and then deploy that version.

After building you should see compiled versions in the `./dist` folder.

### ML:
   - Using PlantID API for the user to classify plant species using the camera and upload function in the app.
   - Deployed existing Google ML model (https://tfhub.dev/google/aiy/vision/classifier/plants_V1/1) for the user to classify plant species using the camera and upload function in the app.

## Deployment and Github Workflow
### Github Workflow
We use feature branches to develop features that may impact other sub-teams. Avoiding faulty code in the main branch. Once the feature branch is well tested, we would then create PR for one person to review then push. We also used the PR to highlight any major blockers.

We directly push to the main branch if it is editing the documents like markdown. Or changes that is independent from other sub-teams development.

### Deployment
The frontend app can be easily built with Expo by running `npx expo start` and we can view the live application on Expo Go by scanning the code. 

The backend app is deployed using Heroku, and is available here: https://whispering-citadel-32592.herokuapp.com. The details of building is mentioned in the development requirement section. 

The custom ML is deployed using Azure, and is available here: https://plantclassification-qpfub.eastus2.inference.ml.azure.com/score. The API key is yPcbgdXSX6MUdGrlM4PEE5Pf2PYaPuJE. The detailed guide is included in the ml folder on the backend branch.

We chose Expo and Heroku because they are fast and easy to use, so we can focus more on development.

The frontend is not deployed, because Heroku costs us money to run at the moment. So we are only deploying the backend onto Heroku and Ml onto Azure (using the free trails).

## Code Base Navigation
### Frontend
```bash
├── korotu-app
│   ├── assets
```
- Static images, icons, and logos used within the app are stored here
```bash
│   ├── App.js
```
- App entry point which acts as the main controller for app navigation and displaying screens
```bash
│   ├── screens
```
- Contains all screens and components displayed within the app
```bash
│   │   ├── authentication
```
- Contains all screens & components for authentication before the user has logged in
```bash
│   │   │   ├── landing.js
```
- Contains the UI for when the user first opens the app, with ability to select "Login" or "Register"
```bash
│   │   │   ├── login.js
```
- Contains the login page where a user when an existing account can login to the app
- Contains the backend calls to log a user in if their credentials are successful
```bash
│   │   │   ├── signup.js
```
- Contains the sign up page where a user can create a new account for the app
- Contains the backend calls to create a new user
```bash
│   │   ├── home
```
- Contains all screens & components once the user has logged in
```bash
│   │   │   ├── components
```
```bash
│   │   │   │   ├── button.js
```
- Contains the button componet used in the camera.js
```bash
│   │   │   │   ├── infobox.js
```
- Contains the information box componet (the display of info after predicting an image) used in the upload.js
```bash
│   │   │   ├── camera.js
```
- Contains the UI to take picture, predict using one of PlantID/Custom ML model, retake picture, and save picture functionality.
- Contains the API call to the PlantID and Custom ML model.
```bash
│   │   │   ├── library.js
```
- Contains the UI to display all images user has predicted and saved.
```bash
│   │   │   ├── settings.js
```
- Contains the UI to alow the user to edit their profile and to logout.
```bash
│   │   │   ├── upload.js
```
- Contains the UI to upload picture from local camera roll and predict using one of PlantID/Custom ML model.
- Contains the API call to the PlantID and Custom ML model.

### Backend
```bash
├── src
│   ├── index.ts
```
- This code sets up an Express server with specific configurations, including the use of environment variables, CORS, and JSON parsing. 
- The server is then configured with custom routes for login and image handling, and listens on a specified port.
```bash
├── src
│   ├── routes
│   │   ├── app_constants.ts
```
- This file utilizes the 'dotenv' package to load environment variables from a .env file. 
- It then exports the Parse-related constants, making them available for use in other parts of the application.
```bash
├── src
│   ├── routes
│   │   ├── login.ts
```
- This file sets up an Express.js server with a router for handling user authentication and account management using Parse, a backend framework. 
- It provides routes for registering, logging in, logging out, editing email, editing username, and retrieving the current user's information.
```bash
├── src
│   ├── routes
│   │   ├── images.ts
```
- This file is a server-side module for handling image uploads, retrieval, updates, and deletions in a web application using Express and Parse. 
- It defines several route handlers for these operations and exports the required functionality as a router object and helper functions.
```bash
├── src
│   ├── routes
│   │   ├── assets
│   │   │   ├── multerConfig.ts
```
- This file imports the 'multer' library to handle file uploads and creates a multer instance using memory storage. 
- It exports the multer instance for use in other parts of the application, or a mock function when in a test environment.
```bash
├── src
│   ├── routes
│   │   ├── assets
│   │   │   ├── parseHelper.ts
```
- This file imports the 'Parse' library and defines a getParseUser function that retrieves a Parse user object based on a given session token. 
- The function queries the Parse database for the user associated with the session token, and throws an error if the session token is invalid.


## Licenses
MIT LICENSE requested by partner

The MIT license allows for the commercial use of our codebase and other developers are free to modify and distribute the code.
