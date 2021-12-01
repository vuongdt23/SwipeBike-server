const express = require ('express');
const NotificationRouter = express.Router ();
const firebaseAdmin = require ('firebase-admin');
const tokens = require ('../config/token');

NotificationRouter.post ('/register', (req, res) => {
  const User = req.user;
  tokens.push (req.body.token);
  console.log ('tokens ', tokens);
  res.status (200).json ({message: 'Successfully registered FCM Token!'});
});

NotificationRouter.post ('/notifications', async (req, res) => {
  try {
    const {title, body, imageUrl} = req.body;
    await firebaseAdmin.messaging ().sendMulticast ({
      tokens,
      notification: {
        title,
        body,
        imageUrl,
      },
    });
    res.status (200).json ({message: 'Successfully sent notifications!'});
  } catch (err) {
    res
      .status (err.status || 500)
      .json ({message: err.message || 'Something went wrong!'});
  }
});

module.exports = NotificationRouter;
