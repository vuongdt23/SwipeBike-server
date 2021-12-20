const {PrismaClient} = require ('@prisma/client');
const prisma = new PrismaClient ();
const scheduler = require ('node-schedule');
const moment = require ('moment');
const rule = new scheduler.RecurrenceRule ();
rule.second = 1;
const updateCandidateTripsTimedOut = () => {
  prisma.candidateTrip
    .findMany ({
      where: {
        TripStatusId: 1,
      },
    })
    .then (ActiveCandidateTrips => {
      let tripIdsToUpdate = [];
      //console.log (ActiveCandidateTrips);
      ActiveCandidateTrips.forEach (candidateTrip => {
        const now = moment ();
        const candidateTripTime = moment (candidateTrip.CandidateTripDateTime);

        let duration = moment.duration (now.diff (candidateTripTime));

        if (duration.asHours () > 2) {
          tripIdsToUpdate.push (candidateTrip.CandidateTripId);
        }
      });

      console.log ('Candidate trips that have timed out', tripIdsToUpdate);

      prisma.candidateTrip
        .updateMany ({
          where: {
            CandidateTripId: {
              in: tripIdsToUpdate,
            },
          },
          data: {TripStatusId: 1},
        })
        .then (updateResult => {
          console.log ('update candidate trips by time sucessfully');
        });
    });
};

const updateRequestsTimedOut = () => {
  prisma.tripRequest
    .findMany ({where: {TripStatusId: 5}})
    .then (ActiveTripRequests => {
      tripRequestIdsToUpdate = [];
      ActiveTripRequests.forEach (tripRequest => {
        const now = moment ();
        const TripTime = moment (tripRequest.TripTime);

        let duration = moment.duration (now.diff (TripTime));

        if (duration.asHours () > 2) {
          tripRequestIdsToUpdate.push (tripRequest.RequestId);
        }
      });
      console.log ('trip requests that have timed out', tripIdsToUpdate);
    });
}


