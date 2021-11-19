const express = require("express");
const firebaseAdmin = require("firebase-admin");
const apiKey = require("./APIkeys/apiKey.json");
const AuthRouter = require("./routers/AuthRouter");
const authenticate = require("./authenticate");
const ProfileRouter = require("./routers/ProfileRouter");
const storageBucket = require("./APIKeys/storageBucket");
const CandidateTripRouter = require("./routers/CandidateTripRouter");
const NotificationRouter = require("./routers/NotificationRouter");
var cors = require("cors");

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(apiKey),
  storageBucket: storageBucket,
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/auth", AuthRouter);
app.use("/notification", NotificationRouter);

app.use(authenticate);

app.use("/profile", ProfileRouter);

app.use("/candidatetrip", CandidateTripRouter);

app.listen(3001);
