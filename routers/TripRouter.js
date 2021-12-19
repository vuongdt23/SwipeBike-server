const express = require ('express');
const TripRouter = express.Router ();
const {PrismaClient} = require ('@prisma/client');
const prisma = new PrismaClient ();

TripRouter.get ('/getMyTrips', (req, res, next) => {
  const user = req.user.profile;

  console.log ('user requested trips', user.UserId);
  prisma.trip
    .findMany ({
    
      where: {
        OR:[{
          TripDriverId: Number.parseInt(user.UserId),

        },
      {
        TripPassengerId: Number.parseInt(user.UserId),
      }]
        
        
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

module.exports = TripRouter;
