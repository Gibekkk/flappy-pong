let ballX, ballY;
let ballSize = 20;
let ballColor;
let gravity = 1;
let ballSpeedVert = 0;
let airFriction = 0.0001;
let friction = 0.1;

let racketColor;
let racketWidth = 100;
let racketHeight = 10;
let racketBounceRate = 20;

let wallSpeed = 5;
let wallInterval = 3000;
let lastAddTime = 0;
let minGapHeight = 200;
let maxGapHeight = 300;
let wallWidth = 80;
let wallColors;
let walls = [];
let score = 0;
let wallRadius = 50;

let maxHealth = 100;
let health = 100;
let healthDecrease = 1;
let healthBarWidth = 60;

let ballSpeedHorizon = 10;
let gameScreen = 0;

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  ballX = width / 4;
  ballY = height / 5;
  ballColor = color(0);
  racketColor = color(0);
}

function draw() {
  if (gameScreen === 0) initScreen();
  else if (gameScreen === 1) gameScreenFunc();
  else if (gameScreen === 2) gameOverScreen();
}

function mousePressed() {
  if (gameScreen === 0) startGame();
  else if (gameScreen === 2) restart();
}

function startGame() {
  gameScreen = 1;
}

function restart() {
  score = 0;
  health = maxHealth;
  ballX = width / 4;
  ballY = height / 5;
  lastAddTime = 0;
  walls = [];
  gameScreen = 0;
}

function initScreen() {
  background(0);
  textAlign(CENTER);
  fill(255);
  text("Klik untuk memulai", width / 2, height / 2);
}

function gameScreenFunc() {
  background(255);
  drawBall();
  applyGravity();
  keepInScreen();
  drawRacket();
  watchRacketBounce();
  applyHorizontalSpeed();
  wallAdder();
  wallHandler();
  drawHealthBar();
  printScore();
}

function drawBall() {
  fill(ballColor);
  ellipse(ballX, ballY, ballSize, ballSize);
}

function applyGravity() {
  ballSpeedVert += gravity;
  ballY += ballSpeedVert;
  ballSpeedVert -= ballSpeedVert * airFriction;
}

function makeBounceBottom(surface) {
  ballY = surface - ballSize / 2;
  ballSpeedVert *= -1;
  ballSpeedVert -= ballSpeedVert * friction;
}

function makeBounceTop(surface) {
  ballY = surface + ballSize / 2;
  ballSpeedVert *= -1;
  ballSpeedVert -= ballSpeedVert * friction;
}

function keepInScreen() {
  if (ballY + ballSize / 2 > height) makeBounceBottom(height);
  if (ballY - ballSize / 2 < 0) makeBounceTop(0);
  if (ballX - ballSize / 2 < 0) makeBounceLeft(0);
  if (ballX + ballSize / 2 > width) makeBounceRight(width);
}

function drawRacket() {
  fill(racketColor);
  rectMode(CENTER);
  rect(mouseX, mouseY, racketWidth, racketHeight);
}

function watchRacketBounce() {
  let overhead = mouseY - pmouseY;
  if (
    ballX + ballSize / 2 > mouseX - racketWidth / 2 &&
    ballX - ballSize / 2 < mouseX + racketWidth / 2
  ) {
    if (dist(ballX, ballY, ballX, mouseY) <= ballSize / 2 + abs(overhead)) {
      makeBounceBottom(mouseY);
      if (overhead < 0) {
        ballY += overhead;
        ballSpeedVert += overhead;
      }
      ballSpeedHorizon = (ballX - mouseX) / 5;
    }
  }
}

function applyHorizontalSpeed() {
  ballX += ballSpeedHorizon;
  ballSpeedHorizon -= ballSpeedHorizon * airFriction;
}

function makeBounceLeft(surface) {
  ballX = surface + ballSize / 2;
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= ballSpeedHorizon * friction;
}

function makeBounceRight(surface) {
  ballX = surface - ballSize / 2;
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= ballSpeedHorizon * friction;
}

function wallAdder() {
  if (millis() - lastAddTime > wallInterval) {
    wallColors = color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
    let randHeight = round(random(minGapHeight, maxGapHeight));
    let randY = round(random(0, height - randHeight));
    walls.push([width, randY, wallWidth, randHeight, 0, wallColors]);
    lastAddTime = millis();
  }
}

function wallHandler() {
  for (let i = walls.length - 1; i >= 0; i--) {
    wallRemover(i);
    wallMover(i);
    wallDrawer(i);
    watchWallCollision(i);
  }
}

function wallDrawer(index) {
  let [x, y, w, h, _, color] = walls[index];
  rectMode(CORNER);
  fill(color);
  rect(x, 0, w, y, 0,0,50,50);
  rect(x, y + h, w, height - (y + h), 50,50,0,0);
}

function wallMover(index) {
  walls[index][0] -= wallSpeed;
}

function wallRemover(index) {
  if (walls[index][0] + walls[index][2] <= 0) walls.splice(index, 1);
}

function watchWallCollision(index) {
  let [gapX, gapY, gapW, gapH, scored] = walls[index];

  let topHit =
    ballX + ballSize / 2 > gapX &&
    ballX - ballSize / 2 < gapX + gapW &&
    ballY - ballSize / 2 < gapY;

  let bottomHit =
    ballX + ballSize / 2 > gapX &&
    ballX - ballSize / 2 < gapX + gapW &&
    ballY + ballSize / 2 > gapY + gapH;

  if (topHit || bottomHit) decreaseHealth();

  if (ballX > gapX + gapW / 2 && scored === 0) {
    walls[index][4] = 1;
    score++;
  }
}

function drawHealthBar() {
  noStroke();
  fill(236, 240, 241);
  rect(ballX - healthBarWidth / 2, ballY - 30, healthBarWidth, 5);

  if (health > 60) fill(46, 204, 113);
  else if (health > 30) fill(230, 126, 34);
  else fill(231, 76, 60);

  rect(ballX - healthBarWidth / 2, ballY - 30, (healthBarWidth * health) / maxHealth, 5);
}

function decreaseHealth() {
  health -= healthDecrease;
  if (health <= 0) gameOver();
}

function gameOver() {
  gameScreen = 2;
}

function gameOverScreen() {
  background(0);
  fill(255);
  textAlign(CENTER);
  textSize(30);
  text("Game Over", width / 2, height / 2 - 30);
  textSize(15);
  text("Click to Restart", width / 2, height / 2 + 10);
  printScore();
}

function printScore() {
  textAlign(CENTER);
  if (gameScreen === 1) {
    fill(0);
    textSize(30);
    text(score, width / 2, 50);
  } else if (gameScreen === 2) {
    fill(255);
    textSize(22);
    text("Score: " + score, width / 2, height / 2 + 60);
  }
}
