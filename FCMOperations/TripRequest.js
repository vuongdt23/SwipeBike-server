const firebaseAdmin = require ('firebase-admin');

const NotifyOfRequestCreation = (tokens, requesterName, requesterImgUrl) => {
  if (tokens.length === 0) return;
  firebaseAdmin.messaging ().sendMulticast ({
    tokens,
    notification: {
      body: requesterName + 'muốn ghép đôi với bạn',
      title: 'Lời mời ghép đôi mới',
      imageUrl: requesterImgUrl,
    },
  });
};

const NotifyOfRequestRejection = (
  tokens,
  requestRejectorName,
  requestRejectorImgUrl
) => {
  if (tokens.length === 0) return;
  firebaseAdmin.messaging ().sendMulticast ({
    tokens,
    notification: {
      body: requestRejectorName + 'đã từ chối yêu cầu ghép đôi với bạn',
      title: 'Lời mời ghép đôi bị từ chối',
      imageUrl: requestRejectorImgUrl,
    },
  });
};

const NotifyOfRequestCancel = (
  tokens,
  requestRejectorName,
  requestRejectorImgUrl
) => {
  if (tokens.length === 0) return;
  firebaseAdmin.messaging ().sendMulticast ({
    tokens,
    notification: {
      body: requestRejectorName + 'đã hủy yêu cầu ghép đôi với bạn',
      title: 'Lời mời ghép đôi bị hủy',
      imageUrl: requestRejectorImgUrl,
    },
  });
};

const NotifyofRequestAcceptance = (
  tokens,
  requestAcceptorName,
  requestAcceptorImgUrl
) => {
  if (tokens.length === 0) return;
  firebaseAdmin.messaging ().sendMulticast ({
    tokens,
    notification: {
      body: requestAcceptorName + 'đã chấp nhận yêu cầu ghép đôi với bạn',
      title: 'Yêu cầu ghép đôi được tạo',
      imageUrl: requestAcceptorImgUrl,
    },
  });

};

module.exports = {
  NotifyOfRequestCreation: NotifyOfRequestCreation,
  NotifyOfRequestRejection: NotifyOfRequestRejection,
  NotifyOfRequestCancel: NotifyOfRequestCancel,
  NotifyofRequestAcceptance: NotifyofRequestAcceptance
};
