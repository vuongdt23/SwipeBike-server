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
    CandidateTripFromLat: req.body.CandidateTripFromLat,
    CandidateTripFromLong: req.body.CandidateTripFromLong,
    CandidateTripToLong: req.body.CandidateTripToLong,
    CandidateTripFromAddress: req.body.CandidateTripFromAddress,
    CandidateTripToAddress: req.body.CandidateTripToAddress,
    CandidateTripToLat: req.body.CandidateTripToLat,
    CandidateTripBike: req.body.CandidateTripBike,
    CandidateTripMessage: req.body.CandidateTripMessage,
    CandidateTripDateTime: req.body.CandidateTripDateTime
  };

  prisma.candidateTrip
    .create ({
      data: CandidateTrip,
    })
    .then (result => {
      res.status (200);
      res.json (result);

      console.log("trip created", result);
    })
    .catch (error => {
      res.status (500);
      res.json ({
        error: error,
       
      });
      
      console.log("trip creation error", error);
    });
});

CandidateTripRouter.get ('/recommendation/:CandidateTripId', (req, res) => {
  const CandidateTripID = req.params.CandidateTripId;

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

CandidateTripRouter.get('/getbycreator/:CreatorId', (req, res)=>{
  const CreatorID = req.params.CreatorID;

  prisma.candidateTrip.findMany({
    where:{
      CreatorId: CreatorID
    }
  }).then(result=>{
    res.json({
      trips: result
    })
  })
})
module.exports = CandidateTripRouter;
