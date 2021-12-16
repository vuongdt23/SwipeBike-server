const express = require("express");
const TripRequestRouter = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const moment = require("moment");
const {
  NotifyOfRequestCreation,
  NotifyOfRequestRejection,
  NotifyOfRequestCancel,
  NotifyofRequestAcceptance,
} = require("../FCMOperations/TripRequest");
const { getFCMTokensByUserId } = require("../FCMOperations/TokenStore");
const { isMoment } = require("moment");
TripRequestRouter.post("/RouteRecommendation", (req, res, next) => {
  const user = req.user;

  const myTripId = req.body.MyTripId;
  const theirTripId = req.body.TheirTripId;
});

TripRequestRouter.post("/sendRequest", (req, res, next) => {
  const user = req.user;

  const myTripId = req.body.MyTripId;
  const theirTripId = req.body.TheirTripId;
  prisma.candidateTrip
    .findFirst({
      where: {
        CandidateTripId: myTripId,
      },
      include: {
        CandidateTripCreator: true,
      },
    })
    .then((MyTrip) => {
      prisma.candidateTrip
        .findFirst({
          where: {
            CandidateTripId: theirTripId,
          },
          include: {
            CandidateTripCreator: true,
          },
        })
        .then((TheirTrip) => {
          if (MyTrip.CandidateTripBike) {
            prisma.tripRequest
              .create({
                data: {
                  RequestCreatorId: MyTrip.CreatorId,
                  CreatorBike: true,
                  DriverFromAddress: MyTrip.CandidateTripFromAddress,
                  DriverFromLat: MyTrip.CandidateTripFromLat,
                  DriverFromLong: MyTrip.CandidateTripFromLong,
                  DriverToAddress: MyTrip.CandidateTripToAddress,
                  DriverToLat: MyTrip.CandidateTripToLat,
                  DriverToLong: MyTrip.CandidateTripToLong,
                  PassengerFromAddress: TheirTrip.CandidateTripFromAddress,
                  PassengerFromLong: TheirTrip.CandidateTripFromLong,
                  PassengerFromLat: TheirTrip.CandidateTripFromLat,
                  PassengerToAddress: TheirTrip.CandidateTripToAddress,
                  PassengerToLat: TheirTrip.CandidateTripToLat,
                  PassengerToLong: TheirTrip.CandidateTripToLong,
                  RequestCreateTime: moment().toISOString(),
                  RequestTargetId: TheirTrip.CreatorId,
                  TripStatusId: 5,
                },
              })
              .then((prismaResult) => {
                getFCMTokensByUserId(TheirTrip.CandidateTripCreator.UserAccount)
                  .then((firestoreResult) => {
                    let tokenArr = [];
                    firestoreResult.forEach((doc) => {
                      tokenArr.push(doc.data().token);
                    });
                    console.log(tokenArr);
                    //FCM
                    NotifyOfRequestCreation(
                      tokenArr,
                      req.user.profile.UserFullName,
                      req.user.profile.UserProfilePic
                    );
                    prisma.userNotification
                      .create({
                        data: {
                          CreatorImage:
                            MyTrip.CandidateTripCreator.UserProfilePic,
                          NotificationRead: false,
                          NotificationTargetId: TheirTrip.CreatorId,
                          NotificationCreatorId: MyTrip.CreatorId,
                          NotificationCreateTime: moment().toISOString(),
                          UserNotificationContent:
                            " muốn ghép đôi chuyến đi với bạn",
                          UserNotificationTitle: "Lời mời ghép đôi mới",
                          notificationTypeNotificationTypeId: 1,
                        },
                      })
                      .then((NotiCreateResult) => {
                        res.status(200).json(NotiCreateResult);
                      })
                      .catch((error) => {
                        res.status(500);
                        res.json({
                          error: error,
                        });
                      });
                  })
                  .catch((error) => {
                    res.status(500);
                    res.json({
                      error: error,
                    });
                  });
              })
              .catch((error) => {
                res.status(500);
                res.json({
                  error: error,
                });
              });
          } else {
            prisma.tripRequest
              .create({
                data: {
                  CreatorBike: false,
                  RequestCreatorId: MyTrip.CreatorId,
                  DriverFromAddress: TheirTrip.CandidateTripFromAddress,
                  DriverFromLat: TheirTrip.CandidateTripFromLat,
                  DriverFromLong: TheirTrip.CandidateTripFromLong,
                  DriverToAddress: TheirTrip.CandidateTripToAddress,
                  DriverToLat: TheirTrip.CandidateTripToLat,
                  DriverToLong: TheirTrip.CandidateTripToLong,
                  PassengerFromAddress: MyTrip.CandidateTripFromAddress,
                  PassengerFromLong: MyTrip.CandidateTripFromLong,
                  PassengerFromLat: MyTrip.CandidateTripFromLat,
                  PassengerToAddress: MyTrip.CandidateTripToAddress,
                  PassengerToLat: MyTrip.CandidateTripToLat,
                  PassengerToLong: MyTrip.CandidateTripToLong,
                  RequestTargetId: TheirTrip.CreatorId,
                  TripStatusId: 5,
                  RequestCreateTime: moment().toISOString(),
                },
              })
              .then((prismaResult) => {
                getTokensByUserId(
                  TheirTrip.CandidateTripCreator.UserAccount
                ).then((firestoreResult) => {
                  let tokenArr = [];
                  firestoreResult.forEach((doc) => {
                    tokenArr.push(doc.data().token);
                  });
                  console.log(tokenArr);

                  //FCM
                  NotifyOfRequestCreation(tokenArr);

                  prisma.userNotification
                    .create({
                      data: {
                        CreatorImage:
                          MyTrip.CandidateTripCreator.UserProfilePic,
                        NotificationRead: false,
                        NotificationTargetId: TheirTrip.CreatorId,
                        NotificationCreatorId: MyTrip.CreatorId,
                        NotificationCreateTime: moment().toISOString(),
                        UserNotificationContent:
                          MyTrip.CandidateTripCreator.UserFullName +
                          " muốn ghép chuyến đi với bạn",
                        UserNotificationTitle: "Lời mời ghép đôi mới",
                        NotificationType: 1,
                      },
                    })
                    .then((NotiCreateResult) => {
                      res.status(200).json(NotiCreateResult);
                    })
                    .catch((error) => {
                      res.status(500);
                      res.json({
                        error: error,
                      });
                    });
                });
              })
              .catch((error) => {
                res.status(500);
                res.json({
                  error: error,
                });
              });
          }
        });
    })
    .catch((error) => {
      res.status(500);
      console.log(err);
      res.json({
        err: error,
      });
    })
    .catch((error) => {
      res.status(500);
      console.log(err);
      res.json({
        err: error,
      });
    });
});

TripRequestRouter.post("/acceptRequest/:requestId", (req, res, next) => {
  const userId = Number.parseInt(req.user.profile.UserId);
  const requestId = Number.parseInt(req.params.requestId);
  prisma.tripRequest
    .findFirst({ where: { RequestId: requestId } })
    .then((TripRequest) => {
      if (TripRequest.RequestTargetId !== userId) {
        res.status(401);
        res.send("You are not authorized to accept this request");
        return;
      } else {
        prisma.tripRequest
          .update({
            where: { RequestId: TripRequest.RequestId },
            data: {
              TripStatusId: 2,
            },
          })
          .then((updateResult) => {
            prisma.trip
              .create({
                data: {
                  TripStartTime: null,
                  DriverFromAddress: TripRequest.DriverFromAddress,
                  DriverFromLat: TripRequest.DriverFromLat,
                  DriverFromLong: TripRequest.DriverFromLong,
                  DriverToAddress: TripRequest.DriverToAddress,
                  DriverToLat: TripRequest.DriverToLat,
                  DriverToLong: TripRequest.DriverToLong,
                  CreatorBike: TripRequest.CreatorBike,
                  TripCreatedTime: moment().toISOString(),
                  PassengerFromAddress: TripRequest.PassengerFromAddress,
                  PassengerFromLat: TripRequest.PassengerFromLat,
                  PassengerFromLong: TripRequest.PassengerFromLong,
                  PassengerToAddress: TripRequest.PassengerToAddress,
                  PassengerToLat: TripRequest.PassengerToLat,
                  PassengerToLong: TripRequest.PassengerToLong,
                  TripDriverId: TripRequest.CreatorBike
                    ? TripRequest.RequestCreatorId
                    : TripRequest.RequestTargetId,
                  TripPassengerId: TripRequest.CreatorBike
                    ? TripRequest.RequestTargetId
                    : TripRequest.RequestCreatorId,
                  FromRequest: TripRequest.RequestId,
                },
              })
              .then((createTripResult) => {
                prisma.user
                  .findFirst({
                    where: {
                      UserId: TripRequest.RequestCreatorId,
                    },
                  })
                  .then((pushNotireciever) => {
                    getFCMTokensByUserId(pushNotireciever.UserAccount).then(
                      (FCMtokens) => {
                        const tokens = [];
                        FCMtokens.forEach((doc) =>
                          tokens.push(doc.data().token)
                        );
                        console.log("sending push notis to devices ", tokens);
                        NotifyofRequestAcceptance(
                          tokens,
                          req.user.profile.UserFullName,
                          req.user.profile.UserProfilePic
                        );

                        prisma.userNotification.create({
                          data: {
                            NotificationCreateTime: moment().toISOString(),
                            NotificationCreatorId: req.user.profile.UserId,
                            NotificationRead: false,
                            NotificationTargetId: pushNotireciever.UserId,
                            UserNotificationContent:
                              "đã chấp nhận ghép đôi chuyến đi",
                            UserNotificationTitle: "Yêu cầu được chấp nhận",
                            notificationTypeNotificationTypeId: 2,
                          },
                        });
                      }
                    );
                  });
                res.status(200).json({
                  message: "accept request sucessfully",
                  trip: createTripResult,
                });
              });

            //FCM Stuff in Background
          })
          .catch((error) => {
            res.status(500).json({ error: error });
          });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

TripRequestRouter.get("/getUserPendingSentRequests", (req, res, next) => {
  const user = req.user.profile;

  prisma.tripRequest
    .findMany({
      where: {
        RequestCreatorId: Number.parseInt(user.UserId),
        TripStatusId: 5,
      },
      include: {
        RequestCreator: {
          select: {
            UserProfilePic: true,
            UserFullName: true,
          },
        },
        RequestTarget: {
          select: {
            UserProfilePic: true,
            UserFullName: true,
          },
        },
      },
    })
    .then((result) => {
      res.status(200).json({
        requests: result,
      });
    });
});
TripRequestRouter.get("/getUserPendingReceivedRequests", (req, res, next) => {
  const user = req.user.profile;

  prisma.tripRequest
    .findMany({
      where: {
        RequestTargetId: Number.parseInt(user.UserId),
        TripStatusId: 5,
      },
      include: {
        RequestCreator: {
          select: {
            UserProfilePic: true,
            UserFullName: true,
          },
        },
        RequestTarget: {
          select: {
            UserProfilePic: true,
            UserFullName: true,
          },
        },
      },
    })
    .then((result) => {
      res.status(200).json({
        requests: result,
      });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

TripRequestRouter.post("/rejectRequest/:requestId", (req, res, next) => {
  const userProfile = req.user.profile;
  const requestId = Number.parseInt(req.params.requestId);
  prisma.tripRequest
    .findFirst({ where: { RequestId: requestId } })
    .then((tripRequest) => {
      //console.log ('userId, ', userProfile.UserId);
      // console.log ('requestTargetId, ', tripRequest.RequestTargetId);
      if (tripRequest.RequestTargetId !== userProfile.UserId) {
        res.status(401);
        res.send("You are not authorized to reject this request");
      } else {
        prisma.tripRequest
          .update({
            where: { RequestId: tripRequest.RequestId },
            data: {
              TripStatusId: 4,
            },
          })
          .then((prismaResult) => {
            //Handling Notifications
            prisma.user
              .findFirst({ where: { UserId: tripRequest.RequestCreatorId } })
              .then((pushNotireciever) => {
                getFCMTokensByUserId(pushNotireciever.UserAccount).then(
                  (FCMtokens) => {
                    const tokens = [];
                    FCMtokens.forEach((doc) => tokens.push(doc.data().token));
                    console.log("sending push notis to devices ", tokens);
                    NotifyOfRequestRejection(
                      tokens,
                      req.user.profile.UserFullName,
                      req.user.profile.UserProfilePic
                    );
                  }
                );
                prisma.userNotification.create({
                  data: {
                    NotificationCreateTime: moment().toISOString(),
                    NotificationCreatorId: req.user.profile.UserId,
                    NotificationRead: false,
                    NotificationTargetId: pushNotireciever.UserId,
                    UserNotificationContent: "đã từ chối yêu cầu đôi chuyến đi",
                    UserNotificationTitle: "Yêu cầu bị từ chối",
                    notificationTypeNotificationTypeId: 3,
                  },
                });
              });

            res.status(200).json({
              message: "reject request sucesfully",
              result: prismaResult,
            });
          });
      }
    });
});

TripRequestRouter.post("/cancelRequest/:requestId", (req, res, next) => {
  const userProfile = req.user.profile;
  const requestId = Number.parseInt(req.params.requestId);
  prisma.tripRequest
    .findFirst({ where: { RequestId: requestId } })
    .then((tripRequest) => {
      console.log("userId, ", userProfile.UserId);
      console.log("requestCreatorId, ", tripRequest.RequestCreatorId);
      if (tripRequest.RequestCreatorId !== userProfile.UserId) {
        res.status(401);
        res.send("You are not authorized to cancel this request");
      } else {
        prisma.tripRequest
          .update({
            where: { RequestId: tripRequest.RequestId },
            data: {
              TripStatusId: 6,
            },
          })
          .then((prismaResult) => {
            prisma.user
              .findFirst({
                where: { UserId: tripRequest.RequestTargetId },
              })
              .then((NotificationTargetResult) => {
                getFCMTokensByUserId(NotificationTargetResult.UserAccount).then(
                  (FCMTokens) => {
                    const tokens = [];

                    FCMTokens.forEach((doc) => tokens.push(doc.data().token));

                    console.log("sending push notis to devices ", tokens);
                    NotifyOfRequestCancel(
                      tokens,
                      userProfile.UserFullName,
                      userProfile.UserProfilePic
                    );
                  }
                );

                prisma.userNotification
                  .create({
                    data: {
                      NotificationRead: false,
                      NotificationCreateTime: moment().toISOString(),
                      notificationTypeNotificationTypeId: 4,
                      CreatorImage: userProfile.UserProfilePic,
                      UserNotificationTitle: "Yêu cầu ghép đôi bị hủy",
                      UserNotificationContent: "Yêu cầu ghép đôi bị hủy",
                      NotificationTargetId: NotificationTargetResult.UserId,
                      NotificationCreatorId: userProfile.UserId,
                    },
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              })
              .catch((err) => {
                console.log(err);
              });
            res.status(200).json({
              message: "cancel request sucesfully",
              result: prismaResult,
            });
          });
      }
    })
    .catch((err) => {
      res.status(500);
    });
});
module.exports = TripRequestRouter;
