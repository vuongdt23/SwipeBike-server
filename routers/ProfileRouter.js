const express = require ('express');
const ProfileRouter = express.Router ();
const {PrismaClient} = require ('@prisma/client');
const firebaseAdmin = require ('firebase-admin');
const storageBucket = require ('../APIKeys/storageBucket');
const multer = require ('multer');
const {format} = require ('path/posix');
const prisma = new PrismaClient ();
const upload = multer ({
  storage: multer.memoryStorage (),
});
const {sendEmailVerification} = require ('firebase/auth');
const {truncate} = require ('fs');

ProfileRouter.get ('/view', (req, res, next) => {
  const user = req.user;
  console.log (user);

  prisma.user
    .findFirst ({
      where: {
        UserAccount: user.uid,
      },
    })
    .then (async response => {
      response.IsVerified = user.email_verified;
      const LikeCount = await prisma.userRating.aggregate ({
        _count: true,
        where: {RatingLiked: true, UserId: response.UserId},
      });
      const DisLikeCount = await prisma.userRating.aggregate ({
        _count: true,
        where: {RatingLiked: false, UserId: response.UserId},
      });
      response.LikeCount = LikeCount._count;
      response.DisLikeCount = DisLikeCount._count;
      res.json (response);
    })
    .catch (firebaseError => {
      res.json ({
        error: firebaseError,
      });
    });
});
ProfileRouter.get ('/getProfileById/:userId', (req, res, next) => {
  const userId = Number.parseInt (req.params.userId);
  prisma.user
    .findFirst ({
      where: {
        UserId: userId,
      },
      include: {UserUniversity: true},
    })
    .then (async response => {
      const LikeCount = await prisma.userRating.aggregate ({
        _count: true,
        where: {RatingLiked: true, UserId: userId},
      });
      const DisLikeCount = await prisma.userRating.aggregate ({
        _count: true,
        where: {RatingLiked: false, UserId: userId},
      });
      response.LikeCount = LikeCount._count;
      response.DisLikeCount = DisLikeCount._count;
      res.json ({
        profile: response,
      });
    })
    .catch (err => {
      res.status (500).json ({
        message: 'something went wrong',
        error: err,
      });
    });
});
ProfileRouter.post ('/update', (req, res, next) => {
  const updateInfo = {
    UserFullName: req.body.UserFullName,
    UserPhone: req.body.UserPhone,
    UserGender: req.body.UserGender,
  };
  const user = req.user;
  prisma.user
    .updateMany ({
      where: {
        UserAccount: user.uid,
      },
      data: {
        UserFullName: updateInfo.UserFullName,
        UserPhone: updateInfo.UserPhone,
        UserGender: updateInfo.UserGender,
      },
    })
    .then (result => {
      res.json (result);
    })
    .catch (error => {
      res.statusCode = 500;
      res.json ({
        error: error,
      });
    });
});

ProfileRouter.post ('/setup', (req, res, next) => {
  const updateInfo = {
    UserFullName: req.body.UserFullName,
    UserPhone: req.body.UserPhone,
    UserGender: req.body.UserGender,
    UserDoB: req.body.UserDoB,
    IsSetUp: true,
  };
  console.log ('update info', updateInfo);
  const user = req.user;
  console.log (user);
  prisma.user
    .updateMany ({
      where: {
        UserAccount: user.uid,
      },
      data: updateInfo,
    })
    .then (result => {
      res.json (result);
    })
    .catch (error => {
      res.statusCode = 500;
      console.log ('profile setup error', error);
      res.json ({
        error: error,
      });
    });
});

ProfileRouter.post ('/updatePic', upload.single ('file'), (req, res, next) => {
  if (!req.file) {
    res.status (400).send ('Error: No files found');
  }

  const user = req.user;
  const time = new Date ().toISOString ();

  // console.log("file ", req.file);
  const fileName = 'user_' + user.profile.UserId + '_pic_' + time;
  const blob = firebaseAdmin.storage ().bucket ().file (fileName);
  const blobWriter = blob.createWriteStream ({
    metadata: {
      contentType: req.file.mimetype,
    },
  });
  blobWriter.on ('error', err => {
    console.log ('error blobwrite', err);
  });
  blobWriter.on ('finish', () => {
    blob.makePublic ().then (() => {
      console.log (blob.publicUrl ());
      prisma.user
        .updateMany ({
          where: {UserAccount: user.uid},
          data: {
            UserProfilePic: blob.publicUrl (),
          },
        })
        .then (result => {
          console.log ('users changed', result.count);
          res.status (200);
          res.json ({
            message: 'Profile pic updated',
          });
        });
    });
  });
  blobWriter.end (req.file.buffer);
});

ProfileRouter.post ('/verifyEmail', (req, res, next) => {
  console.log (req.user);
  if (!req.user.email_verified) {
    res.status (200).send ('this account email is already verified');
    return;
  } else {
  }
});

module.exports = ProfileRouter;
