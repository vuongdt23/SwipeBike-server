const firebaseAdmin = require ('firebase-admin');

const saveTokenToStore = (token, userId) => {
  if (!token) return;

  const collectionRef = firebaseAdmin.firestore ().collection ('FCM_TOKENS');

  const docData = {
    token: token,
    userId: userId,
  };

  return collectionRef.doc (token).set (docData);
};

const getTokensByUserId = userId => {
  const collectionRef = firebaseAdmin.firestore ().collection ('FCM_TOKENS');

  return collectionRef.where ('userId', '==', userId).get ();
};

module.exports = {
  saveTokenToStore: saveTokenToStore,
  getTokensByUserId: getTokensByUserId,
};
