var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var searchParams = require('search-params');
var formidable = require('formidable');

http.createServer(function (req, res) {
  if (req.url == '/fileupload') {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      res.write('File uploaded');
      var file_path = files.filetoupload.path;
      res.end();
    });
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  }
}

function getDiagnosis(file_path) {
  // get model output from path
  // heres how to start python in node js https://stackoverflow.com/questions/23450534/how-to-call-a-python-function-from-node-js
}
