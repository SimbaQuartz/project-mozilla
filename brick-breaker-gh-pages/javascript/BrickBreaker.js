/* Written by Will Sutherland - ara12wgs */

var context;
var intervalId;
//Width of the canvas
var WIDTH;
//Height of the canvas
var HEIGHT;
//The number of balls in the game
var NUM_BALLS = 1;
//Number of collumns of bricks
var NUM_BRICK_COLLUMN = 5;
//Number of rows of bricks
var NUM_BRICK_ROW = 6;
var NUM_BRICKS = NUM_BRICK_ROW*NUM_BRICK_COLLUMN;
var balls;
var paddlex, paddley, paddleh, paddlew;
var brickx, bricky, brickh, brickw;
//Default state for key presses is "not pressed"
var rightArrowDown = false;
var leftArrowDown = false;
//How much the speed increases when an edge shot is made
var speedIncreaseY1 = 1.05;
var speedIncreaseY2 = 1.1;
var canvasMinX = 0;
var canvasMaxX = 0;

//Clears the canvas in preparation for updated values to be drawn
function clear() {
    context.clearRect(0, 0, WIDTH, HEIGHT);
}

/*
** Keyboard interaction:
*/

// While the right or left hand key is pressed down the corresponding variable is set to true
function onKeyDown(evt) {
    if (evt.keyCode == 39) rightArrowDown = true;
    else if (evt.keyCode == 37) leftArrowDown = true;
}

// When the right or left hand key is released the corresponding variable is set back to false
function onKeyUp(evt) {
    if (evt.keyCode == 39) rightArrowDown = false;
    else if (evt.keyCode == 37) leftArrowDown = false;
}

$(document).keydown(onKeyDown);
$(document).keyup(onKeyUp);

$(function() {
    $("#canvas").on("click", function() {
        init();
    });
});

/*
** Mouse interaction:
*/

function onMouseMove(evt) {
    // If the mouse is within the width boundry of the canvas, the paddle moves along with it
    // Note, it's not just within the boundaries of the canvas, but above and below too
    if (evt.pageX > canvasMinX && evt.pageX < canvasMaxX) {
        paddlex = evt.pageX - canvasMinX - (paddlew/2);
  }
}

$(document).mousemove(onMouseMove);

/*
** Paddle:
*/

// Sets the initial values of the  paddle
function initPaddle() {
    paddlew = 70;
    paddleh = 15;
    // The intial x middle point of the paddle is half way along the width of the canvas
    paddlex = (WIDTH/2)-(paddlew/2);
    // Starting y position of the paddle, with a gap the size of it's height below
    paddley = HEIGHT-(paddleh*2);
    paddlehTop= paddleh*2;
}

// Updates the value of the paddle
function updatePaddle() {
    // When right arrow is pressed the paddle moves if it hasn't reached the edge of the canvas
    if (rightArrowDown) {
        paddlex += 3;
        if (paddlex > WIDTH-paddlew) paddlex = WIDTH-paddlew;
    }
    // When left arrow is pressed the paddle moves if it hasn't reached the edge of the canvas
    else if (leftArrowDown) {
        paddlex -= 3;
        if (paddlex < 0) paddlex = 0;
    }
}

//Draws the paddle based on the set values
function drawPaddle() {
    context.drawImage(imgPaddle, paddlex, paddley);
}

/*
** Bricks:
*/

// Sets the initial values of the bricks
function initBricks() {
    // Initialises the bricks array
    bricks = new BrickList();

    // Same size as image which will be transposed on top
    brickw = 50;
    brickh = 15;

    // For loop goes through all bricks
    for (i=0; i < NUM_BRICK_COLLUMN; ++i) {
        for (j=0; j < NUM_BRICK_ROW; j++) {

            // Sets initial x position of the brick, dependant on which collumn the loop is on
            var sx = 15+(brickw+5)*i;
            // Initial y position of the brick, dependant on the row the loop is on
            var sy = 10 + ((brickh+5)*j);
            var w = brickw;
            var h = brickh;
            var brick = new Brick(sx,sy,w,h,true);
            // Adds the brick to the array
            bricks.add(brick);
    }
  }
}

// Draws the brick to the canvas
function drawBricks() {
    bricks.draw(context, imgBrick);
}

/*
** Balls:
*/

// Sets the initial values of the balls
function initBalls() {
    //Initialises ball array
    balls = new BallList();

    for (i=0; i < NUM_BALLS; ++i) {

        //Radius of the ball is the same size as the image which will be transposed on top of it
        var r = 10;
        //Balls start from a set point in the middle of the canvas
        var sx = (WIDTH/2);
        var sy = 300-50;
        //Initial speed, ball starts moving upwards so that the player is not caught out straight away
        var dx = 0;
        var dy = 1;
        var ball = new Ball(sx,sy,r,dx,dy, true);
        //Adds the ball to the array
        balls.add(ball);
    }
}

//Draw the balls to the canvas
function drawBalls() {
    balls.draw(context, imgBall);
}

function doSomethingMissedBall(b) {
    //Initialises a counter
    var visibleBalls = 0;

    for (var i=0; i<balls.getNumBalls(); ++i) {
        //Increases the counter for every visible ball
        if (balls.get(i).getVisible())
            visibleBalls++;
        }
    //If there are no visible balls it is game over
    if (visibleBalls==0) {
        //Jquery changes the background image to GAME OVER
        $('#canvas').css("background-image", "url(./images/gameOverBackground.png)");
    }
}

/*
** Scoring and winning:
*/

function displayScore() {
    //Initialises a counter
    var visibleBricks = 0;

    for (var i=0; i<bricks.getNumBricks(); ++i) {
        //Increases the counter for every visible brick
        if (bricks.get(i).getVisible()) {
            visibleBricks++;
            //The score is equal to the number of bricks destroyed
            var score = NUM_BRICKS-visibleBricks;
        }
    }
    //If there are no bricks left the game is won
    if (visibleBricks==0) {
        gameWin();
    }

    //Displays the player's score underneath the game
    else {$('#message_area').html(score);}
}

function gameWin() {
    //Tells the player they've won the game and changes the background image
    $('#message_area').html('<p>game won! </p>');
    $('#canvas').css("background-image", "url(./images/gameWonBackground.png)");
}

/*
** Updating:
*/

function updateBallsAndBricks() {
for (var i = 0; i < balls.getNumBalls(); ++i) {

        //Sets this value for ease of reading code
        var b = balls.get(i);

        //For all vivisble balls
        if (b.visible) {
            //This code here changes the direction of travel of the ball if it hits the paddle or wall:
            //It accounts for the width of the ball, and will hit on the edge of the ball instead of in the middle

            //Canvas:
            //If ball hits side of canvas x direction changes
            if (b.getX() + b.getDX() > (WIDTH-b.getR()) || b.getX() + b.getDX() < (0+b.getR()))
            b.setDX(-b.getDX());

            //If ball hits top of the canvas y direction changes
            if (b.getY() + b.getDY() < (0+b.getR()))
            b.setDY(-b.getDY());

            //Paddle:
            //If ball is below the top of the paddle's y position
            else if (b.getY() + b.getDY() > ((HEIGHT-b.getR())-paddlehTop)) {
                var bx = b.getX();

                //If ball is hits the paddle
                if (bx+b.getR() > paddlex && bx-b.getR() < paddlex + paddlew) {
                    //Change y value
                    b.setDY(-b.getDY());

                    //The following lines edit the paddle so that it causes a different rebound depending on where the ball hits it
                    //Bad shots also cause a speed increase

                    //If the ball hits 1/8 or 8/8 section of paddle it has a large speed increase
                    if ((bx+b.getR() > (paddlex) && bx-b.getR() < paddlex + (paddlew/8))||(bx+b.getR() > paddlex+(7*(paddlew/8)) && bx-b.getR() < paddlex + paddlew)){
                        b.setDY(speedIncreaseY2*b.getDY());
                        //If speed is 0 and hits left side of paddle, move ball left
                        if (b.getDX()==0 && bx+b.getR() > (paddlex) && bx-b.getR() < paddlex + (paddlew/8)) {
                            b.setDX(-0.1);
                        }
                        //If speed is 0 and hits right side of paddle move ball right
                        if (b.getDX()==0 && bx+b.getR() > paddlex+(7*(paddlew/8)) && bx-b.getR() < paddlex + paddlew) {
                            b.setDX(0.1);
                        }
                        //if moving left to right
                        if (b.getDX()>0) {
                            b.setDX(b.getDX()+0.1);
                        }
                        //if moving right to left
                        else if (b.getDX()<0) {
                            b.setDX(b.getDX()-0.1);
                        }
                    }
                    //If the ball hits 2/8 or 7/8 section of paddle it has a small speed increase
                    if ((bx+b.getR() > (paddlex + (paddlew/8)) && bx-b.getR() < paddlex + (2*(paddlew/8)))||(bx+b.getR() > paddlex+(6*(paddlew/8)) && bx-b.getR() < paddlex + (7*(paddlew/8)))) {
                        b.setDY(speedIncreaseY1*b.getDY());
                        //If speed is 0 and hits left side of paddle, move ball left
                        if (b.getDX()==0 && bx+b.getR() > (paddlex + (paddlew/8)) && bx-b.getR() < paddlex + (2*(paddlew/8))) {
                            b.setDX(-0.05);
                        }
                        //If speed is 0 and hits right side of paddle, move ball right
                        if (b.getDX()==0 && bx+b.getR() > paddlex+(6*(paddlew/8)) && bx-b.getR() < paddlex + (7*(paddlew/8))) {
                            b.setDX(0.05);
                        }
                        //if moving left to right
                        if (b.getDX()>0) {
                            b.setDX(b.getDX()+0.05);
                        }
                        //if moving right to left
                        else if (b.getDX()<0) {
                            b.setDX(b.getDX()-0.05);
                        }
                    }
                }

                //If the ball misses the paddle it becomes invisible
                else {
                    b.setVisible(false);
                    doSomethingMissedBall(i);
                }
            }

            //Initialise a counter
            var visibleBricks = 0;
            for (var j = 0; j < bricks.getNumBricks(); ++j) {

                //Sets this value for ease of reading code
                var k = bricks.get(j);

                //For all visible bricks
                if (k.getVisible()) {

                    visibleBricks++;
                    var score = NUM_BRICKS-visibleBricks;

                    //If the ball hits a brick
                    if (b.getX() + b.getDX() > (k.getX()-b.getR()) && b.getX() + b.getDX() < ((k.getX()+brickw)+b.getR()) && b.getY() + b.getDY() > (k.getY()-b.getR()) && b.getY() + b.getDY() < ((k.getY()+brickh)+b.getR())) {
                        k.setVisible(false);
                        b.setDY(-b.getDY());
                        displayScore();
                    }
                }
            }

            if (visibleBricks==0) {
                //Makes the balls on screen disappear when the game is won
                b.setVisible(false);
            }
        }
    }

    //Updates the ball's position based on its previous position and speed
    for (var i = 0; i < balls.getNumBalls(); ++i) {
        var ball = balls.get(i);
        ball.setX( ball.getX() + ball.getDX() );
        ball.setY( ball.getY() + ball.getDY() );
    }
}

//Clears the canvas and then draws updated states of the balls, paddle and bricks
function render() {
    clear();
    updatePaddle();
    drawPaddle();
    drawBalls();
    updateBallsAndBricks();
    drawBricks();
}

/*
** Start of game:
*/

var imageCount = 0;
var NUM_IMAGES = 3;
//Declares the variables for attaching images to the objects
var imgBall = new Image();
var imgPaddle = new Image();
var imgBrick = new Image();

//Creates an interaction between the objects and the images associated with them
function loadResources() {
    imgBall.onload = startInteraction;
    imgBall.src = "./images/Ball.png";

    imgPaddle.onload = startInteraction;
    imgPaddle.src = "./images/Paddle.png";

    imgBrick.onload = startInteraction;
    imgBrick.src = "./images/Brick.png";
}

//When all images are loaded begin the animation
function startInteraction() {
    imageCount++;
    if (imageCount == NUM_IMAGES)
        //Begin animation at set speed
        intervalId = setInterval(render, 1);
}

//Initialises everything when the game begins
function init() {
    context = $('#canvas_example')[0].getContext("2d");
    WIDTH = $('#canvas_example').width();
    HEIGHT = $('#canvas_example').height();
    canvasMinX = $('#canvas_example').offset().left;

    console.log(context);
    console.log(WIDTH);
    console.log(HEIGHT);
    console.log(canvasMinX);

    canvasMaxX = canvasMinX + WIDTH;
    $('#canvas').css("background-image", "url(./images/gameBackground.png)");
    initBalls();
    initPaddle();
    initBricks();
    displayScore();
    loadResources();
}