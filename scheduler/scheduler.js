const {PrismaClient} = require ('@prisma/client');
const prisma = new PrismaClient ();
const scheduler = require ('node-schedule');
const moment = require ('moment');
const {getFCMTokensByUserId} = require ('../FCMOperations/TokenStore');
const {NotifyOfCandidateTripTimedOut} = require ('../FCMOperations/TimedOut');
const firebaseAdmin = require ('firebase-admin');
const apiKey = require ('../APIkeys/apiKey.json');

firebaseAdmin.initializeApp ({
  credential: firebaseAdmin.credential.cert (apiKey),
});

const rule = new scheduler.RecurrenceRule ();
rule.second = 1;

const timeOutDuration = Number (2);

const updateCandidateTripsTimedOut = async () => {
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

        if (
          duration.asHours () > timeOutDuration &&
          now.isAfter (candidateTripTime)
        ) {
          tripIdsToUpdate.push (candidateTrip.CandidateTripId);
        }
      });

      console.log ('Candidate trips that have timed out', tripIdsToUpdate);
      //Update the candidate trips
      prisma.candidateTrip
        .updateMany ({
          where: {
            CandidateTripId: {
              in: tripIdsToUpdate,
            },
          },
          data: {TripStatusId: 9},
        })
        .then (updateResult => {
          console.log (
            'update candidate trips by time sucessfully',
            updateResult
          );
        })
        .catch (error => {
          console.log (error);
        });
      //Sending push notification and create notifications
      prisma.candidateTrip
        .findMany ({
          where: {CandidateTripId: {in: tripIdsToUpdate}},
          select: {CandidateTripCreator: true, CandidateTripId: true},
        })
        .then (usersToReceivePushNotis => {
          usersToReceivePushNotis.forEach (async user => {
            const tokens = [];
            const querySnapshot = await getFCMTokensByUserId (
              user.CandidateTripCreator.UserAccount
            );
            querySnapshot.docs.forEach (doc => {
              tokens.push (doc.data ().token);
            });

            NotifyOfCandidateTripTimedOut (tokens);

            prisma.userNotification.create ({
              data: {
                CreatorImage: user.CandidateTripCreator.UserProfilePic,
                NotificationType: 6,
                NotificationCreateTime: moment ().toISOString (),
                NotificationCreatorId: user.CandidateTripCreator.UserId,
                NotificationTargetId: user.CandidateTripCreator.UserId,
                NotificationRead: false,
                UserNotificationContent: 'Chuyến đi ' +
                  user.CandidateTripId +
                  'của bạn không được ghép đôi và đã hết hạn',
                UserNotificationTitle: 'Chuyến đi ' +
                  user.CandidateTripId +
                  'của bạn không được ghép đôi và đã hết hạn',
              },
            });
          });
        });
    })
    .catch (error => {
      console.log (error);
    });
};

updateCandidateTripsTimedOut ();

const updateRequestsTimedOut = () => {
  prisma.tripRequest
    .findMany ({where: {TripStatusId: 5}})
    .then (ActiveTripRequests => {
      tripRequestIdsToUpdate = [];
      ActiveTripRequests.forEach (tripRequest => {
        const now = moment ();
        const TripTime = moment (tripRequest.TripTime);

        let duration = moment.duration (now.diff (TripTime));

        if (duration.asHours () > timeOutDuration && now.isAfter (TripTime)) {
          tripRequestIdsToUpdate.push (tripRequest.RequestId);
        }
      });
      console.log ('trip requests that have timed out', tripIdsToUpdate);

      prisma.tripRequest
        .updateMany ({
          data: {
            TripStatusId: 10,
          },
          where: {RequestId: {in: tripRequestIdsToUpdate}},
        })
        .then (updateResult => {
          console.log ('updated requests', updateResult);

          //Sending Push Notifications
        })
        .catch (error => {
          console.log (error);
        });
    })
    .catch (error => {
      console.log (error);
    });
};

const updateTripsTimedOut = () => {
  prisma.trip
    .findMany ({where: {TripStatusId: 2}})
    .then (ActiveTrips => {
      tripIdsToUpdate = [];
      ActiveTrips.forEach (trip => {
        const now = moment ();
        const TripTime = moment (trip.TripTime);

        let duration = moment.duration (now.diff (trip));

        if (duration.asHours () > timeOutDuration && now.isAfter (TripTime)) {
          tripIdsToUpdate.push (trip.RequestId);
        }
      });
      console.log ('trip requests that have timed out', tripIdsToUpdate);

      prisma.tripRequest
        .updateMany ({
          data: {
            TripStatusId: 11,
          },
          where: {RequestId: {in: tripRequestIdsToUpdate}},
        })
        .then (updateResult => {
          console.log ('updated requests', updateResult);

          //Sending Push Notifications
        })
        .catch (error => {
          console.log (error);
        });
    })
    .catch (error => {
      console.log (error);
    });
};
