//board
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

//doodler
let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = boardWidth / 2 - doodlerWidth / 2;
let doodlerY = boardHeight * 7 / 8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

let doodler = {
    img: null,
    x: doodlerX,
    y: doodlerY,
    width: doodlerWidth,
    height: doodlerHeight
};

//physics
let velocityX = 0; 
let velocityY = 0; //doodler jump speed
let initialVelocityY = -3; //starting velocity Y
let gravity = 0.05;

//platforms
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

let score = 0;
let maxScore = 0;
let gameOver = false;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //load images
    doodlerRightImg = new Image();
    doodlerRightImg.src = "./images/doodler-right.png";
    doodler.img = doodlerRightImg;
    doodlerRightImg.onload = function() {
        context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    };

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "./images/doodler-left.png";

    platformImg = new Image();
    platformImg.src = "./images/platform.png";

    velocityY = initialVelocityY;
    placePlatforms();
    requestAnimationFrame(update);
    document.addEventListener("touchstart", moveDoodler);
    document.addEventListener("keydown", moveDoodler);
};

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Update doodler position
    doodler.x += velocityX;
    if (doodler.x > boardWidth) {
        doodler.x = 0;
    } else if (doodler.x + doodler.width < 0) {
        doodler.x = boardWidth;
    }

    velocityY += gravity;
    doodler.y += velocityY;

    // If doodler falls below the screen
    if (doodler.y > board.height) {
        gameOver = true;
    }

    // Camera mechanics: if doodler rises above 1/3 of the screen
    if (velocityY < 0 && doodler.y < boardHeight / 3) {
        let offset = boardHeight / 3 - doodler.y;
        doodler.y = boardHeight / 3; // Lock doodler position

        // Move all platforms down
        for (let i = 0; i < platformArray.length; i++) {
            platformArray[i].y += offset;
        }

        // Increase score as camera moves up
        score += Math.floor(offset / 10);
    }

    // Draw doodler
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    // Update platforms
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];

        // Check for collision
        if (detectCollision(doodler, platform) && velocityY >= 0) {
            velocityY = initialVelocityY; // Doodler jumps
        }

        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    // Remove off-screen platforms and add new ones
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift(); // Remove first platform
        newPlatform(); // Add new platform at the top
    }

    // Update score
    updateScore();
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText(score, 5, 20);

    // Game over handling
    if (gameOver) {
        context.fillText("Game Over: Tap to Restart", boardWidth / 7, boardHeight * 7 / 8);
    }
}

function moveDoodler(e) {
    const touch = e.touches?.[0]; // Check for touch event
    const touchX = touch?.clientX; // Get X coordinate of touch

    if ((touchX > boardWidth / 2) || e.code == "KeyD") { // Move right
        velocityX = 1;
        doodler.img = doodlerRightImg;
    } else if ((touchX < boardWidth / 2) || e.code == "KeyA") { // Move left
        velocityX = -1;
        doodler.img = doodlerLeftImg;
    }
    if (gameOver) {
        doodler = {
            img: doodlerRightImg,
            x: doodlerX,
            y: doodlerY,
            width: doodlerWidth,
            height: doodlerHeight
        };

        velocityX = 0;
        velocityY = initialVelocityY;
        score = 0;
        maxScore = 0;
        gameOver = false;
        placePlatforms();
    }
}

function placePlatforms() {
    platformArray = [];

    // Starting platforms
    let platform = {
        img: platformImg,
        x: boardWidth / 2,
        y: boardHeight - 50,
        width: platformWidth,
        height: platformHeight
    };

    platformArray.push(platform);

    for (let i = 0; i < 6; i++) {
        let randomX = Math.floor(Math.random() * boardWidth * 3 / 4);
        let platform = {
            img: platformImg,
            x: randomX,
            y: boardHeight - 75 * i - 150,
            width: platformWidth,
            height: platformHeight
        };
        platformArray.push(platform);
    }
}

function newPlatform() {
    let randomX = Math.floor(Math.random() * boardWidth * 3 / 4);
    let platform = {
        img: platformImg,
        x: randomX,
        y: -platformHeight,
        width: platformWidth,
        height: platformHeight
    };

    platformArray.push(platform);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function updateScore() {
    if (velocityY < 0) { // Going up
        score++;
        maxScore = Math.max(maxScore, score);
    }
}
