/* Written by Will Sutherland - ara12wgs */

/*
** Functions to create a single ball
*/

// Constructor to create a new ball, with x and y starting positions, radius r, starting speeds dx and dy, colour c and visibilty visible
function Ball(x,y,r,dx,dy,visible) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.dx = dx;
  this.dy = dy;
  this.visible = visible;
}

// Function to draw the  ball to the canvas
Ball.prototype.draw = function(context, image) {
  if (this.visible) {
    context.drawImage(image, this.x-this.r, this.y-this.r);
  }
}

//Mutator functions:

Ball.prototype.setX = function(x) {
  this.x = x;
}

Ball.prototype.setY = function(y) {
  this.y = y;
}

Ball.prototype.setR = function(r) {
  this.r = r;
}

Ball.prototype.setDX = function(dx) {
  this.dx = dx;
}

Ball.prototype.setDY = function(dy) {
  this.dy = dy;
}

Ball.prototype.setVisible = function(v) {
  this.visible = v;
}
  
//Accessor functions:

Ball.prototype.getX = function() {
  return this.x;
}

Ball.prototype.getY = function() {
  return this.y;
}

Ball.prototype.getR = function() {
  return this.r;
}

Ball.prototype.getDX = function() {
  return this.dx;
}

Ball.prototype.getDY = function() {
  return this.dy;
}


Ball.prototype.getVisible = function() {
  return this.visible;
}

/*
** Functions to then create multiple balls
*/

var MAX_NUMBALLS = 10;

function BallList() {
  this.balls = new Array(MAX_NUMBALLS);
  this.numBalls = 0;
}

BallList.prototype.getNumBalls = function() {
  return this.numBalls;
}

BallList.prototype.add = function(b) {
  if (this.numBalls==MAX_NUMBALLS) return;
  this.balls[this.numBalls] = b;
  this.numBalls++;
}

BallList.prototype.get = function(i) {
  if (i >= this.numBalls) return 0;
  return this.balls[i];
}

// Repeats the draw function for a ball to create multiples
BallList.prototype.draw = function(context, image) {
  for (var i=0; i<this.numBalls; i++) {
    this.balls[i].draw(context, image);
  }
}