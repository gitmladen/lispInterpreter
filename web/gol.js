(function() {

  var N = 17;

  var canvasWidth = 500;
  var rectSize = canvasWidth / N;
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var LispJS = window.LispJS;
  window.canvas = canvas;
  var playing = false;
  var speed = 200;

  var $btnPlay = $('.button-play');
  var $btnPause = $('.button-pause');
  var $btnReset = $('.button-reset');
  var $inputSpeed = $('.input-speed');
  var $btnNext = $('.button-next');

  var drawBoard = function() {
    for (var x = rectSize; x < canvasWidth; x += rectSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasWidth);
    }

    for (var y = rectSize; y < canvasWidth; y += rectSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
    }

    ctx.strokeStyle = "#999";
    ctx.stroke();
  };

  var drawRect = function(x, y) {
    var x = x * rectSize;
    var y = y * rectSize;
    ctx.fillRect(y + 1, x + 1, rectSize - 2, rectSize - 2);
  };

  var clearRect = function(x, y) {
    var x = x * rectSize;
    var y = y * rectSize;
    ctx.clearRect(y + 1, x + 1, rectSize - 2, rectSize - 2);
  };

  var nextStep = function() {
    LispJS.eval('(setq stanje (evolve stanje 0))');
  };

  var play = function() {
    if (!playing) {
      playing = true;
      run();
    }
  };

  var pause = function() {
    playing = false;
  };

  var reset = function() {
    location.reload();
  };

  var run = function() {
    if (playing) {
      nextStep();
      setTimeout(function() {
        run();
      }, speed);
    }
  };

  var inputSpeedChange = function() {
    speed = parseInt($inputSpeed.val(), 10);
  };

  var setListeners = function() {
    $btnPlay.on('click', play);
    $btnPause.on('click', pause);
    $btnReset.on('click', reset);
    $inputSpeed.on('change', inputSpeedChange);
    $btnNext.on('click', nextStep);
  };

  LispJS.onOutput(function(output) {
    if (output) {
      var x = parseInt(output[0], 10);
      var y = parseInt(output[1], 10);
      var state = parseInt(output[2], 10);
      if (state === 1) {
        drawRect(x, y);
      } else {
        clearRect(x, y);
      }
    }
  });

  drawBoard();
  setListeners();

  LispJS.eval('(load-net (quote demo.lisp))');
})();