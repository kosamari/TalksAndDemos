var $ = require('jquery');
var express = require('express');

exports.run = function(callback){
  var app = express();
  var ip = null;
  var port = 5000;
  var ioport = 9001;
  var io = require('socket.io').listen(ioport);

  require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    ip=add;
  });

  /*
  express server
  */
  app.set('view engine', 'html');
  app.engine('html', require('hbs').__express);

  app.get('/', function (req, res) {
    res.render('controller',{ip:ip,port:ioport});
  });
  app.use(express.static(__dirname + '/../public'));
  app.listen(port);

  /*
  socket.io
  */
  io.on('connection', function (socket) {

    socket.on('message', function(message) {
      socket.broadcast.emit('message', message);
    });

    socket.on('msg', function (data) {
      $('#message-data').text(data.message);
    });

    socket.on('video', function (data) {
      $('#graph').hide();
      $('#video').show();
    });

    socket.on('map', function (data) {
      $('#video').hide();
      $('#graph').show();
    });

    // on disconnect
    socket.on('disconnect', function() {
      $('#graph').show();
      socket.broadcast.emit('disconnected');
    });
  });

  callback();
};