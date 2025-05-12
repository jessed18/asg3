WebGLDebugUtils = {
    makeDebugContext: function(gl) {
      const glErrorShadow = {};

      function getEnumName(value) {
        for (const key in gl) {
          if (gl[key] === value) return key;
        }
        return "UNKNOWN_ENUM_" + value;
      }

      function makeErrorWrapper(ctx, functionName) {
        return function(...args) {
          const result = ctx[functionName](...args);
          const err = ctx.getError();
          if (err !== ctx.NO_ERROR) {
            glErrorShadow[err] = true;
            console.warn(
              `WebGL error ${getEnumName(err)} in ${functionName}(${args.join(", ")})`
            );
          }
          return result;
        };
      }

      const wrapper = {};
      for (const key in gl) {
        if (typeof gl[key] === "function") {
          wrapper[key] = makeErrorWrapper(gl, key);
        } else {
          wrapper[key] = gl[key];
        }
      }

      wrapper.getError = function() {
        for (const err in glErrorShadow) {
          if (glErrorShadow[err]) {
            glErrorShadow[err] = false;
            return parseInt(err);
          }
        }
        return gl.NO_ERROR;
      };

      return wrapper;
    }
  };
