const express = require ('express');
const NotificationRouter = express.Router ();

const {saveTokenToStore} = require ('../FCMOperations/TokenStore');
const {PrismaClient} = require ('@prisma/client');
const prisma = new PrismaClient ();
NotificationRouter.post ('/register', (req, res) => {
  const user = req.user;
  const token = req.body.token;

  saveTokenToStore (token, user.uid).then (result => {
    res.status (200).json ({
      message: 'Successfully registered FCM Token!',
      result: result,
    });
    console.log (result);
  });
});

NotificationRouter.get ('/getMyNotifications', (req, res) => {
  const user = req.user;
  prisma.userNotification
    .findMany ({
      where: {
        NotificationTargetId: user.profile.UserId,
      },
      include: {
        NotificationCreator: {
          select: {UserFullName: true},
        },
      },
      orderBy: {NotificationCreateTime: 'desc'},
    })
    .then (notiList => {
      res.status (200).json ({
        notifications: notiList,
      });
    });
});

NotificationRouter.post ('/setNotificationAsRead/:notiId', (req, res) => {
  const NotiId = Number.parseInt (req.params.notiId);
  prisma.userNotification
    .updateMany ({
      where: {NotificationId: NotiId},
      data: {NotificationRead: true},
    })
    .then (result => {
      console.log (result);
      res.send ('set notification as read success');
    })
    .catch (error => {
      console.log (error);
      res.status (500).send ('something went wrong');
    });
});

NotificationRouter.post ('/setAllMyNotificationsAsRead', (req, res) => {
  const user = req.user;

  prisma.userNotification
    .updateMany ({
      where: {NotificationTargetId: user.profile.UserId},
      data: {NotificationRead: true},
    })
    .then (result => {
      console.log (result);
      res.send ('All notifications are read');
    })
    .catch (error => {
      console.log (error);
      res.status (500).send ('something went wrong');
    });
});


NotificationRouter.get ('/hasNewNotifications', (req, res) => {
  const user = req.user;

  prisma.userNotification
    .findMany ({
      where: {
        NotificationRead: false,
        NotificationTargetId: user.profile.UserId,
      },
    })
    .then (result => {
      if (result.length > 0) {
        res.json ({HasNewNotifications: true});
      } else {
        res.json ({HasNewNotifications: false});
      }
    })
    .catch (error => {
      console.log (error);
      res.status (500).send ('something went wrong');
    });
});

module.exports = NotificationRouter;
