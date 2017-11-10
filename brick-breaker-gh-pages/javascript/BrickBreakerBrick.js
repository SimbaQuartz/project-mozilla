/* Written by Will Sutherland - ara12wgs */

/*
** Functions to create a single brick
*/

// Constructor to create a new brick, with x and y starting positions, width w, height h, colour c and visibilty visible
function Brick(x,y,w,h,visible) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.visible = visible;
}

// Function to draw the brick to the canvas
Brick.prototype.draw = function(context, image) {
  if (this.visible) {
    context.drawImage(image, this.x, this.y);
  }
}

//Mutator functions:

Brick.prototype.setX = function(x) {
  this.x = x;
}

Brick.prototype.setY = function(y) {
  this.y = y;
}

Brick.prototype.setW = function(w) {
  this.dx = dx;
}

Brick.prototype.setH = function(h) {
  this.dy = dy;
}

Brick.prototype.setVisible = function(v) {
  this.visible = v;
}

//Accessor functions:
 
Brick.prototype.getX = function() {
  return this.x;
}

Brick.prototype.getY = function() {
  return this.y;
}

Brick.prototype.getW = function() {
  return this.dx;
}

Brick.prototype.getH = function() {
  return this.dy;
}

Brick.prototype.getVisible = function() {
  return this.visible;
}

/*
** Functions to create multiple bricks 
*/

var MAX_NUMBRICKS = 50;

function BrickList() {
  this.Bricks = new Array(MAX_NUMBRICKS);
  this.numBricks = 0;
}

BrickList.prototype.getNumBricks = function() {
  return this.numBricks;
}

BrickList.prototype.add = function(b) {
  if (this.numBricks==MAX_NUMBRICKS) return;
  this.Bricks[this.numBricks] = b;
  this.numBricks++;
}

BrickList.prototype.get = function(i) {
  if (i >= this.numBricks) return 0;
  return this.Bricks[i];
}

// Repeats the draw function for a brick to create multiples
BrickList.prototype.draw = function(context, image) {
  for (var i=0; i<this.numBricks; i++) {
    this.Bricks[i].draw(context, image);
  }
}