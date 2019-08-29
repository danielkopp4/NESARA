window.addEventListener("load", Ready);

function Ready(){
  if (window.File && window.FileReader){ //These are the relevant HTML5 objects that we are going to use
    console.log("ready");
    document.getElementById('UploadButton').addEventListener('click', StartUpload);
    document.getElementById('FileBox').addEventListener('change', FileChosen);
  } else {
    document.getElementById('UploadArea').innerHTML = "Your Browser Doesn't Support The File API Please Update Your Browser";
  }
}


var SelectedFile;
function FileChosen(evnt) {
    SelectedFile = evnt.target.files[0];
}

var socket = io.connect('http://localhost:8080');
var FReader;
var Name;
function StartUpload(){
    console.log("file box " + document.getElementById('FileBox').value)
    if (document.getElementById('FileBox').value != "") {
        FReader = new FileReader();
        Name = SelectedFile.name;
        var Content = "<span id='NameArea'>Uploading " + SelectedFile.name + " as " + Name + "</span>";
        Content += '<div id="ProgressContainer"><div id="myProgress"><div id="myBar"></div></div></div><span id="percent">0%</span>';
        Content += "<span id='Uploaded'> - <span id='MB'>0</span>/" + Math.round(SelectedFile.size / 1048576) + "MB</span>";
        document.getElementById('UploadArea').innerHTML = Content;
        FReader.onload = function(evnt){
            socket.emit('Upload', { 'Name' : Name, Data : evnt.target.result });
            // alert("uploading");
        }
        socket.emit('Start', { 'Name' : Name, 'Size' : SelectedFile.size });
    } else {
        alert("Please Select A File");
    }
}

socket.on('MoreData', function (data) {
    console.log("moredata " + data['Percent']);
    UpdateBar(data['Percent']);
    if (data['Percent'] == 100) {
      var Place = SelectedFile.size;
      // Add loading animation while sending diagnosis
      return;
    } else {
      var Place = data['Place'] * 524288; //The Next Blocks Starting Position
    }

    var NewFile; //The Variable that will hold the new Block of Data
    if(SelectedFile.webkitSlice)
        NewFile = SelectedFile.webkitSlice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
    else
        NewFile = SelectedFile.slice(Place, Place + Math.min(524288, (SelectedFile.size-Place)));
    FReader.readAsBinaryString(NewFile);
});

var downloaded = {'data' : "" };
socket.on('Diagnosis', function (data) {
  if (downloaded['data'] == "") {
    downloaded.length = data['length']
  }

   downloaded['data'] += data['data'];

   if (downloaded['length'] = downloaded['data'].length) {
     finishDiagnosis();
   }
});

function finishDiagnosis () {
  document.getElementById('UploadArea').innerHTML = downloaded['data'];
}

function UpdateBar(percent) {
    move(percent);
    document.getElementById('percent').innerHTML = (Math.round(percent*100)/100) + '%';
    var MBDone = Math.round(((percent/100.0) * SelectedFile.size) / 1048576);
    document.getElementById('MB').innerHTML = MBDone;
}


$(function () {
  $('form').submit(function(e){
    e.preventDefault();
  });
});

function move(progress) {
    var elem = document.getElementById("myBar");
    var width = parseFloat(elem.style.width);
    if (isNaN(width)) {
      width = 0;
    }
    var id = setInterval(frame, 1);
    function frame() {
      if (width >= progress) {
        clearInterval(id);
      } else {
        width++;
        elem.style.width = width + '%';
        elem.innerHTML = width * 1  + '%';
      }
    }
  }
