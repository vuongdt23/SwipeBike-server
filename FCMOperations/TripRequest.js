const firebaseAdmin = require ('firebase-admin');

const NotifyOfRequestCreation = tokens => {
  firebaseAdmin.messaging ().sendMulticast ({
    tokens,
    notification: {
      body: 'dummy',
      title: 'dummy',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/swipebike-38736.appspot.com/o/user_3_pic_2021-11-16T19%3A12%3A56.101Z?alt=media&token=95bc0f3f-ccca-47dc-9e22-7e70636fb75e',
    },
  });
};

module.exports = {
  NotifyOfRequestCreation: NotifyOfRequestCreation,
};
