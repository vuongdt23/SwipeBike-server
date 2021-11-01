const express = require ('express');
const firebaseAdmin = require ('firebase-admin');
const apiKey = require('./APIkeys/apiKey.json')
const AuthRouter = require ('./routers/AuthRouter');
const authenticate = require ('./authenticate');
const ProfileRouter = require('./routers/ProfileRouter');

const CandidateTripRouter = require('./routers/CandidateTripRouter');


firebaseAdmin.initializeApp({ credential:firebaseAdmin.credential.cert(apiKey)})

const app = express ();
app.use (express.json ());
app.use (express.urlencoded ({extended: true}));


app.use ('/auth', AuthRouter);
app.use (authenticate);

app.use('/profile', ProfileRouter);

app.use('/candidatetrip', CandidateTripRouter);



app.listen (3001);

