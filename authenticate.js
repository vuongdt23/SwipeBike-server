const firebaseAdmin = require ('firebase-admin');
const firebase = require ('./config/firebaseConfig');
module.exports = async (req, res, next) => {
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith ('Bearer ')
    ) {
      throw 'Unauthorized';
    }
    const idToken = req.headers.authorization.split ('Bearer ')[1];
    //console.log (idToken);
    req.user = await firebaseAdmin.auth ().verifyIdToken (idToken);
    
    next ();
  } catch (error) {
    console.log (error);
    res.status (401);
    res.json ({
      error: error
    });
  }
};
