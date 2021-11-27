const firebaseAdmin = require ('firebase-admin');
const {PrismaClient} = require ('@prisma/client');
const prisma = new PrismaClient;
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
    const user = await firebaseAdmin.auth ().verifyIdToken (idToken);
    user.profile = await prisma.user.findFirst({
      where:{
        UserAccount: user.uid
      }
    });

    //console.log(user)
    req.user = user;
   

  
   // console.log("user authenticated with jwt token", user);
    next ();
  } catch (error) {
    console.log (error);
    res.status (401);
    res.json ({
      error: error
    });
  }
};
