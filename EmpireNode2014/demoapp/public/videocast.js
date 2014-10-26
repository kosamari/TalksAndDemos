var videopreview = document.getElementById('videopreview');
var videoStream;
var videoFlag = 0;
var connection;
var started = false;
var settings = {'mandatory': {'OfferToReceiveAudio':false, 'OfferToReceiveVideo':true }};
var socket_ready = false;

function onAnswer(evt) {
  if (! connection) {console.error('There is no connection'); return;}
  connection.setRemoteDescription(new RTCSessionDescription(evt));
}

function onCandidate(evt) {
  var candidate = new RTCIceCandidate({
    sdpMLineIndex:evt.sdpMLineIndex,
    sdpMid:evt.sdpMid,
    candidate:evt.candidate
  });
  connection.addIceCandidate(candidate);
}

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

  peer.addStream(videoStream);

  return peer;
}

function sendOffer() {
  connection = new NewConnection();
  connection.createOffer(function (desc) {
    connection.setLocalDescription(desc);
    socketSend(desc);
    started = true;
  }, function () { 
    console.log('Something went wrong at sendOffer');
  }, settings);
}

// job dispatcher
function socket_message(evt) {
  if (evt.type === 'answer' && started) { onAnswer(evt);}
  if (evt.type === 'candidate' && started) { onCandidate(evt); }
}

//socket is prepped in index.html
socket.on('connect', function(){socket_ready = true;})
      .on('message', socket_message);


/*
* button control
*/
function connect() {
  if(started){
    disconnect(); 
    return;
  }
  if (!started && videoStream && socket_ready) {
    socket.emit('video');
    sendOffer();
    $('#connectbtn').hide();
    $('#videobtn').text('Video Stop').show();
  } else {
    alert('sorry your video streaming is not ready yet');
  }
}

function disconnect(){
  socket.emit('map');
  connection = null;
  started = false;
  $('#videobtn').text('Video Start');
}

//video 
function video() {
  if(videoFlag ===1){
    videoFlag = 0;
    videopreview.src = '';
    videoStream.stop();
    disconnect();
    document.getElementById('videobtn').innerHTML = 'Video Start';
    return;
  }
  videoFlag = 1;
  navigator.webkitGetUserMedia({video: true, audio: false},
    function (stream) {
      videoStream = stream;
      videopreview.volume = 0;
      videopreview.src = window.webkitURL.createObjectURL(stream);
      videopreview.play();
      $('#videobtn').hide();
      $('#connectbtn').show();
    },
    function (error) {
      console.error('error! (' + error.code+')');
      return;
    }
  );
}

