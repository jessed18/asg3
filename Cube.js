class Cube {
    constructor() {
      this.color = [1, 1, 1, 1];
      this.textureNum = -2;
      this.matrix = new Matrix4();
    }

    render() {
      if (typeof u_whichTexture !== 'undefined') {
        gl.uniform1i(u_whichTexture, this.textureNum);
      }

      gl.uniform4f(u_FragColor, ...this.color);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      drawTriangle3DUV(
        [0, 0, 0, 1, 0, 0, 1, 1, 0],
        [0, 0, 1, 0, 1, 1]
      );
      drawTriangle3DUV(
        [0, 0, 0, 1, 1, 0, 0, 1, 0],
        [0, 0, 1, 1, 0, 1]
      );
    }

    renderfast() {
      this.render();
    }
  }
