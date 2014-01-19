(function() {

  var N = 7;
  var canvasWidth = 300;
  var rectSize = canvasWidth / N;
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var LispJS = window.LispJS;
  window.canvas = canvas;

  var drawBoard = function() {
    for (var x = rectSize; x < canvasWidth; x += rectSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 300);
    }

    for (var y = rectSize; y < canvasWidth; y += rectSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(300, y);
    }

    ctx.strokeStyle = "#999";
    ctx.stroke();
  };

  var drawRect = function(x, y) {
    var x = x * rectSize;
    var y = y * rectSize;
    ctx.fillRect(x + 1, y + 1, rectSize - 2, rectSize - 2);
  };

  var clearRect = function(x, y) {
    var x = x * rectSize;
    var y = y * rectSize;
    ctx.clearRect(x + 1, y + 1, rectSize - 2, rectSize - 2);
  };

  drawBoard();

  LispJS.onOutput = function(output) {
    var kurec = output.split(',');
    if (kurec instanceof Array && kurec.length === 3) {
      var x = parseInt(kurec[0], 10);
      var y = parseInt(kurec[1], 10);
      var state = parseInt(kurec[2], 10);
      if (state === 1) {
        drawRect(x, y);
      } else {
        clearRect(x, y);
      }
    }
  };

  LispJS.eval('(load-net (quote demo.lisp))');


})();