const {MapClient, MapKey} = require ('../APIKeys/mapAPIs');
const {
  UnitSystem,
  TravelMode,
} = require ('@googlemaps/google-maps-services-js');

const getDistancesToLocation = (firstLocation, LocationArr) => {
  return MapClient.distancematrix ({
    params: {
      key: MapKey,
      units: UnitSystem.metric,
      origins: LocationArr,
      destinations: firstLocation,
      mode: TravelMode.driving,
    },
  });
};

module.exports = {
  getDistancesToLocation: getDistancesToLocation,
};
