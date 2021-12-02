const express = require ('express');
const TripRequestRouter = express.Router ();
const {PrismaClient} = require ('@prisma/client');
const prisma = new PrismaClient ();
const moment = require ('moment');
const {NotifyOfRequestCreation} = require ('../FCMOperations/TripRequest');
const {getTokensByUserId} = require ('../FCMOperations/TokenStore');
TripRequestRouter.post ('/RouteRecommendation', (req, res, next) => {
  const user = req.user;

  const myTripId = req.body.MyTripId;
  const theirTripId = req.body.TheirTripId;
});

TripRequestRouter.post ('/sendRequest', (req, res, next) => {
  const user = req.user;

  const myTripId = req.body.MyTripId;
  const theirTripId = req.body.TheirTripId;
  prisma.candidateTrip
    .findFirst ({
      where: {
        CandidateTripId: myTripId,
      },
      include: {
        CandidateTripCreator: true,
      },
    })
    .then (MyTrip => {
      prisma.candidateTrip
        .findFirst ({
          where: {
            CandidateTripId: theirTripId,
          },
          include: {
            CandidateTripCreator: true,
          },
        })
        .then (TheirTrip => {
          if (MyTrip.CandidateTripBike) {
            prisma.tripRequest
              .create ({
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
                  RequestCreateTime: moment ().toISOString (),
                  RequestTargetId: TheirTrip.CreatorId,
                  TripStatusId: 5,
                },
              })
              .then (prismaResult => {
                getTokensByUserId (
                  TheirTrip.CandidateTripCreator.UserAccount
                ).then (firestoreResult => {
                  let tokenArr = [];
                  firestoreResult.forEach (doc => {
                    tokenArr.push (doc.data ().token);
                  });
                  console.log (tokenArr);
                  //FCM
                  NotifyOfRequestCreation (tokenArr);
                  res.status (200);

                  res.json (prismaResult);
                });
              })
              .catch (error => {
                res.status (500);
                res.json ({
                  error: error,
                });
              });
          } else {
            prisma.tripRequest
              .create ({
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
                  RequestCreateTime: moment ().toISOString (),
                },
              })
              .then (prismaResult => {
                getTokensByUserId (
                  TheirTrip.CandidateTripCreator.UserAccount
                ).then (firestoreResult => {
                  let tokenArr = [];
                  firestoreResult.forEach (doc => {
                    tokenArr.push (doc.data ().token);
                  });
                  console.log (tokenArr);
                  //FCM
                  NotifyOfRequestCreation (tokenArr);
                  res.status (200);

                  res.json (prismaResult);
                });
              })
              .catch (error => {
                res.status (500);
                res.json ({
                  error: error,
                });
              });
          }
        });
    })
    .catch (error => {
      res.status (500);
      console.log (err);
      res.json ({
        err: error,
      });
    });
});

TripRequestRouter.post ('/acceptRequest/:requestId', (req, res, next) => {
  const userId = Number.parseInt (req.user.profile.UserId);
  const requestId = Number.parseInt (req.params.requestId);
  prisma.tripRequest
    .findFirst ({where: {RequestId: requestId}})
    .then (TripRequest => {
      if (TripRequest.RequestTargetId !== userId) {
        res.status (401);
        res.send ('You are not authorized to accept this request');
      } else {
        prisma.tripRequest
          .update ({
            where: {RequestId: TripRequest.RequestId},
            data: {
              TripStatusId: 2,
            },
          })
          .then (updateResult => {
            prisma.trip
              .create ({
                data: {
                  TripTime: TripRequest.TripTime,
                  DriverFromAddress: TripRequest.DriverFromAddress,
                  DriverFromLat: TripRequest.DriverFromLat,
                  DriverFromLong: TripRequest.DriverFromLong,
                  DriverToAddress: TripRequest.DriverToAddress,
                  DriverToLat: TripRequest.DriverToLat,
                  DriverToLong: TripRequest.DriverToLong,
                  CreatorBike: TripRequest.CreatorBike,
                  TripCreatedTime: moment ().toISOString (),
                  PassengerFromAddress: TripRequest.PassengerFromAddress,
                  PassengerFromLat: TripRequest.PassengerFromLat,
                  PassengerFromLong: TripRequest.PassengerFromLong,
                  PassengerToAddress: TripRequest.PassengerToAddress,
                  PassengerToLat: TripRequest.PassengerToLat,
                  PassengerToLong: TripRequest.PassengerToLong,
                  TripDriverId: TripRequest.CreatorBike
                    ? TripRequest.RequestCreatorId
                    : TripRequest.RequestTargetId,
                },
              })
              .then (createTripResult => {
                res
                  .status (200)
                  .json ({
                    message: 'accept request sucessfully',
                    trip: createTripResult,
                  })
                  .catch (error => {
                    res.status (500).json ({error: error});
                  });
              });
          })
          .catch (error => {
            res.status (500).json ({error: error});
          });
      }
    })
    .catch (error => {
      res.status (500).json ({error: error});
    });
});

TripRequestRouter.get ('/getUserPendingSentRequests', (req, res, next) => {
  const user = req.user.profile;

  prisma.tripRequest
    .findMany ({
      where: {
        RequestCreatorId: Number.parseInt (user.UserId),
        TripStatusId: 5,
      },
    })
    .then (result => {
      res.status (200).json ({
        requests: result,
      });
    });
});
TripRequestRouter.get ('/getUserPendingReceivedRequests', (req, res, next) => {
  const user = req.user.profile;

  prisma.tripRequest
    .findMany ({
      where: {
        RequestTargetId: Number.parseInt (user.UserId),
        TripStatusId: 5,
      },
    })
    .then (result => {
      res.status (200).json ({
        requests: result,
      });
    })
    .catch (error => {
      res.status (500).json ({error: error});
    });
});
module.exports = TripRequestRouter;
