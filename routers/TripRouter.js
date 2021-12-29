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
                UserNotificationContent: 'đã huỷ chuyến đi với bạn',
                NotificationTargetId: TripToCancel.TripPassengerId,
                UserNotificationTitle: 'đã huỷ chuyến đi với bạn',
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
                UserNotificationContent: 'đã huỷ chuyến đi với bạn',
                NotificationTargetId: TripToCancel.TripDriverId,
                UserNotificationTitle: 'đã huỷ chuyến đi với bạn',
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
      if (TripToRate.TripPassengerId !== userId) {
        res.status (401).send ('You are not authorized to rate this trip');
        return;
      } else if (TripToRate.TripRatingId !== null) {
        console.log (
          'The rating of the trip is null ',
          !TripToRate.TripRatingId
        );
        res.status (400).send ('Trip trip is not to be rated');
        return;
      } else {
        prisma.userRating
          .create ({
            data: {
              RatingLiked: Liked,
              UserId: TripToRate.TripDriverId,
            },
          })
          .then (createdRating => {
            prisma.trip
              .updateMany ({
                where: {TripId: ToRateTripId},
                data: {TripRatingId: createdRating.RatingId},
              })
              .then (updateSucessResult => {
                res.send ('Rated the trip sucessfully');
                console.log(updateSucessResult)
              })
              .catch (error => {
                console.log (error);

                res.status (500).send ('Something went wrong');
              });
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

module.exports = TripRouter;
