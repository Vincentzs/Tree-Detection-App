# 13-Korotu-T

![](https://user-images.githubusercontent.com/55993520/216847981-c57d13c5-839a-40b5-9951-de8204d7bee4.png)

![Build](https://github.com/csc301-2023-winter/13-Korotu-T/actions/workflows/node.js.yml/badge.svg)

## Summary:

1.  Where and how are tasks managed? (e.g., are you using Linear.app, Jira, GitHub Project...)

    -   Github Project and Notion sprint planning

2.  This is the backend branch, so for planning docs/expo app see the `main` branch.

3.  Main dependencies - check `package.json` from the rest

    1.  Typescript
    2.  Express.js
    3.  Node.js
    4.  Parse/node

## Development

### Getting Started

To get started run `npm install`, and wait until the node packages install into your `node_modules` folder. We suggest using `nvm` to manage your node versions, and the backend was built on node version `19.x` (see Github Actions for succeeding builds). Then try running `npm run dev` for a sanity check.

### Source code docs

All environment variables are located in `.env` as we use `dotenv` for the loading/storing env vars.

The backend for user data/authentication is built entirely using [`Parse`](https://parseplatform.org/). Then testing is done using [`Jest`](https://jestjs.io/). This is good since Parse is a widely maintained API providing user authentication and database abstraction, allowing for time to be focused on developing backend features and API rather than focusing on the networking/database admin code. The alternative is to use Firebase or something like it, which would require another layer of complexity that Korotu with its small team has to maintain. Provided that Parse has good abstractions for their API, the code our Parse-based backend is easily swappable later on to something more custom. Further, we use Jest because it is an industry standard framework (used by Amazon!) for Javacript testing, supporting mocking, along with development toolchains like Node/React.

Note: `tsconfig.json` is used only for typechecking, but you may use it alternatively to build the app; however it is not configured to be used by `npm`. We use babel instead for better compatibility with Javascript files.

### `npm` Commands

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

### Building

The backend requires `Node.js` and `Express.js` with `Typescript`. The packages needed are located in `package.json`, and `package-lock.json`; you will likely need both of these. To install the dependencies run: `npm install` in the root of the backend folder.

Once dependencies are installed, you can test the app by running `npm start`. **When developing it is important to use `npm run dev`** **as this will let your run your server than fully compiling it, and you can see live changes through `nodemon`**.

Before deploying, run `npm run build` to create a complied version of the app, and then deploy that version.

After building you should see compiled versions in the `./dist` folder.


### Deployment

Our backend is deployed using Heroku, and is available here: https://whispering-citadel-32592.herokuapp.com 

It consists of the backend API endpoints that our server accepts, and can be tested using the example fetch call available in the backend readme. Since we have not yet connected the front-end to the backend, this will need to be done using the browser developer tools. 

You should see a user object returned. Currently the backend is registered to Eric, who did the Heroku setup, and therefore isn’t setup for continuous delivery/eployment since Heroku requires that all users (including free ones) submit a credit card. We will need to discuss with Korotu during the handover phase for them to set that up should they choose to continue with Heroku. 


Example login fetch call: 
```js
const data = { 'username': 'dummy',  'password': 'test'};
let responseData = {};

fetch('https://whispering-citadel-32592.herokuapp.com/draft/login', {
  method: 'POST', // or 'PUT'
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
})
  .then((response) => response.json())
  .then((data) => { 
      responseData = data;
      console.log('Success:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
```
This should return a user object that has the details for a login (e.g., session token). It can look something like this: 

```json
{
    "user": {
        "username": "dummy",
        "createdAt": "2023-02-20T22:43:02.041Z",
        "updatedAt": "2023-02-20T22:43:02.041Z",
        "ACL": {
            "*": {
                "read": true
            },
            "eILBTtBkkk": {
                "read": true,
                "write": true
            }
        },
        "sessionToken": "r:0e1fca46f695245ba62df311f01bac84",
        "objectId": "eILBTtBkkk"
    }
}
```

You can also create a new user by sending data to the `.../draft/register` URL, but that is not recommended to avoid database pollution. 
