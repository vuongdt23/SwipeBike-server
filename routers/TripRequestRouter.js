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
      include: { CandidateTripCreator: true },
    })
    .then((MyTrip) => {
      prisma.candidateTrip
        .findFirst({
          where: { CandidateTripId: theirTripId },
          include: {
            CandidateTripCreator: true,
          },
        })
        .then((TheirTrip) => {
          let RequestToCreate = {};
          if (MyTrip.CandidateTripBike) {
            RequestToCreate = {
              RequestCreatorId: MyTrip.CandidateTripCreator.UserId,
              RequestTargetId: TheirTrip.CandidateTripCreator.UserId,
              CreatorBike: true,
              RequestCreateTime: moment().toISOString(),
              DriverFromAddress: MyTrip.CandidateTripFromAddress,
              DriverFromLat: MyTrip.CandidateTripFromLat,
              DriverFromLong: MyTrip.CandidateTripFromLong,
              DriverToAddress: MyTrip.CandidateTripToAddress,
              DriverToLat: MyTrip.CandidateTripToLat,
              DriverToLong: MyTrip.CandidateTripToLong,
              PassengerFromAddress: TheirTrip.CandidateTripFromAddress,
              PassengerFromLat: TheirTrip.CandidateTripFromLat,
              PassengerFromLong: TheirTrip.CandidateTripFromLong,
              PassengerToAddress: TheirTrip.CandidateTripToAddress,
              PassengerToLat: TheirTrip.CandidateTripToLat,
              PassengerToLong: TheirTrip.CandidateTripToLong,
              TripStatusId: 5,
              CandidateTripFrom: MyTrip.CandidateTripId,
              CandidateTripSent: TheirTrip.CandidateTripId,
              TripTime: MyTrip.CandidateTripDateTime,
              TripTime: MyTrip.CandidateTripDateTime,
            };
          } else {
            RequestToCreate = {
              RequestCreatorId: MyTrip.CandidateTripCreator.UserId,
              RequestTargetId: TheirTrip.CandidateTripCreator.UserId,
              CreatorBike: false,
              RequestCreateTime: moment().toISOString(),
              DriverFromAddress: TheirTrip.CandidateTripFromAddress,
              DriverFromLat: TheirTrip.CandidateTripFromLat,
              DriverFromLong: TheirTrip.CandidateTripFromLong,
              DriverToAddress: TheirTrip.CandidateTripToAddress,
              DriverToLat: TheirTrip.CandidateTripToLat,
              DriverToLong: TheirTrip.CandidateTripToLong,

              PassengerFromAddress: MyTrip.CandidateTripFromAddress,
              PassengerFromLat: MyTrip.CandidateTripFromLat,
              PassengerFromLong: MyTrip.CandidateTripFromLong,
              PassengerToAddress: MyTrip.CandidateTripToAddress,
              PassengerToLat: MyTrip.CandidateTripToLat,
              PassengerToLong: MyTrip.CandidateTripToLong,
              TripStatusId: 5,
              TripTime: MyTrip.CandidateTripDateTime,

              CandidateTripFrom: MyTrip.CandidateTripId,
              CandidateTripSent: TheirTrip.CandidateTripId,
            };
          }

          prisma.tripRequest
            .create({ data: RequestToCreate })
            .then((requestCreateResult) => {
              res.json({
                message: "send Request Successfully",
                result: requestCreateResult,
              });

              prisma.userNotification
                .create({
                  data: {
                    UserNotificationContent: "muốn ghép đôi chuyến đi với bạn",
                    NotificationTargetId: TheirTrip.CreatorId,
                    UserNotificationTitle: "muốn ghép đôi chuyến đi với bạn",
                    CreatorImage: MyTrip.CandidateTripCreator.UserProfilePic,
                    NotificationRead: false,
                    NotificationTypeId: 1,
                    NotificationCreatorId: MyTrip.CreatorId,
                    NotificationCreateTime: moment().toISOString(),
                  },
                })
                .then((result) => {
                  getFCMTokensByUserId(
                    TheirTrip.CandidateTripCreator.UserAccount
                  )
                    .then((FCMtokens) => {
                      const tokens = [];
                      FCMtokens.forEach((doc) => tokens.push(doc.data().token));
                      console.log("sending push notis to devices ", tokens);

                      NotifyOfRequestCreation(
                        tokens,
                        MyTrip.CandidateTripCreator.UserFullName,
                        MyTrip.CandidateTripCreator.UserProfilePic
                      );
                    })
                    .catch((error) => {
                      res.status(500).send("something went wrong");
                    });
                });
            });
        });
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
        return;
      } else {
        if (tripRequest.TripStatusId !== 5) {
          res.status(401);
          res.send("You are not authorized to reject this request");
          return;
        }
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
                    NotificationTypeId: 3,
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
        return;
      } else {
        if (tripRequest.TripStatusId !== 5) {
          res.status(401);
          res.send("You are not authorized to reject this request");
          return;
        }
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
                      NotificationTypeId: 4,
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

TripRequestRouter.post("/acceptRequest/:requestId", (req, res, next) => {
  const userProfile = req.user.profile;
  const requestId = Number.parseInt(req.params.requestId);

  prisma.tripRequest
    .findFirst({
      where: {
        RequestId: requestId,
      },
    })
    .then((TripRequest) => {
      if (TripRequest.RequestTargetId !== Number.parseInt(userProfile.UserId)) {
        res.status(401).send("You are not authorized to accept this request");
        return;
      }

      if (TripRequest.TripStatusId !== 5) {
        res
          .status(401)
          .send("You are not authorized to make changes to this request");
        return;
      }
      const TripToCreate = {
        TripDriverId: TripRequest.RequestCreatorId,
        TripPassengerId: TripRequest.RequestTargetId,
        CreatorBike: false,
        DriverFromAddress: TripRequest.DriverFromAddress,
        DriverFromLat: TripRequest.DriverFromLat,
        DriverFromLong: TripRequest.DriverFromLong,
        DriverToAddress: TripRequest.DriverToAddress,
        DriverToLat: TripRequest.DriverToLat,
        DriverToLong: TripRequest.DriverToLong,
        PassengerFromAddress: TripRequest.PassengerFromAddress,
        PassengerFromLat: TripRequest.PassengerFromLat,
        PassengerFromLong: TripRequest.PassengerFromLong,
        PassengerToAddress: TripRequest.PassengerToAddress,
        PassengerToLat: TripRequest.PassengerToLat,
        PassengerToLong: TripRequest.PassengerToLong,
        TripCreatedTime: moment().toISOString(),
        TripStartTime: TripRequest.TripTime,
        FromRequest: TripRequest.RequestId,
        TripStatusID: 2
      };

      prisma.trip.create({ data: TripToCreate }).then((createTripResult) => {
        prisma.tripRequest
          .updateMany({
            data: { TripStatusId: 7 },
            where: {
              RequestId: TripRequest.RequestId,
            },
          })
          .then((updateResult) => {
            console.log("set status of the request to accepted", updateResult);
            res.status(200).json({
              message: "accept request successfully",
              result: createTripResult,
            });
          });

        prisma.user
          .findFirst({ where: { UserId: TripRequest.RequestCreatorId } })
          .then((pushNotiReciever) => {
            getFCMTokensByUserId(pushNotiReciever.UserAccount).then(
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
                NotificationTargetId: pushNotiReciever.UserId,
                UserNotificationContent: "đã chấp nhận yêu cầu đôi chuyến đi",
                UserNotificationTitle: "Yêu cầu được chấp nhận",
                NotificationTypeId: 2,
              },
            });
          });
      });
    });
});
module.exports = TripRequestRouter;
