const express = require ('express');
const TripRouter = express.Router ();
const {PrismaClient} = require ('@prisma/client');
const prisma = new PrismaClient ();
const {NotifyOfTripCancellation} = require ('../FCMOperations/TripRequest');
const {getFCMTokensByUserId} = require ('../FCMOperations/TokenStore');
const moment = require ('moment');
const {resolveSoa} = require ('dns');
TripRouter.get ('/getMyTrips', (req, res, next) => {
  const user = req.user.profile;

  console.log ('user requested trips', user.UserId);
  prisma.trip
    .findMany ({
      where: {
        TripStatusID: 2,
        OR: [
          {
            TripDriverId: Number.parseInt (user.UserId),
          },
          {
            TripPassengerId: Number.parseInt (user.UserId),
          },
        ],
      },
      include: {
        TripDriver: {
          select: {
            UserProfilePic: true,
            UserFullName: true,
          },
        },
        TripPassenger: {
          select: {
            UserProfilePic: true,
            UserFullName: true,
          },
        },
      },
    })
    .then (tripList => {
      res.json ({
        trips: tripList,
      });
    })
    .catch (error => {
      res.status (500).json ({
        message: 'something is wrong',
      });
      console.log (error);
    });
});

TripRouter.post ('/cancelTrip/:tripId', (req, res) => {
  const tripId = Number.parseInt (req.params.tripId);
  const userProfile = req.user.profile;
  prisma.trip
    .findFirst ({
      where: {
        TripId: tripId,
      },
      include: {TripDriver: true, TripPassenger: true},
    })
    .then (TripToCancel => {
      console.log ('user sending cancel request', userProfile.UserId);
      console.log ('user  as driver', TripToCancel.TripDriverId);
      console.log ('user  as passenger', TripToCancel.TripPassengerId);
      if (
        TripToCancel.TripDriverId !== userProfile.UserId &&
        TripToCancel.TripPassengerId !== userProfile.UserId
      ) {
        res.status (401).send ('you are not authorized to cancel this trip');
        return;
      }

      prisma.trip
        .updateMany ({
          where: {
            TripId: TripToCancel.TripId,
          },
          data: {
            TripStatusID: 8,
          },
        })
        .then (tripCancelResult => {
          res.status (200).send ('cancel trip sucessfully');

          if (TripToCancel.TripDriverId === userProfile.UserId) {
            getFCMTokensByUserId (
              TripToCancel.TripPassenger.UserAccount
            ).then (FCMTokens => {
              const tokens = [];
              FCMTokens.forEach (doc => tokens.push (doc.data ().token));
              console.log ('sending push notis to devices ', tokens);
              NotifyOfTripCancellation (
                tokens,
                TripToCancel.TripDriver.UserFullName,
                TripToCancel.TripDriver.UserProfilePic
              );
            });

            prisma.userNotification.create ({
              data: {
                UserNotificationContent: '???? hu??? chuy???n ??i v???i b???n',
                NotificationTargetId: TripToCancel.TripPassengerId,
                UserNotificationTitle: '???? hu??? chuy???n ??i v???i b???n',
                CreatorImage: TripToCancel.TripDriver.UserProfilePic,
                NotificationRead: false,
                NotificationTypeId: 5,
                NotificationCreatorId: TripToCancel.TripDriverId,
                NotificationCreateTime: moment ().toISOString (),
              },
            });
          }

          if (TripToCancel.TripPassengerId === userProfile.UserId) {
            getFCMTokensByUserId (
              TripToCancel.TripDriver.UserAccount
            ).then (FCMTokens => {
              const tokens = [];
              FCMTokens.forEach (doc => tokens.push (doc.data ().token));
              console.log ('sending push notis to devices ', tokens);
              NotifyOfTripCancellation (
                tokens,
                TripToCancel.TripPassenger.UserFullName,
                TripToCancel.TripPassenger.UserProfilePic
              );
            });

            prisma.userNotification.create ({
              data: {
                UserNotificationContent: '???? hu??? chuy???n ??i v???i b???n',
                NotificationTargetId: TripToCancel.TripDriverId,
                UserNotificationTitle: '???? hu??? chuy???n ??i v???i b???n',
                CreatorImage: TripToCancel.TripPassenger.UserProfilePic,
                NotificationRead: false,
                NotificationTypeId: 5,
                NotificationCreatorId: TripToCancel.TripPassengerId,
                NotificationCreateTime: moment ().toISOString (),
              },
            });
          }
        });
    });
});

TripRouter.post ('/rateTrip/:tripId', (req, res) => {
  const ToRateTripId = Number.parseInt (req.params.tripId);
  const Liked = req.body.Liked;
  const userId = req.user.profile.UserId;
  prisma.trip
    .findFirst ({where: {TripId: ToRateTripId}})
    .then (TripToRate => {
      if (
        TripToRate.TripPassengerId !== userId &&
        TripToRate.TripDriverId !== userId
      ) {
        res.status (401).send ('You are not authorized to rate this trip');
        return;
      } else {
        let UserIdToRate = 0;
        if (TripToRate.TripDriverId === userId)
          UserIdToRate = TripToRate.TripPassengerId;
        if (TripToRate.TripPassengerId === userId)
          UserIdToRate = TripToRate.TripDriverId;
        prisma.userRating
          .create ({
            data: {
              RatingLiked: Liked,
              UserId: UserIdToRate,
              TripId: TripToRate.TripId,
            },
          })
          .then (rateSuccess => {
            console.log (rateSuccess);
            res.status (200).send ('rate trip sucessfully');
          })
          .catch (error => {
            console.log (error);
            res.status (500).send ('Something went wrong');
          });
      }
    })
    .catch (error => {
      console.log (error);

      res.status (500).send ('Something went wrong');
    });
});

TripRouter.get ('/getUserCompleteTrips', (req, res) => {
  const userId = req.user.profile.UserId;

  prisma.trip
    .findMany ({
      where: {
        TripStatusID: 3,
        OR: [{TripDriverId: userId}, {TripPassengerId: userId}],
      },
      include: {UserRatings: true, TripDriver: true, TripPassenger: true},
    })
    .then (tripList => {
      res.status (200).json ({
        trips: tripList,
      });
    })
    .catch (error => {
      console.log (error);
      res.status (500).send ('Something went wrong');
    });
});

module.exports = TripRouter;
