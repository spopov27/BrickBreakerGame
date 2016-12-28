//**globals**

//canvas properties, sounds, and key press variables
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var frameInterval = 10;
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var pause = false;
var playSound = true;

var bounceSound = new Audio("beep.wav");
var music = new Audio("space.ogg");
bounceSound.volume = 0.6;
music.volume = 0.3;

var score = 0;
var lives = 3;
var ballReleased = false;
var victory = false;
var defeat = false;
var gameStop = false;
var stars = true;

//brick properties
var brickRowCount = 5;
var brickColumnCount = 6;
var brickWidth = 75;
var brickHeight = 20;
var brickPadding = 15;
var brickOffsetTop = 40;
var brickOffsetLeft = 35;

//get button elements
var pauseButton = document.getElementById("pause");
var soundButton = document.getElementById("sound");
var animationsButton = document.getElementById("animations");

//***QA testing variables
var debugOn = false;
var debugPaddleGodMode = 0;
var debugSuperBallSpeed = 0;

if(debugOn){
	debugPaddleGodMode = 480;
	debugSuperBallSpeed = 15;
}
//**end debug section


//define game objects
var paddle = 
{
	height: 13,
	width: 125 + debugPaddleGodMode,
	x: (canvas.width - 75)/2
}


/*ball defaults:
dx = 4
dy = -4
x = canvas.width/2
y = canvas.height-30;
*/
var ball = 
{
	x: paddle.x + paddle.width/2,
	y: canvas.height-30,
	dx: 0,
	dy: 0,
	radius: 10
}

//create a 2D array for the bricks
var bricks = [];
for(c=0; c<brickColumnCount; c++) {
    bricks[c] = [];
    for(r=0; r<brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0 , status: 1, color: Math.round(Math.random() * 9 + 1)};
    }
}

//an array of ten pre-selected colors to randomly choose from for bricks
var colors = ["red", "blue", "yellow", "green", "darkred", "red", "pink", "purple", "brown", 
							"lightblue", "cyan", "lightgreen", "darkblue", "lightpurple", "orange"];



//***Main game engine functions***
//draw the animated space stars
function drawStars(){
	for(var i = 0; i < 30; i++){
		var x = Math.round(Math.random()* 600 + 1);
		var y = Math.round(Math.random()* 500 + 1);
		ctx.beginPath();
		ctx.arc(x, y, 3 ,0, Math.PI*2);
		ctx.fillStyle = "white";
		ctx.fill();
		ctx.closePath();
	}
}

//draw the bricks using a random color for each
function drawBricks() {
    for(c=0; c<brickColumnCount; c++) {
        for(r=0; r<brickRowCount; r++) {
        	if(bricks[c][r].status == 1){
            var brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
            var brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX, brickY, brickWidth, brickHeight);
            ctx.fillStyle = colors[bricks[c][r].color];
            ctx.fill();
            ctx.closePath();
          }
        }
    }
}


//draw the paddle rect
function drawPaddle(){
	ctx.beginPath();
	ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height)
	ctx.fillStyle = "red";
	ctx.fill();
	ctx.closePath();
}

//draw the ball
function drawBall(){
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.radius,0, Math.PI*2);
	ctx.fillStyle = "red";
	ctx.fill();
	ctx.closePath();
}

function drawScore() {
    ctx.font = "22px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("Score: " + score, 8, 20);
}

function drawLives() {
    ctx.font = "22px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("Lives: "+lives, canvas.width-85, 20);
}

//reset all relevant variables after game over to reset game
//includes ball position, speed, score, lives, and brick status and color
function handleGameOver(){
	victory = false;
	defeat = false;
	gameStop = false;
	ballReleased = false;
	ball.x = paddle.x + paddle.width/2;
	ball.y = canvas.height-30;
	ball.dy = 0;
	ball.dx = 0;
	score = 0;
	lives = 3;

    for(c=0; c<brickColumnCount; c++) {
        for(r=0; r<brickRowCount; r++) {
        	bricks[c][r].status = 1;
        	bricks[c][r].color = Math.round(Math.random() * 9 + 1);
        }
    }
}
////////////////////////////////////////////////////////
////****Main draw function, called every frame****//////
///////////////////////////////////////////////////////
function draw(){
	if(playSound){
		music.play();
		music.muted = false;
		music.loop=true;
	}else{
		music.muted = true;
	}

	if(gameStop && upPressed){
		handleGameOver();
	}

	//special drawing calls to allow user to see the
	//stars disappear and re-appear in real time
	//when toggling stars while game is paused
	//and to display the pause message
	if(pause){
		ctx.clearRect(0,0,canvas.width, canvas.height);
		if(stars){
			drawStars();
		}
		drawScore();
		drawLives();
		drawBricks();
		drawBall();
		drawPaddle();
		ctx.font = "38px Arial";
		ctx.fillStyle = "lightred";
		ctx.fillText("*GAME PAUSED*", 150, 250);
	}

	if(!pause && !gameStop){
		//drawing code
		ctx.clearRect(0,0,canvas.width, canvas.height);
		if(stars){
		 drawStars();
		}
		if(victory){
      ctx.font = "36px Arial";
			ctx.fillStyle = "red";
			ctx.fillText("VICTORY!", 230, 250);
			ctx.fillText("Press Up Arrow to Play Again", 70, 290);
			if(upPressed){
				handleGameOver();
			}
		}else if(defeat && !victory){
			ctx.font = "36px Arial";
			ctx.fillStyle = "gray";
			ctx.fillText("Game Over - Out of Lives", 90, 250);
			ctx.fillText("Press Up Arrow to Try Again!", 70, 290);
			gameStop = true;
		}
		drawScore();
		drawLives();
		drawBricks();
		if(!ballReleased){
			ball.x = paddle.x + paddle.width/2;
			drawBall();
		}else{
			drawBall();
		}

		collisionDetection();
		drawPaddle();
		ball.x += ball.dx;
		ball.y += ball.dy;

		//handle ball touching top or bottom.
		//if touching bottom end game (reload page) if not touching paddle.
		//if touching paddle, bounce off.
		if(ball.y + ball.dy < ball.radius){
			ball.dy = -ball.dy;
			if (playSound){
				bounceSound.play();
			}
		}else if(ball.y + ball.dy > canvas.height - ball.radius){
			if (ball.x > paddle.x -10 && ball.x < paddle.x + paddle.width+10){
				ball.dy = -ball.dy;
			}else{
					if(!victory){
						lives--;
					}

					if(lives == 0){
						defeat = true;
					}else {
								ballReleased = false;
								ball.x = paddle.x + paddle.width/2;
								ball.y = canvas.height-30;
								ball.dy = 0;
								ball.dx = 0;
						}
			}

		}

		//if ball is touching left or right wall, bounce off
		if(ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius){
			ball.dx = -ball.dx;
			if (playSound){
				bounceSound.play();
			}
		}

		//if the left or right buttons are pressed move the paddle 
		//left or right and prevent it from going off screen.
		if(rightPressed && paddle.x < canvas.width - paddle.width){
			paddle.x +=10;
		}
		else if(leftPressed && paddle.x > 0){
			paddle.x -= 10;
		}

		if(upPressed && !ballReleased){
			if(paddle.x + paddle.width/2 < canvas.width/2){
				ball.dx = 6 + debugSuperBallSpeed;
				ball.dy = -6 - debugSuperBallSpeed;
			}else{
				ball.dx = -6 - debugSuperBallSpeed;
				ball.dy = -6 - debugSuperBallSpeed;
			}

			ballReleased = true;
		}
	}//end pause check
	requestAnimationFrame(draw);
}//end draw func


//event listeners
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
pauseButton.addEventListener("click", pauseHandler, false);
soundButton.addEventListener("click", soundHandler, false);
animationsButton.addEventListener("click", animationHandler, false);

//****Event handlers****

//handle left and eight keyDown event
function keyDownHandler(e){
	if(e.keyCode == 39){
		rightPressed = true;
	}
	else if(e.keyCode == 37){
		leftPressed = true;
	}else if(e.keyCode == 38){
		upPressed=true;
	}
}

//handle the keyUp events
function keyUpHandler(e) {
	if(e.keyCode == 39){
		rightPressed = false;
	}
	else if(e.keyCode == 37){
		leftPressed = false;
	}else if(e.keyCode == 38){
		upPressed = false;
	}
}

//handle the pause/resume game button functionality
function pauseHandler(){
	 if(pause == false){
	 	pause = true;
	 	pauseButton.innerHTML = "Resume Game";
	 }
	 else{ 
	 	pause = false;
	 	pauseButton.innerHTML = "Pause Game";
	 }
}

//if toggle sound button is clicked,
//toggle the sound
function soundHandler(){
	playSound = !playSound;
}

//toggles the star animation
function animationHandler(){
	stars = !stars;
}

//detects collision between bricks and ball
function collisionDetection() {
    for(c=0; c<brickColumnCount; c++) {
        for(r=0; r<brickRowCount; r++) {
            var b = bricks[c][r];
            if(b.status == 1){
	            if(ball.x > b.x && ball.x < b.x+brickWidth && ball.y > b.y && ball.y < b.y+brickHeight) {
	                ball.dy = -ball.dy;
	                b.status =0;
	                if(playSound){bounceSound.play();}
	                score++;
	                  if(score == brickRowCount*brickColumnCount) {
                        victory = true;
                    }
	            }
	          }
        }
    }
}


//setInterval that draws frames per the frame time interval
//setInterval(draw, frameInterval);

draw();
