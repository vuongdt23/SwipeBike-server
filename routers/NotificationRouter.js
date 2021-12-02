const express = require ('express');
const NotificationRouter = express.Router ();
const firebaseAdmin = require ('firebase-admin');
const tokens = require ('../config/token');
const {saveTokenToStore} = require ('../FCMOperations/TokenStore');

NotificationRouter.post ('/register', (req, res) => {
  const user = req.user;
  const token = req.body.token;

  saveTokenToStore (token, user.uid).then (result => {
    res.status (200).json ({
      message: 'Successfully registered FCM Token!',
      result: result,
    });
    console.log (result);
  });
});

module.exports = NotificationRouter;
