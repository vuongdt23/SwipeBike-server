const express = require ('express');
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require ('firebase/auth');
const AuthRouter = require ('./routers/AuthRouter');
const authenticate = require ('./authenticate');
const app = express ();
app.use (express.json ());
app.use (express.urlencoded ({extended: true}));


app.use ('/auth', AuthRouter);
app.use (authenticate);
app.listen (3001);

