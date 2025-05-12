WebGLUtils = function() {
    var setupWebGL = function(canvas, opt_attribs) {
      var context = create3DContext(canvas, opt_attribs);
      return context;
    };

    var create3DContext = function(canvas, opt_attribs) {
      var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
      var context = null;
      for (var i = 0; i < names.length; ++i) {
        try {
          context = canvas.getContext(names[i], opt_attribs);
        } catch (e) {}
        if (context) break;
      }
      return context;
    };

    return {
      create3DContext: create3DContext,
      setupWebGL: setupWebGL
    };
  }();

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      return setTimeout(callback, 1000 / 60);
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
