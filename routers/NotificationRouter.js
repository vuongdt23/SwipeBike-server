const express = require("express");
const NotificationRouter = express.Router();

const { saveTokenToStore } = require("../FCMOperations/TokenStore");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
NotificationRouter.post("/register", (req, res) => {
  const user = req.user;
  const token = req.body.token;

  saveTokenToStore(token, user.uid).then((result) => {
    res.status(200).json({
      message: "Successfully registered FCM Token!",
      result: result,
    });
    console.log(result);
  });
});

NotificationRouter.get("/getMyNotifications", (req, res) => {
  const user = req.user;
  prisma.userNotification
    .findMany({
      where: {
        NotificationTargetId: user.profile.UserId,
      },
      include: {
        NotificationCreator: {
          select: { UserFullName: true },
        },
      },
      orderBy: { NotificationCreateTime: "desc" },
    })
    .then((notiList) => {
      res.status(200).json({
        notifications: notiList,
      });
    });
});
module.exports = NotificationRouter;
