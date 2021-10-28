const express = require ('express');
const CandidateTripRouter = express.Router ();
const {PrismaClient} = require ('@prisma/client');
const prisma = new PrismaClient ();

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
    CandidateTripFrom: req.body.CandidateTripFrom,
    CandidateTripTo: req.body.CandidateTripTo,
    CandidateTripBike: req.body.CandidateTripBike,
    TripStatusId: req.body.TripStatusId,
    CandidateTripMessage: req.body.CandidateTripMessage,
  };

  prisma.candidateTrip
    .create ({
      data: CandidateTrip,
    })
    .then (result => {
      res.status (200);
      res.json (result);
    })
    .catch (error => {
      res.status (500);
      res.json ({
        error: error,
      });
      console.log (error);
    });
});

CandidateTripRouter.post ('/recommendation', (req, res) => {
  const CandidateTripID = req.body.CandidateTripId;

  prisma.candidateTrip
    .findFirst ({
      where: {
        CandidateTripId: CandidateTripID,
      },
    })
    .then (trip => {
     

        //TODO: Handling these base on location with a proper location service
      prisma.candidateTrip
      .findMany ({
        where: {
          NOT: {
            CandidateTripId: trip.CandidateTripId,
          },
          CandidateTripFrom: trip.CandidateTripFrom,
          CandidateTripTo: trip.CandidateTripTo,
        },
      })
      .then (result => {
        res.json ({recommendation: result});
        console.log (result);
      })
      .catch (error => {
        res.status (500);
        res.json ({error: error});
        console.log (error);
      });
    });


 
});
module.exports = CandidateTripRouter;
