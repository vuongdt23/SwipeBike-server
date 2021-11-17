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

ProfileRouter.get ('/view', (req, res, next) => {
  const user = req.user;
  prisma.user
    .findFirst ({
      where: {
        UserAccount: user.uid,
      },
    })
    .then (response => {
      response.verified = res.json (response);
    })
    .catch (firebaseError => {
      res.json ({
        error: firebaseError,
      });
    });
});

ProfileRouter.post ('/update', (req, res, next) => {
  console.log ('upload enpoint');
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
  };
  const user = req.user;
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
      prisma.user
        .updateMany ({
          where: {UserId: user.UserId},
          data: {
            UserProfilePic: blob.publicUrl (),
          },
        })
        .then (result => {
          res.status (200);
          res.json ({
            message: 'Profile pic updated',
          });
        });
    });
  });
  blobWriter.end (req.file.buffer);
});

module.exports = ProfileRouter;
