const express = require ('express');
const CandidateTripRouter = express.Router ();
const {PrismaClient} = require ('@prisma/client');
const prisma = new PrismaClient ();
const {getDistancesToLocation} = require ('../MapAPIOperations/DistanceMatrix');

CandidateTripRouter.get ('/:id', (req, res, next) => {
  prisma.candidateTrip
    .findUnique ({
      where: {
        CandidateTripId: req.params.id,
      },
    })
    .then (result => {
      res.json (result);
    })
    .catch (error => {
      res.json ({
        error: error,
      });
    });
});

CandidateTripRouter.post ('/create', (req, res, next) => {
  const CandidateTrip = {
    CreatorId: req.user.profile.UserId,
    CandidateTripFromLat: req.body.CandidateTripFromLat,
    CandidateTripFromLong: req.body.CandidateTripFromLong,
    CandidateTripToLong: req.body.CandidateTripToLong,
    CandidateTripFromAddress: req.body.CandidateTripFromAddress,
    CandidateTripToAddress: req.body.CandidateTripToAddress,
    CandidateTripToLat: req.body.CandidateTripToLat,
    CandidateTripBike: req.body.CandidateTripBike,
    CandidateTripMessage: req.body.CandidateTripMessage,
    CandidateTripDateTime: req.body.CandidateTripDateTime,
    TripStatusId: 1,
  };

  prisma.candidateTrip
    .create ({
      data: CandidateTrip,
    })
    .then (result => {
      res.status (200);
      res.json (result);

      console.log ('trip created', result);
    })
    .catch (error => {
      res.status (500);
      res.json ({
        error: error,
      });

      console.log ('trip creation error', error);
    });
});

CandidateTripRouter.get ('/recommendation/:CandidateTripId', (req, res) => {
  const CandidateTripID = Number.parseInt (req.params.CandidateTripId);

  //Get the details of the trip for recommendation
  prisma.candidateTrip
    .findFirst ({
      where: {
        CandidateTripId: CandidateTripID,
      },
    })
    .then (tripToRec => {
      console.log ('detail of trip', tripToRec);
      let StartLocation = [];
      StartLocation.push ({
        lat: tripToRec.CandidateTripFromLat,
        lng: tripToRec.CandidateTripFromLong,
      });

      let DestinationLocation = [];
      DestinationLocation.push ({
        lat: tripToRec.CandidateTripToLat,
        lng: tripToRec.CandidateTripToLong,
      });

      prisma.candidateTrip
        .findMany ({
          where: {TripStatusId: 1},
          include: {
            CandidateTripCreator: {
              select: {UserFullName: true, UserProfilePic: true, UserId: true},
            },
          },
        })
        .then (activeTrips => {
          let ActiveTrips = activeTrips;

          ActiveTrips = ActiveTrips.filter (trip => {
            return trip.CandidateTripBike !== tripToRec.CandidateTripBike;
          }).filter (trip => {
            return trip.CreatorId != tripToRec.CreatorId;
          });
          console.log ('Active Trips: ', ActiveTrips);
          let ActiveTripOrigins = ActiveTrips.map (trip => {
            return {
              lat: trip.CandidateTripFromLat,
              lng: trip.CandidateTripFromLong,
            };
          });
          console.log ('Active Trips Origins ', ActiveTripOrigins);
          let ActiveTripDestinations = ActiveTrips.map (trip => {
            return {
              lat: trip.CandidateTripToLat,
              lng: trip.CandidateTripToLong,
            };
          });
          console.log ('Active Trips Destinations ', ActiveTripDestinations);
          getDistancesToLocation (StartLocation, ActiveTripOrigins)
            .then (matrixAPIOriginRes => {
              let originPointDistances = matrixAPIOriginRes.data;
              console.log (
                'distances between original points ',
                JSON.stringify (originPointDistances.rows)
              );
              getDistancesToLocation (
                DestinationLocation,
                ActiveTripDestinations
              )
                .then (matrixAPIDesRes => {
                  let desPointDistances = matrixAPIDesRes.data;

                  console.log (
                    'distances between destination points',
                    JSON.stringify (desPointDistances.rows)
                  );

                  for (let i = 0; i < ActiveTrips.length; i++) {
                    ActiveTrips[i].originDistance =
                      originPointDistances.rows[i].elements;
                    ActiveTrips[i].desDistance =
                      desPointDistances.rows[i].elements;
                  }

                  //List of all the active trips currently and its distances to the origin and destination of the trip to recommend
                  res.json ({recommendation: ActiveTrips});
                  //
                })
                .catch (err => {
                  console.log (err);
                  res.status (500);
                  res.json ({
                    err: err,
                  });
                });
            })
            .catch (err => {
              console.log (err);
              res.status (500);
              res.json ({
                err: err,
              });
            });
        })
        .catch (err => {
          console.log (err);
          res.status (500);
          res.json ({
            err: err,
          });
        });
    });
});

CandidateTripRouter.get ('/getbycreator/:CreatorId', (req, res) => {
  const CreatorID = Number.parseInt (req.params.CreatorId);

  prisma.candidateTrip
    .findMany ({
      where: {
        CreatorId: CreatorID,
      },
      include: {
        CandidateTripCreator: {
          select: {
            UserFullName: true,
            UserProfilePic: true,
            UserId: true,
          },
        },
      },
    })
    .then (result => {
      res.json ({
        trips: result,
      });
    });
});
module.exports = CandidateTripRouter;
