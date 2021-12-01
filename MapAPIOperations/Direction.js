const {MapClient, MapKey} = require ('../APIKeys/mapAPIs');

const CreateTripFromTwoCandidates = (bikeTrip, passengerTrip) => {
  return MapClient.directions ({
    params: {
      key: MapKey,
      origin: {
        lat: bikeTrip.CandidateTripFromLat,
        lng: bikeTrip.CandidateTripFromLong,
      },
      destination: {
        lat: bikeTrip.CandidateTripToLat,
        lng: bikeTrip.CandidateTripToLong,
      },
      waypoints: [
        {
          lat: passengerTrip.CandidateTripFromLat,
          lng: passengerTrip.CandidateTripFromLong,
        },
        {
          lat: passengerTrip.CandidateTripFromLat,
          lng: passengerTrip.CandidateTripFromLong,
        },
      ],
      optimize: true,
    },
  });
};

module.exports = {
  CreateTripFromTwoCandidates: CreateTripFromTwoCandidates,
};
