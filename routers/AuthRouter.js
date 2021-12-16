const express = require ('express');
const AuthRouter = express.Router ();
const {PrismaClient} = require ('@prisma/client');
const firebase = require ('../APIKeys/Firebase.js');
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} = require ('firebase/auth');
const auth = getAuth (firebase);
const firebaseAdmin = require ('firebase-admin');

const prisma = new PrismaClient ();

AuthRouter.post ('/signUp', async (req, res, next) => {
  console.log (req.body);
  const UserAccount = {
    UserEmail: req.body.UserEmail,
    AccountPassword: req.body.AccountPassword,
  };

  createUserWithEmailAndPassword (
    auth,
    UserAccount.UserEmail,
    UserAccount.AccountPassword
  ).then (result => {
    prisma.user
      .create ({
        data: {
          UserEmail: UserAccount.UserEmail,
          UserAccount: result.user.uid,
        },
      })
      .then (final => {
        res.status (200);
        res.json (final);
      });
  });
});

AuthRouter.post ('/login', (req, res) => {
  const UserAccount = {
    UserEmail: req.body.UserEmail,
    AccountPassword: req.body.AccountPassword,
  };
  const auth = getAuth (firebase);
  signInWithEmailAndPassword (
    auth,
    UserAccount.UserEmail,
    UserAccount.AccountPassword
  ).then (user => {
    user.user
      .getIdToken ()
      .then (token => {
        res.status (200);
        res.json ({
          token: token,
        });

        console.log ('JWT token', token);
      })
      .catch (err => {
        res.json ({
          error: err,
        });
      });
  });
});

module.exports = AuthRouter;
