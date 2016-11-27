// http://paulirish.com/2011/requestanimationframe-for-smart-animating
window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 30); //1000/fps
};

var canvas, ctx;
var asteroids = [];
var player;
var points;
var gameState = "Menu";
var scores = [];

var pointBonuses = [];
var pointBonusSpawnFreq = Math.random() * (2 - 1) + 1;
var pointBonusTimer = 0;
var startingAsteroids = 5;
var maxAsteroids = 25;

var collisionTestFreq = 3; //check collisions every x frames to improve frame rate....



function update() 
{	
	MouseDown ();
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear screen
	
		
	//Display points:
	if (gameState != "Menu")
	{
		ctx.textAlign = 'start';
		ctx.font="50px Georgia";
		ctx.fillStyle= "#FFFFFF";
		ctx.fillText("Score: " +Math.round(points), 5, 45);
		
		if (gameState != "Dead" && gameState != "Paused")
		{
			ctx.fillText("||", canvas.width-50, canvas.height-25);
			points += 0.01;
			pointBonusTimer += 0.01;
		}
		else
		{
			if (gameState == "Dead")
			{
				ctx.font="75px Georgia";
				ctx.fillStyle= "#FFFFFF";
				ctx.textAlign = 'center';
				ctx.fillText("Game Over!", canvas.width/2, 80);
				ctx.font="40px Georgia";
				
				ctx.fillText("Click/tap to go to the main menu", canvas.width/2, canvas.height/2);
			}
			else
			{
				ctx.font="75px Georgia";
				ctx.fillStyle= "#FFFFFF";
				ctx.textAlign = 'center';
				ctx.fillText("Paused!", canvas.width/2, 80);
				ctx.font="40px Georgia";
				ctx.fillText("Click/tap to resume game", canvas.width/2, canvas.height/2);
			}
		}
		
		
		if (gameState != "Paused")
		{
			//Point bonuses
			for (var i = 0; i < pointBonuses.length; i ++)
			{
				pointBonuses[i].draw();
				pointBonuses[i].lifeTime -= 0.01;
				if (pointBonuses[i].lifeTime <= 0)
				{
					pointBonuses.splice (i, 1);
					i--;
				}
			}
			//spawn point bonuses every so often
			if (pointBonusTimer >= pointBonusSpawnFreq)
			{
				var pointbonus = new PointBonus(Math.random() * ((canvas.width-50) - 50) + 50,Math.random() * ((canvas.height-50) - 50) + 50);
				pointBonuses.push(pointbonus);
				pointBonusTimer = 0;
				pointBonusSpawnFreq = Math.random() * (2- 1) + 1;
			}	
		}

		//move the player..
		player.draw();
		if (gameState != "Dead" && gameState != "Paused")
		{
			player.move();
		}
		//create some asteroids if there arent enough in the scene
		if (asteroids.length < startingAsteroids + points/5 && asteroids.length < maxAsteroids)
		{
			createAsteroid(false);
		}
		//move the asteroids...
		for (var i = 0; i < asteroids.length; i ++)
		{
			asteroids[i].draw();

			if (gameState != "Dead" && gameState != "Paused")
			{
				asteroids[i].move();
				
				var margin = 25;
				if (asteroids[i].position.y > canvas.height+margin || asteroids[i].position.y < -margin 
				|| asteroids[i].position.x > canvas.width+margin || asteroids[i].position.x < -margin)
				{
					asteroids.splice(i,1);
					i--;
				}
			}
		}
	}
	else
	{
		ctx.font="75px Georgia";
		ctx.fillStyle= "#FFFFFF";
		ctx.textAlign = 'center';
		ctx.fillText("Asteroid Field", canvas.width/2, 80);
		
		ctx.font="40px Georgia";
		ctx.fillText("Click/tap to start game", canvas.width/2, canvas.height/3);
		ctx.fillText("High scores:", canvas.width/1.5, canvas.height/2);
		ctx.fillText("How to play:", canvas.width/4, canvas.height/2);
		
		ctx.font="25px Georgia";
		
		//scores here...
		for (var i = 0; i < 5; i++)
		{
			ctx.fillText((i+1)+") " +Math.round(scores[i]), canvas.width/1.5, canvas.height/2+((canvas.height/11)*(i+1)));	
		}
		
		ctx.fillText("-Click/tap to move", canvas.width/4, canvas.height/2+((canvas.height/11)));
		ctx.fillText("-Don't get hit by the asteroids", canvas.width/4, canvas.height/2+((canvas.height/11)*2));
		ctx.fillText("-Earn more points by", canvas.width/4, canvas.height/2+((canvas.height/11)*3));
		ctx.fillText(" collecting gold stars", canvas.width/4, canvas.height/2+((canvas.height/11)*4));
	}
	
	requestAnimFrame(update);
}

function start() 
{	
	for (var i = 0; i < 5; i ++)
	{
		scores[i] = localStorage.getItem("scores"+i);
	}
	setScene();
	update();
}

function setScene()
{
	points = 0;
	pointBonuses = [];
	
	asteroids = [];
	for (var i = 0; i < startingAsteroids; i++)
	{
		createAsteroid(true);
	}
	player = new Player(canvas.width/2, canvas.height/2);
}

function setScores()
{
	for (var i = 0; i < 5; i ++)
	{
		if (points >= scores[i])
		{
			scores.splice(i,0, points); //splice lets you insert at an index and move the others down. See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
			localStorage.setItem("scores"+i, points);
			i = 5; //found a score we can replace, set the score...
		}
	}
}

window.onload = function () 
{
    canvas  = document.getElementById("canvas1");
    ctx     = canvas.getContext('2d');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

    start();
};

window.addEventListener("resize", function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

var mousedown = false;
var clickPos;
window.addEventListener("mousedown", function(e) {
	e.preventDefault();
	mousedown = true;
	MouseDown();
	clickPos = new Vector2D(e.pageX, e.pageY);
	if (gameState == "Playing" && e.pageX > canvas.width-75 && e.pageY > canvas.height-75)
	{
		gameState = "Paused";
		mousedown = false;
	}
}, false);
window.addEventListener("mouseup", function(e) {
	e.preventDefault();
	mousedown = false;
}, false);

window.addEventListener("mousemove", function(e) {
	e.preventDefault();
	clickPos = new Vector2D(e.pageX, e.pageY);
}, false);


window.addEventListener("touchstart", function(e) {
	//prevent default behaviour so the screen doesn't scroll or zoom...
	e.preventDefault();
	mousedown = true;
	MouseDown();
	clickPos = new Vector2D(e.touches[0].pageX, e.touches[0].pageY);
	if (gameState == "Playing" && e.touches[0].pageX > canvas.width-75 && e.touches[0].pageY > canvas.height-75)
	{
		gameState = "Paused";
		mousedown = false;
	}
}, false);
window.addEventListener("touchend", function(e) {
	e.preventDefault();
	mousedown = false;
}, false);
window.addEventListener("touchmove", function(e) {
	e.preventDefault();	
	clickPos = new Vector2D(e.touches[0].pageX, e.touches[0].pageY);
}, false);

function MouseDown()
{
	if (mousedown)
	{
		switch (gameState)
		{	
		case "Playing":
			var clickDist = player.position.distance(clickPos);
			if (clickDist > player.size)
			{
				//add acceleration to the player in the direction vector between thispos and playerpos
				//Get direction 
				var clickDir = new Vector2D(clickPos.x - player.position.x,clickPos.y-player.position.y);
				//normalize direction
				var normalizedClickDir = clickDir.normalize();
				//player acceleration = direction.
				player.acceleration.x += normalizedClickDir.x*2;
				player.acceleration.y += normalizedClickDir.y*2;
			}
			break;
		case "Menu":
			gameState = "Playing";
			mousedown = false;
			break;
		case "Paused":
			gameState = "Playing";
			break;
		case "Dead":
			gameState = "Menu";
			mousedown = false;
			setScene();
			break;
		}
	}
}

function Vector2D(x, y)
{
  this.x = x;
  this.y = y;
  
  this.magnitude = function() {
    return Math.sqrt( this.x * this.x + this.y * this.y);
  }
  
  this.normalize = function() {
    var other = this;
	if (this.magnitude()> 0)
	{
      other.divide(this.magnitude());
	}
	return other;
  }
  
  this.divide = function(n) {
    this.x /= n;
    this.y /= n;
    return this;
  }
  this.distance = function(that) {
	var dist = Math.sqrt(((that.x-this.x)*(that.x-this.x))+((that.y-this.y)*(that.y-this.y)));
    return dist;
  }
}

function Player(x, y)
{
	this.position = new Vector2D(x, y);
	this.velocity = new Vector2D(0.1,0.1);
	this.size = 20;
	this.acceleration = new Vector2D(0,0);
	
	this.collisionTestTimer = collisionTestFreq;
	
	this.draw = function() 
	{	 

	  
	  //Use the velocity vector to see what direction the asteroid is facing
	  var normalizedVel = this.velocity.normalize();
	  var p1 = new Vector2D(this.position.x+(normalizedVel.x*this.size*1.5), this.position.y+(normalizedVel.y*this.size*1.5)); //the tip of the arrow
	  var p2 = new Vector2D(this.position.x+(normalizedVel.x*this.size/3), this.position.y+(normalizedVel.y*this.size/3)); //the font center
	  var p8 = new Vector2D(this.position.x-(normalizedVel.x*this.size/3), this.position.y-(normalizedVel.y*this.size/3)); //the end center
      var p7 = new Vector2D(this.position.x-(normalizedVel.x*this.size/2), this.position.y-(normalizedVel.y*this.size/2)); //the tback
	  
	  var p1top2 = new Vector2D(p2.x - p1.x,p2.y-p1.y); //vector from p1 to p2
	  var perpVec = new Vector2D(-p1top2.y, p1top2.x); //get the perpendicular vector of that one
	  var perpNormal = perpVec.normalize(); //normalized
	  var p3 = new Vector2D(p2.x+(perpNormal.x*this.size/2), p2.y+(perpNormal.y*this.size/2)); //front corner 1
	  var p4 = new Vector2D(p2.x-(perpNormal.x*this.size/2), p2.y-(perpNormal.y*this.size/2)); //front corner 2
	  
	  var p5 = new Vector2D(p8.x+(perpNormal.x*this.size/2), p8.y+(perpNormal.y*this.size/2)); //back corner 1
	  var p6 = new Vector2D(p8.x-(perpNormal.x*this.size/2), p8.y-(perpNormal.y*this.size/2)); //back corner 2
	  
	  ctx.beginPath();  
	  ctx.moveTo(p1.x, p1.y);
	  ctx.lineTo(p3.x, p3.y);
	  ctx.lineTo(p5.x, p5.y);
	  ctx.lineTo(p7.x, p7.y);
	  ctx.lineTo(p6.x, p6.y);
	  ctx.lineTo(p4.x, p4.y);
	  ctx.lineTo(p1.x, p1.y);
	  ctx.fillStyle="#FFFFFF";
	  ctx.fill();
	  ctx.lineWidth = 2;
	  ctx.strokeStyle="#aaaaaa";
	  ctx.stroke();
	  
	  //draw the collision area for the player
	  //drawCircle(this.position.x, this.position.y, this.size/2, "#00ff00");
	  
	}
	this.move = function() 
	{
		var acclerationDecreaseSpeed = 0.75; //Acceleration will decrease by 25% every frame.
		var maxSpeed = 50;
		
		this.acceleration = new Vector2D(this.acceleration.x * acclerationDecreaseSpeed, this.acceleration.y * acclerationDecreaseSpeed);
	
		this.velocity.x += this.acceleration.x;
		this.velocity.y += this.acceleration.y;
		
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
					
		if (this.velocity.magnitude() > maxSpeed)
		{
			this.velocity = this.velocity.normalize();
			this.velocity.x *= maxSpeed;
			this.velocity.y *= maxSpeed;
		}
		
		if (this.position.y > canvas.height || this.position.y < 0)
		{
			this.velocity.y = -this.velocity.y;
		}			
		if (this.position.x > canvas.width || this.position.x < 0)
		{
			this.velocity.x = -this.velocity.x;
		}
		
		this.collisionTestTimer ++;
		if (this.collisionTestTimer >= collisionTestFreq)
		{
			this.collisionTestTimer = 0;
			this.testCollisionWithPointBonuses();
		}
	}
	
	this.testCollisionWithPointBonuses = function ()
	{
		for (var i = 0; i < pointBonuses.length; i++)
		{
			var pointDist = this.position.distance(pointBonuses[i].position);
			if (pointDist <= (pointBonuses[i].size)+(this.size))
			{
				pointBonuses.splice(i,1);
				points += 3;
				i = pointBonuses.length;
			}
		}
	}
}

function drawCircle (x, y, size, color)
{
	ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI, false);
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.stroke();
}


function createAsteroid(isStart)
{	
	var asteroid = new Asteroid();
	
	var margin = new Vector2D(-20,-20);
	if (isStart)
	{
		margin = new Vector2D(Math.random() * (canvas.width/4 - 10) + 10, Math.random() * (canvas.height/4 - 10) + 10);
	}
	
	var amountOfVertices = Math.random() * (10 - 4) + 4;
	for (var i = 0; i < amountOfVertices; i++)
	{
		var verticeDistance = Math.random() * (asteroid.size/1.25 - asteroid.size/4) + asteroid.size/2;
		asteroid.verticeDistances.push(verticeDistance);
	}
	
	var startVelocityMin = 1;
	var startVelocityMax = 10;
	var forwardVelo = Math.random() * (startVelocityMax - (startVelocityMin)) + (-startVelocityMin);
	var sideVelo = Math.random() * ((0.75*forwardVelo) - (-0.75*forwardVelo)) + (-0.75*forwardVelo);
	
	var edgeToSpawnOnIndex = Math.random() * (100 - 0) + 0;
	if (edgeToSpawnOnIndex < 25) //spawn on the left.
	{
		asteroid.position = new Vector2D(margin.x, Math.random() * (((canvas.height-(canvas.height/5)) - (canvas.height+(canvas.height/5))) + (canvas.height+(canvas.height/5))));
		asteroid.velocity = new Vector2D(forwardVelo, sideVelo);
	}
	if (edgeToSpawnOnIndex > 25 && edgeToSpawnOnIndex <= 50) //Spawn at the top.
	{
		asteroid.position = new Vector2D(Math.random() *  (((canvas.width-(canvas.width/5)) - (canvas.width+(canvas.width/5))) + (canvas.width+(canvas.width/5))), margin.y);
		asteroid.velocity = new Vector2D( sideVelo, forwardVelo);
	}
	if (edgeToSpawnOnIndex > 50 && edgeToSpawnOnIndex <= 75) //spawn at the bottom.
	{
		asteroid.position = new Vector2D(Math.random() * (((canvas.width-(canvas.width/5)) - (canvas.width+(canvas.width/5))) + (canvas.width+(canvas.width/5))), canvas.height-margin.y);
		asteroid.velocity = new Vector2D( sideVelo, -forwardVelo);
	}
	if (edgeToSpawnOnIndex > 75) //spawn on the right.
	{
		asteroid.position = new Vector2D(canvas.width-margin.x, Math.random() * (((canvas.height-(canvas.height/5)) - (canvas.height+(canvas.height/5))) + (canvas.height+(canvas.height/5))));
		asteroid.velocity = new Vector2D(-forwardVelo, sideVelo);
	}
	asteroids.push(asteroid);
}
function Asteroid()
{
  this.position = new Vector2D(0,0);
  this.velocity = new Vector2D(0,0);
  this.size = Math.random()*(45-15)+15;   //random (Math.random() * (max - min) + min;)
  this.acceleration = new Vector2D(0,0);
  this.maxVelo = 8/(this.size/10); //the bigger it is the less velocity from 2 to 4
  this.verticeDistances = [];
  this.collisionTestTimer = collisionTestFreq;
  
  this.draw = function() 
  {
	  drawAMeteor(this.position.x, this.position.y, this.verticeDistances);
	  //drawCircle(this.position.x, this.position.y, this.size, this.color);

  }
  
  this.move = function() 
  { 
	var acclerationDecreaseSpeed = 0.75; //Acceleration will decrease by 25% every frame.
		
		this.collisionTestTimer ++;
		if (this.collisionTestTimer >= collisionTestFreq)
		{
			this.collisionTestTimer = 0;
			this.checkCollisions();
		}
	
	this.acceleration = new Vector2D(this.acceleration.x * acclerationDecreaseSpeed, this.acceleration.y * acclerationDecreaseSpeed);
	
		this.velocity.x += this.acceleration.x;
		this.velocity.y += this.acceleration.y;
		
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
				
		if (this.velocity.magnitude() > this.maxVelo)
		{
			this.velocity = this.velocity.normalize();
			this.velocity.x *= this.maxVelo;
			this.velocity.y *= this.maxVelo;
		}
  }
  
  this.checkCollisions = function ()
  {
	  var collisionDamping = 0.25;
	  //loop through all asteroids, if any are really close then add some force to both in opposite directions.
	  for (var i = 0; i < asteroids.length; i++)
	  {
		  var asteroidDist = this.position.distance(asteroids[i].position);
		  if (asteroidDist <= this.size+asteroids[i].size)
		  {
			  var AstDir = new Vector2D(asteroids[i].position.x - this.position.x,asteroids[i].position.y-this.position.y);
				//normalize direction
				var normalizedAstDir = AstDir.normalize();
				var velMag = this.velocity.magnitude();
				var otherVelMag = asteroids[i].velocity.magnitude();
				
				this.acceleration.x -= normalizedAstDir.x* (velMag + otherVelMag) *asteroids[i].size * collisionDamping /this.size;
				this.acceleration.y -= normalizedAstDir.y* (velMag + otherVelMag) *asteroids[i].size * collisionDamping /this.size;
				
				asteroids[i].acceleration.x += normalizedAstDir.x* (velMag + otherVelMag) *this.size * collisionDamping /asteroids[i].size;
				asteroids[i].acceleration.y += normalizedAstDir.y* (velMag + otherVelMag) *this.size * collisionDamping /asteroids[i].size; 
				
				i = asteroids.length;
		  }
	  }
	  var playerDist = this.position.distance(player.position);
	  if (playerDist <= this.size + (player.size/3))
	  {
		  gameState = "Dead";
		  mousedown = false;
		  setScores();
	  }
	  
  }
}

function PointBonus(x, y)
{
	this.position = new Vector2D(x, y);
	this.color = "#ffeb43";
	this.size = Math.random()*(14-7)+7;
	this.minSize = this.size;
	this.maxSize = this.size * (Math.random()*(3-2)+2);
	this.growSpeed = (Math.random()*(0.25-0.1)+0.1);
	this.lifeTime = Math.random()*(8-4)+4;
	
	this.draw = function() 
	{
		this.size += this.growSpeed;
		if ((this.size < this.minSize && this.growSpeed < 0) || (this.size > this.maxSize && this.growSpeed > 0))
		{
			this.growSpeed = -this.growSpeed;
		}
		
		drawAStar(this.position.x, this.position.y, 5, this.color, this.size,1.75);
		//the collision box
		//drawCircle(this.position.x, this.position.y, this.size, this.color);
	}
}



function drawAStar(xX, yY, spikes, color, size, radius)
{
	//from http://jsfiddle.net/m1erickson/8j6kdf4o/
		var rot = Math.PI / 2 * 3;
		var x = xX;
		var y = yY;
		var step = Math.PI / spikes;


		ctx.strokeSyle = color;
		ctx.beginPath();
		ctx.moveTo(xX, yY - size);
		for (i = 0; i < spikes; i++) {
			x = xX + Math.cos(rot) * size;
			y = yY + Math.sin(rot) * size;
			ctx.lineTo(x, y)
			rot += step

			x = xX + Math.cos(rot) * size/radius;
			y = yY + Math.sin(rot) * size/radius;
			ctx.lineTo(x, y)
			rot += step
		}
		ctx.lineTo(xX, yY - size);
		ctx.closePath();
		ctx.fillStyle=color;
		ctx.fill();
}

function drawAMeteor(xX, yY, verticeDistances)
{
		var rot = Math.PI /2 * 3;
		var x = xX;
		var y = yY;
		var step = Math.PI / verticeDistances.length;


		ctx.beginPath();
		ctx.moveTo(xX, yY-verticeDistances[0]); 
		for (i = 0; i < verticeDistances.length; i++) {
			x = xX + Math.cos(rot) * verticeDistances[i];
			y = yY + Math.sin(rot) * verticeDistances[i];
			ctx.lineTo(x, y);
			rot += step;

			x = xX + Math.cos(rot) * verticeDistances[i];
			y = yY + Math.sin(rot) * verticeDistances[i];
			ctx.lineTo(x, y);
			rot += step;
		}
		ctx.lineTo(xX, yY-verticeDistances[verticeDistances.length]);
		ctx.closePath();
			/*var grd=ctx.createLinearGradient(xX-10,yY-10,xX+10,yY+10);
			grd.addColorStop(0,"#a07e67");
			grd.addColorStop(1,"#684c3a");*/ //turns out gradient is really slow on mobile..
		ctx.fillStyle="#a07e67";
		ctx.fill();
		ctx.lineWidth = 2;
		ctx.strokeStyle="#684c3a";
		ctx.stroke();
}