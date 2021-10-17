// Import the functions you need from the SDKs you need
const {initializeApp} = require ('firebase/app');
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyD5G_AEzC6UOVT6FWHnBhiRG8SSQreV1h8',
  authDomain: 'swipebike-38736.firebaseapp.com',
  projectId: 'swipebike-38736',
  storageBucket: 'swipebike-38736.appspot.com',
  messagingSenderId: '681511264680',
  appId: '1:681511264680:web:d0d60225ad83123bdcfd9d',
  measurementId: 'G-HS4KL3RV5P',
};

// Initialize Firebase
module.exports = initializeApp (firebaseConfig);
