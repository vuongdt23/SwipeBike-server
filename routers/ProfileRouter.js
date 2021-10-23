const express = require ('express');
const ProfileRouter = express.Router ();
const {PrismaClient} = require ('@prisma/client');

const prisma = new PrismaClient ();

ProfileRouter.get ('/view', (req, res, next) => {
  const user = req.user;
  prisma.user
    .findFirst ({
      where: {
        UserAccount: user.uid,
      },
    })
    .then (response => {
      res.json (response);
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
    });
});

module.exports = ProfileRouter;
