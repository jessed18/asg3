class Camera {
  constructor() {
    this.fov = 60;
    this.eye = new Vector3([0, 1, 5]);
    this.at = new Vector3([0, 1, 4]);
    this.up = new Vector3([0, 1, 0]);
    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();
    this.projectionMatrix.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);
    this.updateView();
  }


  updateView() {
    this.viewMatrix.setLookAt(
      ...this.eye.elements,
      ...this.at.elements,
      ...this.up.elements
    );
  }


  moveForward(speed) {
    let f = new Vector3(this.at.elements).sub(this.eye).normalize().mul(speed);
    this.eye.add(f);
    this.at.add(f);
    this.updateView();
  }


  moveBackward(speed) {
    let b = new Vector3(this.eye.elements).sub(this.at).normalize().mul(speed);
    this.eye.add(b);
    this.at.add(b);
    this.updateView();
  }


  moveLeft(speed) {
    let f = new Vector3(this.at.elements).sub(this.eye).normalize();
    let s = Vector3.cross(this.up, f).normalize().mul(speed);
    this.eye.add(s);
    this.at.add(s);
    this.updateView();
  }


  moveRight(speed) {
    let f = new Vector3(this.at.elements).sub(this.eye).normalize();
    let s = Vector3.cross(f, this.up).normalize().mul(speed);
    this.eye.add(s);
    this.at.add(s);
    this.updateView();
  }


  panLeft(angle) {
    this.rotateAroundUp(angle);
  }


  panRight(angle) {
    this.rotateAroundUp(-angle);
  }


  rotateAroundUp(angle) {
    let f = new Vector3(this.at.elements).sub(this.eye);
    let rotation = new Matrix4();
    rotation.setRotate(angle, ...this.up.elements);
    let f_prime = rotation.multiplyVector3(f);
    this.at = new Vector3(this.eye.elements).add(f_prime);
    this.updateView();
  }


  getGridCoordsInFront() {
    let f = new Vector3(this.at.elements).sub(this.eye).normalize();
    let pos = new Vector3(this.eye.elements).add(f).add(new Vector3([16, 0, 16]));
    return [
      Math.floor(pos.elements[0]),
      Math.floor(pos.elements[2])
    ];
  }
 }




