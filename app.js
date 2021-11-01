const express = require ('express');
const firebaseAdmin = require ('firebase-admin');
const apiKey = require('./APIkeys/apiKey.json')
const AuthRouter = require ('./routers/AuthRouter');
const authenticate = require ('./authenticate');
const ProfileRouter = require('./routers/ProfileRouter');

const {Client} = require("@googlemaps/google-maps-services-js");
const CandidateTripRouter = require('./routers/CandidateTripRouter');


firebaseAdmin.initializeApp({ credential:firebaseAdmin.credential.cert(apiKey)})

const app = express ();
app.use (express.json ());
app.use (express.urlencoded ({extended: true}));


app.use ('/auth', AuthRouter);
app.use (authenticate);

app.use('/profile', ProfileRouter);

app.use('/candidatetrip', CandidateTripRouter);

const client = new Client({});

client
  .elevation({
    params: {
      locations: [{ lat: 45, lng: -110 }],
      key: "AIzaSyDNyia_5BWCFdUUZ7epKLOeimHgh1c7GsE",
    },
    timeout: 1000, // milliseconds
  })
  .then((r) => {
    console.log(r.data.results[0].elevation);
  })
  .catch((e) => {
    console.log(e.response.data.error_message);
  });

app.listen (3001);

