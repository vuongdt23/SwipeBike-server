const firebaseAdmin = require ('firebase-admin');

const NotifyOfCandidateTripTimedOut = tokens => {
  
  if (tokens.length === 0) {
    return;
  } else {
    console.log("sending to ", tokens)
    return firebaseAdmin.messaging ().sendMulticast ({
      tokens:tokens,
      notification: {
        title: 'Chuyến đi quá hạn',
        body: 'Chuyến đi của bạn đã quá hạn mà không có yêu cầu ghép đôi nào được chấp nhận',
      },
    });
  }
};

const NotifyOfTripRequestTimedOut = tokens => {
  if (tokens.length === 0) return;
  return firebaseAdmin.messaging ().sendMulticast ({
    tokens: tokens,
    notification: {
      title: 'Chuyến đi quá hạn',
      body: 'Chuyến đi của bạn đã quá hạn mà không có yêu cầu ghép đôi nào được chấp nhận',
    },
  });
};

const NotifyOfTripTimedOut = tokens => {
  if (tokens.length === 0) return;
  return firebaseAdmin.messaging ().sendMulticast ({
    tokens: tokens,
    notification: {
      title: 'Chuyến đi được ghép đôi quá hạn',
      body: 'Chuyến đi được ghép đôi của bạn đã quá hạn',
    },
  });
};

module.exports = {
  NotifyOfCandidateTripTimedOut: NotifyOfCandidateTripTimedOut,
  NotifyOfTripRequestTimedOut: NotifyOfTripRequestTimedOut,
  NotifyOfTripTimedOut: NotifyOfTripTimedOut,
};
