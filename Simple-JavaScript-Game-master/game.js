// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = screen.width / 2;
canvas.height = screen.height / 4;
document.body.appendChild(canvas);

// Play music
var audio = new Audio('sounds/music.mp3');
audio.volume = 0.2;
var musicPlaying = false;
audio.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);

var hit = new Audio('sounds/hit.wav');
hit.volume = 0.5;

var jump = new Audio('sounds/jump.wav');
jump.volume = 0.5;

// Cross-browser support for requestAnimationFrame
requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame;

// Only start the game if all images have been loaded
var loadCount = 0;
var prepareImages = function(){
	loadCount++;
	if(loadCount == 5){
		start();
	}
}

// Create image variables
var backgroundImage = new Image();
var playerImage = new Image();
var obstacleImage = new Image();
var grassImage = new Image();
var dirtImage = new Image();

// Set image sources
backgroundImage.src = "images/background.jpg";
playerImage.src = "images/player.png";
obstacleImage.src = "images/obstacle.png";
grassImage.src = "images/grass.png";
dirtImage.src = "images/dirt.png";

// On image load
backgroundImage.onload = function () {
	prepareImages();
};
playerImage.onload = function () {
	prepareImages();
};
obstacleImage.onload = function () {
	prepareImages();
};
grassImage.onload = function () {
	prepareImages();
};
dirtImage.onload = function () {
	prepareImages();
};

// Create classes for objects that may be created multiple times
var obstacle = function(){};
var background = function(){};
var floor = function(){ this.isDirt = true; }

// Create a player object, and set it's x-coordinate
var player = {};
player.x = canvas.width / 2 - canvas.width / 5;

// Create arrays to hold objects of the same type
var obstacles = [];
var floorTiles = [];
var backgroundTiles = [];

// "Public" variables
var speed = 3;
var backgroundSpeed = speed / 2;
var	scoreSpeed = 1;
var	acceleration = 0.01;
var gravity = 0.005;
var jumpHeight = 1;
var	floorHeight = 5;
var maxObstacleHeight = 5;
var	minSpawnTime = 500;

// "Private" variables
var startY;
var startJump;
var floorWidth;
var backgroundWidth;
var lastSpawn = Date.now();
var startSpeed = speed;
var score = 0;
var highScore = 0;
var timeScale = 1;
var	canSpawn = true;
var muted = false;
var muteButton = false;

// Font variables
var fontColor = "rgb(0, 0, 0)";
var fontMargin = 32;
var largeFont = "24px Helvetica";
var smallFont = "12px Helvetica";

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Start the game
var start = function(){
	reset();
	main();
}

// Main game loop
var main = function () {

	// Update the game
	update();

	// Render the game
	render();

	// Request to repeat as fast as possible
	requestAnimationFrame(main);
};

// Reset the game
var reset = function () {

	// Reset variables
	speed = 0;
	score = 0;
	timeScale = 0;
	floorWidth = 0;
	obstacles = [];
	floorTiles = [];
	backgroundTiles = [];
	startY = canvas.height - (dirtImage.height * (floorHeight + 1))

	// Create the floor
	createFloor();

	// Create the background
	createBackground();
};

// Update the game
var update = function () {

	// Increase the score and speed
	score += scoreSpeed * timeScale;
	speed += acceleration * timeScale;

	// Change the high score if needed
	if(score > highScore){
		highScore = score;
	}

	// Deal with key presses
	checkKeys();

	// Check collisions
	checkCollisions();

	// Create obstacles
	createObstacles();

	// Delete obstacles if they go out of bounds
	for(var i = 0; i < obstacles.length; i++){
		if(obstacles[i].x - obstacleImage.width / 2 <= 0)
			obstacles.splice(i, 1);
	}
};

// Render the game
var render = function () {

	// Clear the screen
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw the background
	for(var i = 0; i < backgroundTiles.length; i++){
		backgroundTiles[i].x -= backgroundSpeed;
		ctx.drawImage(backgroundImage, backgroundTiles[i].x, backgroundTiles[i].y);

		// Reset tile position if it goes out of bounds
		if(backgroundTiles[i].x + backgroundImage.width < 0){
			backgroundTiles[i].x += backgroundWidth * backgroundImage.width;
		}
	}

	// Draw the floor
	for(var i = 0; i < floorTiles.length; i++){

		// Constantly move floor tile to the left
		floorTiles[i].x -= speed;

		// Draw dirt tile
		if(floorTiles[i].isDirt)
			ctx.drawImage(dirtImage, floorTiles[i].x, floorTiles[i].y);

		// Draw grass tile
		else
			ctx.drawImage(grassImage, floorTiles[i].x, floorTiles[i].y);

		// Reset tile position if it goes out of bounds
		if(floorTiles[i].x + dirtImage.width < 0){
			floorTiles[i].x += floorWidth * dirtImage.width;
		}
	}

	// Draw obstacles
	for(var i = 0; i < obstacles.length; i++){

		// Constantly move obstacle to the left
		obstacles[i].x -= speed;

		// Draw obstacle
		ctx.drawImage(obstacleImage, obstacles[i].x, obstacles[i].y);
	}

	// Draw the player
	ctx.drawImage(playerImage, player.x, player.y);

	drawText();
};

var drawText = function(){

	// Draw score text
	ctx.fillStyle = fontColor;
	ctx.font = largeFont;
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Score: " + score, fontMargin, fontMargin);

	// Draw high score text
	ctx.textAlign = "right";
	ctx.fillText("High Score: " + highScore, canvas.width - fontMargin, fontMargin);

	// Draw starting text
	if(timeScale == 0){
		ctx.textAlign = "center";
		ctx.textBaseline = "bottom";
		ctx.fillText("Press Space To Start", canvas.width / 2, canvas.height / 2);
	}

	// Draw mute text
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.font = smallFont;
	ctx.fillText("Press 'm' to mute", fontMargin, canvas.height - fontMargin);
}

var checkCollisions = function(){
	// Check for collisions with any obstacle
	for(var i = 0; i < obstacles.length; i++){

		// Reset the game if a collision was detected
		if(player.x <= (obstacles[i].x + obstacleImage.width) && player.x >= (obstacles[i].x - obstacleImage.width)
			&& player.y <= (obstacles[i].y + obstacleImage.height) && player.y >= (obstacles[i].y - obstacleImage.height)){
			
			// Play hit sound effect
			if(!muted)
				hit.play();

			reset();
		}
	}
}

var checkKeys = function(){

	// Mute/Unmute if "m" is pressed
	if(77 in keysDown && muteButton == false){
		muteButton = true;
		if(musicPlaying){
			audio.pause();
			musicPlaying = false;
			muted = true;
		}
		else{
			audio.play();
			musicPlaying = true;
			muted = false;
		}
	}
	if(!(77 in keysDown)){
		muteButton = false;
	}

	// If the space bar is pressed while the player is on the ground
	if (32 in keysDown && player.y == startY) {

		// Start the game if it was stopped
		if(timeScale == 0){
			timeScale = 1;
			speed = startSpeed;
			if(musicPlaying == false && !muted){
				audio.play();
				musicPlaying = true;
			}
		}

		// Make the player jump
		else{

			// Play jump sound effect
			if(!muted)
				jump.play();

			// Set the time that the jump started
			startJump = Date.now();

			// Move the player off of the ground
			player.y--;
		}
	}

	// Implement jumping physics while the player is in the air
	if(player.y < startY)
		player.y = (0.5 * gravity * Math.pow(Date.now() - startJump, 2)) - jumpHeight * (Date.now() - startJump) + (startY - jumpHeight * 30);
	
	// If the player is not in the air, set it on the ground
	else
		player.y = startY;
}

var createObstacles = function(){

	// Create random obstacles
	var newObstacle;
	if(Date.now() - lastSpawn > minSpawnTime && Math.random() > 0.98 && timeScale > 0){

		// Save the time that the obstacle was created
		lastSpawn = Date.now();

		// Create a new obstacle
		newObstacle = new obstacle();
		newObstacle.x = canvas.width;
		newObstacle.y = startY;
		obstacles.push(newObstacle);

		// Randomly create obstacles on top of the initial obstacle
		for(var i = maxObstacleHeight - 1; i > 0; i--){
			if(Math.random() > 0.7){

				// Save position of previous obstacle
				var lastX = newObstacle.x;
				var lastY = newObstacle.y;

				// Create a new obstacle on top of the previous obstacle
				newObstacle = new obstacle();
				newObstacle.x = lastX;
				newObstacle.y = lastY - obstacleImage.height;
				obstacles.push(newObstacle);
			}
		}

		// Randomly create a new stack of obstacles next to the previous stack
		if(Math.random() > 0.5){

			// Create a new obstacle
			newObstacle = new obstacle();
			newObstacle.x = canvas.width + obstacleImage.width;
			newObstacle.y = startY;
			obstacles.push(newObstacle);

			// Randomly create obstacles on top of the initial obstacle
			for(var i = maxObstacleHeight - 1; i > 0; i--){
				if(Math.random() > 0.7){

					// Save position of previous obstacle
					var lastX = newObstacle.x;
					var lastY = newObstacle.y;

					// Create a new obstacle on top of the previous obstacle
					newObstacle = new obstacle();
					newObstacle.x = lastX;
					newObstacle.y = lastY - obstacleImage.height;
					obstacles.push(newObstacle);
				}
			}
		}
	}
}

var createFloor = function(){
	// Set floor width and height
	var width = canvas.width + dirtImage.width;
	var height = floorHeight;

	while(height > 0){
		while(width >= -dirtImage.width){

			// Create grass tiles
			if(height == floorHeight){

				// Create new grass object
				var newGrass = new floor();

				// Set grass variables
				newGrass.x = width;
				newGrass.y = canvas.height - height * grassImage.height;
				newGrass.isDirt = false;

				// Push the grass tile to the floor tiles array
				floorTiles.push(newGrass);

				// Get ready to place the next tile to the left
				width -= grassImage.width;

				// floorWidth will tell how many tiles are in one row of the floor
				floorWidth++;
			}

			// Create dirt tiles
			else{

				// Create new dirt object
				var newDirt = new floor();

				// Set dirt variables
				newDirt.x = width;
				newDirt.y = canvas.height - height * dirtImage.height;

				// Push the dirt tile to the floor tiles array
				floorTiles.push(newDirt);

				// Get ready to place the next tile to the left
				width -= dirtImage.width;
			}
		}

		// Reset the horizontal tile position
		width = canvas.width + dirtImage.width;

		// Move on to the next row
		height--;
	}
}


var createBackground = function(){
	backgroundWidth = 0;

	// Set floor width and height
	var width = canvas.width + backgroundImage.width;

	while(width >= -backgroundImage.width){

			var newBackground = new background();

			// Set dirt variables
			newBackground.x = width;
			newBackground.y = 0;

			// Push the dirt tile to the floor tiles array
			backgroundTiles.push(newBackground);

			// Get ready to place the next tile to the left
			width -= backgroundImage.width;

			// Keep track of number of background tiles used
			backgroundWidth++;
	}
}