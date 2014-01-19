(function() {

  var $btnRun = $('.top-container .controls .button-run');
  var $inputTextarea = $('.input-textarea');
  var $outputTextarea = $('.output-textarea');
  var LispJS = window.LispJS;
  var localStorage = window.localStorage;
  var keysDown = [];
  var shiftPressed = false;
  var KeyCode = {
    TAB: 9,
    SHIFT: 16,
    ENTER: 13
  };

  var appendOutput = function(output) {
    $outputTextarea.append(output);
    $outputTextarea.scrollTop($outputTextarea[0].scrollHeight);
  };

  var onLispJSOutput = function(output) {
    appendOutput('> ' + output + '\n')
  };

  var runScript = function() {
    var script = $inputTextarea.val();
    localStorage.setItem('lastScript', script);

    LispJS.eval(script);
    appendOutput('\n');
  };

  var loadLastScript = function() {
    var lastScript = localStorage.getItem('lastScript');
    if (lastScript) {
      $inputTextarea.html(lastScript);
    }
  };

  var onInputTexareaKeyup = function(e) {
    if (e.keyCode === KeyCode.SHIFT) {
      shiftPressed = false;
    }
    if (shiftPressed && e.keyCode === KeyCode.ENTER) {
      runScript();
      e.preventDefault();
    }
  };

  var onInputTextareaKeydown = function(e) {
    if (e.keyCode === KeyCode.SHIFT) {
      shiftPressed = true;
    }
    if (e.keyCode === KeyCode.TAB) {
      e.preventDefault();
    }
    if (e.keyCode === KeyCode.ENTER && shiftPressed) {
      e.preventDefault();
    }
  };

  var setEventListeners = function() {
    $btnRun.on('click', runScript);
    $inputTextarea.on('keyup', onInputTexareaKeyup);
    $inputTextarea.on('keydown', onInputTextareaKeydown);
  };

  LispJS.onOutput(onLispJSOutput);

  loadLastScript();
  setEventListeners();
})();