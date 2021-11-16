const firebaseAdmin = require ('firebase-admin');
const apiKey = require ('../APIkeys/apiKey.json');


module.exports = firebaseAdmin.initializeApp ({
  credential: firebaseAdmin.credential.cert (apiKey),
  storageBucket: 'gs://swipebike-38736.appspot.com/',
});
