const express = require("express");
const AuthRouter = express.Router();
const { PrismaClient } = require("@prisma/client");
const firebase = require("../APIKeys/Firebase.js");
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} = require("firebase/auth");
const auth = getAuth(firebase);
const firebaseAdmin = require("firebase-admin");

const prisma = new PrismaClient();

AuthRouter.post("/verifyEmail", (req, res) => {
  const UserAccount = {
    UserEmail: req.body.UserEmail,
    AccountPassword: req.body.AccountPassword,
  };
  signInWithEmailAndPassword(
    auth,
    UserAccount.UserEmail,
    UserAccount.AccountPassword
  ).then((userCred) => {
    const isVerified = userCred.user.emailVerified;
    console.log("is this user verified", isVerified);
    if (isVerified) {
      res.send("This account is already verified");
      return;
    }
    sendEmailVerification(auth.currentUser)
      .then((sendResult) => {
        res.send("Check your email for verification");
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ error: error, message: "Something went wrong" });
      });
  });
});
AuthRouter.post("/resetPassword", (req, res) => {
  const UserEmail = req.body.UserEmail;
  sendPasswordResetEmail(auth, UserEmail)
    .then(() => {
      res.send("Check your email to reset password");
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong, please try again later");
    });
});
AuthRouter.post("/signUp", async (req, res, next) => {
  console.log(req.body);
  const UserAccount = {
    UserEmail: req.body.UserEmail,
    AccountPassword: req.body.AccountPassword,
    UniversityId: req.body.UniversityId,
  };

  createUserWithEmailAndPassword(
    auth,
    UserAccount.UserEmail,
    UserAccount.AccountPassword
  ).then((result) => {
    prisma.user
      .create({
        data: {
          UserEmail: UserAccount.UserEmail,
          UserAccount: result.user.uid,
          UniversityID: UserAccount.UniversityId,
        },
      })
      .then((final) => {
        res.status(200);
        res.json(final);
      });
  });
});

AuthRouter.post("/login", (req, res) => {
  const UserAccount = {
    UserEmail: req.body.UserEmail,
    AccountPassword: req.body.AccountPassword,
  };
  const auth = getAuth(firebase);
  signInWithEmailAndPassword(
    auth,
    UserAccount.UserEmail,
    UserAccount.AccountPassword
  )
    .then((user) => {
      user.user
        .getIdToken()
        .then((token) => {
          res.status(200);
          res.json({
            token: token,
          });

          console.log("JWT token", token);
        })
        .catch((err) => {
          res.json({
            error: err,
          });
        });
    })
    .catch((error) => {
      console.log(error);
    });
});

module.exports = AuthRouter;
