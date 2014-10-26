var videoView = document.getElementById('videoview');
var connection;
var started = false;
var settings = {'mandatory': {'OfferToReceiveAudio':false, 'OfferToReceiveVideo':true }};
var socketReady = false;

function socketSend(data) {
  socket.json.send(data);
}
// connection
function NewConnection() {
  var cnnectionConfig = {iceServers:[]};
  var peer;

  // create peer
  try {
    peer = new webkitRTCPeerConnection(cnnectionConfig);
  } catch (e) {
    console.log('Failed to create connection, exception: ' + e.message);
  }

  // send ice candidates to remort
  peer.onicecandidate = function (evt) {
    if (evt.candidate) {
      var data = {
        type: 'candidate', 
        sdpMLineIndex: evt.candidate.sdpMLineIndex,
        sdpMid: evt.candidate.sdpMid,
        candidate: evt.candidate.candidate
      };
      socketSend(data);
    }
  };

  //remote stream event listener
  peer.addEventListener('addstream', function(){
    videoView.src = window.webkitURL.createObjectURL(event.stream);
  }, false);
  peer.addEventListener('removestream', function(){
    videoView.src = '';
  }, false);

  return peer;
}

function setOffer(evt) {
  if (connection) {
    console.error('connection already exist');
  }
  connection = new NewConnection();
  connection.setRemoteDescription(new RTCSessionDescription(evt));
}

function sendAnswer(evt) {
  if (! connection) {
    console.error('connection does not exist');
    return;
  }
  connection.createAnswer(function (desc) { // in case of success
    connection.setLocalDescription(desc);
    socketSend(desc);
  }, function () {
    console.log('Something went wrong at sendAnswer');
  }, settings);
}

function onOffer(evt) {
  setOffer(evt);
  sendAnswer(evt);
  started = true;
}

function onCandidate(evt) {
  var candidate = new RTCIceCandidate({
    sdpMLineIndex:evt.sdpMLineIndex,
    sdpMid:evt.sdpMid,
    candidate:evt.candidate
  });
  connection.addIceCandidate(candidate);
}

// job dispatcher
function socketMessage(evt) {
  if (evt.type === 'offer') { onOffer(evt);}
  if (evt.type === 'candidate' && started) { onCandidate(evt); }
}

//socket is prepped in index.html
socket.on('connect', function(){socketReady = true;})
      .on('message', socketMessage);
