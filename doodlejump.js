// Board
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

// Doodler
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

// Physics
let velocityX = 0;
let velocityY = 0; // Doodler jump speed
let initialVelocityY = -10; // Starting velocity Y
let gravity = 0.5;

// Platforms
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

let score = 0;
let maxScore = 0;
let gameOver = false;

let lastFrameTime = 0;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Load images
    doodlerRightImg = new Image();
    doodlerRightImg.src = "./images/doodler-right.png";
    doodler.img = doodlerRightImg;

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

function update(timestamp) {
    let deltaTime = (timestamp - lastFrameTime) / 16.67; // Normalize to 60 FPS
    lastFrameTime = timestamp;

    if (gameOver) return;

    context.clearRect(0, 0, board.width, board.height);

    // Update doodler position
    doodler.x += velocityX * deltaTime;
    if (doodler.x > boardWidth) {
        doodler.x = 0;
    } else if (doodler.x + doodler.width < 0) {
        doodler.x = boardWidth;
    }

    velocityY += gravity * deltaTime;
    doodler.y += velocityY * deltaTime;

    if (doodler.y > board.height) {
        gameOver = true;
    }

    if (velocityY < 0 && doodler.y < boardHeight / 3) {
        let offset = (boardHeight / 3 - doodler.y) * deltaTime;
        doodler.y = boardHeight / 3;

        for (let platform of platformArray) {
            platform.y += offset;
        }

        score += Math.floor(offset / 10);
    }

    // Draw doodler
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    // Update platforms
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];

        if (detectCollision(doodler, platform) && velocityY >= 0) {
            velocityY = initialVelocityY;
            velocityX=0;
        }

        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift();
        newPlatform();
    }

    // Update score
    updateScore();
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText(`Score: ${score}`, 5, 20);

    if (gameOver) {
        context.fillText("Game Over: Tap to Restart", boardWidth / 7, boardHeight * 7 / 8);
    }

    requestAnimationFrame(update);
}

function moveDoodler(e) {
    const touchX = e.touches?.[0]?.clientX;

    if ((touchX > boardWidth / 2) || e.code === "KeyD") {
        velocityX = 4;
        doodler.img = doodlerRightImg;
    } else if ((touchX < boardWidth / 2) || e.code === "KeyA") {
        velocityX = -4;
        doodler.img = doodlerLeftImg;
    }

    if (gameOver) {
        resetGame();
    }
}

function resetGame() {
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
    gameOver = false;
    placePlatforms();
}

function placePlatforms() {
    platformArray = [];

    let platform = {
        img: platformImg,
        x: boardWidth / 2,
        y: boardHeight - 50,
        width: platformWidth,
        height: platformHeight
    };

    platformArray.push(platform);

    for (let i = 0; i < 6; i++) {
        let randomX = Math.random() * (boardWidth * 3 / 4);
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
    let randomX = Math.random() * (boardWidth * 3 / 4);
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
    if (velocityY < 0) {
        score++;
        maxScore = Math.max(maxScore, score);
    }
}
