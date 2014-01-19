(function() {

  var $btnRun = $('.top-container .controls .button-run');
  var $inputTextarea = $('.input-textarea');
  var $outputTextarea = $('.output-textarea');
  var LispJS = window.LispJS;
  var localStorage = window.localStorage;

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

  var setEventListeners = function() {
    $btnRun.on('click', runScript);
  };

  LispJS.onOutput(onLispJSOutput);

  loadLastScript();
  setEventListeners();
})();