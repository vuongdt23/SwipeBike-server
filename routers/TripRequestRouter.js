const express = require ('express');
const TripRequestRouter = express.Router ();
const {PrismaClient} = require ('@prisma/client');
const prisma = new PrismaClient ();
const moment = require ('moment');
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
    })
    .then (MyTrip => {
      prisma.candidateTrip
        .findFirst ({
          where: {
            CandidateTripId: theirTripId,
          },
        })
        .then (TheirTrip => {
          if (MyTrip.CandidateTripBike) {
            prisma.tripRequest
              .create ({
                data: {
                  RequestCreatorId: user.profile.UserId,
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
                  TripStatusId: 5,
                },
              })
              .then (prismaResult => {
                res.status (200);

                res.json (prismaResult);
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
                  RequestCreateTime: moment ().toISOString (),
                },
              })
              .then (prismaResult => {
                res.status (200);

                res.json (prismaResult);
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
            prisma.trip.create ({
              data: {
                TripTime: TripRequest.TripTime,
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
                
                

              },
            });
          });
      }
    });
});
module.exports = TripRequestRouter;
