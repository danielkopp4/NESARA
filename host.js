var url = require('url');
var fs = require('fs');
var path = require('path');
var formidable = require('formidable');
var childProcess = require("child_process");
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 8080;

http.listen(port, function() {
    console.log('server running on port ' + port);
});


io.on('connection', function(socket){
  var Files = {};

  socket.on('Start', function(data) {
        var Name = data['Name'];
        console.log(data['Size']);
        var splitName = Name.split(".");
        var fileName = random_string() + "." + splitName[splitName.length - 1];
        var filePath = "/tmp/" + fileName;
        console.log("File Name " + fileName);
        Files[Name] = {  //Create a new Entry in The Files Variable
            FileSize : data['Size'],
            Data     : "",
            Downloaded : 0,
            FilePath : filePath
        }
        var Place = 0;
        fs.open("/tmp/" + fileName, "a", 0755, function(err, fd){
            if(err) {
                console.log(err);
            } else {
                Files[Name]['Handler'] = fd; //We store the file handler so we can write to it later
                socket.emit('MoreData', { 'Place' : Place, Percent : 0 });
            }
        });
  });

  socket.on('Upload', function (data){
        var Name = data['Name'];
        Files[Name]['Downloaded'] += data['Data'].length;
        Files[Name]['Data'] += data['Data'];
        if (Files[Name]['Downloaded'] == Files[Name]['FileSize']) {
            var Place = Files[Name]['FileSize'];
            var Percent = 100;
            socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
            fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
                //Get Thumbnail Here
            });

            getDiagnosis(Files[Name]['FilePath'], function (diagnosis) {
              socket.emit('Diagnosis', { 'data': diagnosis, 'length' : diagnosis.length });
              console.log(diagnosis);
            });

        } else if (Files[Name]['Data'].length > 10485760){ //If the Data Buffer reaches 10MB
            fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
                Files[Name]['Data'] = ""; //Reset The Buffer
                var Place = Files[Name]['Downloaded'] / 524288;
                var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
                socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
            });
        } else {
            var Place = Files[Name]['Downloaded'] / 524288;
            var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
            socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
        }
    });

});

app.get('/style.css', function (req, res) {
  fs.readFile(__dirname + '/public/style.css', function(err, data) { //read file index.html in public folder
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
      return res.end("404 Not Found");
    }
    res.writeHead(200, {'Content-Type': 'text/css'}); //write HTML
    res.write(data); //write data from index.html
    return res.end();
  });
});

app.get('/index.js', function (req, res) {
  fs.readFile(__dirname + '/public/index.js', function(err, data) { //read file index.html in public folder
    if (err) {
      console.log(err);
      res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
      return res.end("404 Not Found");
    }
    res.writeHead(200, {'Content-Type': 'text/javscript'}); //write HTML
    res.write(data); //write data from index.html
    return res.end();
  });
});

app.get('', function (req, res) {
    fs.readFile(__dirname + '/public/index.html', function(err, data) { //read file index.html in public folder
      if (err) {
        res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
        return res.end("404 Not Found");
      }
      res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
      res.write(data); //write data from index.html
      return res.end();
    });
});

var script_path = "./test.py"

function getDiagnosis(file_path, callback) {
  return callPython(script_path, file_path, callback);
}

function callPython(script_path, arg, callback) {
  // get model output from path
  // heres how to start python in node js https://stackoverflow.com/questions/23450534/how-to-call-a-python-function-from-node-

  var spawn = childProcess.spawn;
  var process = spawn('python',[script_path,
    arg]);

  process.stderr.on('data', function (data) {
    console.log("ERR: " + data.toString())
  });

  var incoming;
  process.stdout.on('data', function(data) {
    incoming = data.toString();
    // console.log(incoming);
    callback(incoming);
  });

}

function random_string() {
  return 'xxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, function(c) {
    var r = Math.random() * 16 | 0, v = r;
    return v.toString(16);
  });
}


//https://code.tutsplus.com/tutorials/how-to-create-a-resumable-video-uploader-in-nodejs--net-25445
