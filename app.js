const express = require ('express');
const firebaseAdmin = require ('firebase-admin');
const apiKey = require('./apiKey.json')
const AuthRouter = require ('./routers/AuthRouter');
const authenticate = require ('./authenticate');
firebaseAdmin.initializeApp({ credential:firebaseAdmin.credential.cert(apiKey)})

const app = express ();
app.use (express.json ());
app.use (express.urlencoded ({extended: true}));


app.use ('/auth', AuthRouter);
app.use((req, res, next)=>{
  console.log("passed auth")
  res.send("passed auth")
})
app.use (authenticate);
app.listen (3001);

