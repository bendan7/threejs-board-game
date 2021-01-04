// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: true,
  version: require("../../package.json").version,
  firebase: {
    apiKey: "AIzaSyCD7u593WsDRcolZpBIch3bBGIzLBS6CQ8",
    authDomain: "threejs-board-game.firebaseapp.com",
    projectId: "threejs-board-game",
    storageBucket: "threejs-board-game.appspot.com",
    messagingSenderId: "877759633008",
    appId: "1:877759633008:web:b103346d747fea55e7c6b5",
    measurementId: "G-CC63TC7DS1",
  },
};
