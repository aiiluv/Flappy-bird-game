//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//player
let playerWidth = 34;
let playerHeight = 24;
let playerX = boardWidth/8;
let playerY = boardHeight/2;

let playerImg;

let player = {
    x: playerX,
    y: playerY,
    width: playerWidth,
    height: playerHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;
let openingSpace = 150;

//game state
let gameStarted = false;
let countdown = 0;
let currentTheme = "classic";

//THEME ASSETS

//player
let playerClassic = new Image();
playerClassic.src = "assets/bird.png";

let playerSpace = new Image();
playerSpace.src = "assets/space-bird.png";

//pipes
let topClassic = new Image();
topClassic.src = "assets/classic-top.png";

let bottomClassic = new Image();
bottomClassic.src = "assets/classic-bottom.png";

let topSpace = new Image();
topSpace.src = "assets/space-top.png";

let bottomSpace = new Image();
bottomSpace.src = "assets/space-bottom.png";

//LOAD
window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    document.getElementById("playBtn").addEventListener("click", startGame);

    document.getElementById("Classic").addEventListener("click", () => setTheme("classic"));
    document.getElementById("Space").addEventListener("click", () => setTheme("space"));

    document.addEventListener("keydown", movePlayer);

    setTheme("classic");

    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
}

//THEME SWITCH
function setTheme(theme) {
    currentTheme = theme;

    let video = document.getElementById("bg-video");

    if (theme === "classic") {
        playerImg = playerClassic;
        topPipeImg = topClassic;
        bottomPipeImg = bottomClassic;

        board.style.backgroundImage = "url('assets/bg-game.png')";

        // video off
        video.style.display = "none";
        document.body.style.background = "#87CEEB";
        
    } else {
        playerImg = playerSpace;
        topPipeImg = topSpace;
        bottomPipeImg = bottomSpace;

        board.style.backgroundImage = "url('assets/bg-game-space.png')";
        video.src = "assets/bg-video-space.mp4";

        // video on
        video.style.display = "block";
        document.body.style.background = "none";
    }

    pipeArray = [];

    video.load();
    video.play();
}

//START GAME
function startGame() {
    if (gameStarted) return;

    countdown = 3;
    gameStarted = false;

    let interval = setInterval(() => {
        countdown--;

        if (countdown <= 0) {
            clearInterval(interval);
            gameStarted = true;
            document.getElementById("playBtn").style.display = "none";
        }
    }, 1000);
}

//UPDATE LOOP
function update() {
    requestAnimationFrame(update);

    context.clearRect(0, 0, board.width, board.height);

    //belum start
    if (!gameStarted) {
        context.fillStyle = "white";
        context.font = "50px sans-serif";

        if (countdown > 0) {
            context.fillText(countdown, boardWidth/2 - 15, boardHeight/2);
        } else {
            context.fillText("Press Play", 70, 300);
        }
        return;
    }

    if (gameOver) {
        context.fillStyle = "white";
        context.font = "45px sans-serif";
        context.fillText("GAME OVER", 50, 300);
        return;
    }

    //player
    velocityY += gravity;
    player.y = Math.max(player.y + velocityY, 0);
    context.drawImage(playerImg, player.x, player.y, player.width, player.height);

    if (player.y > board.height) {
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;

        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && player.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(player, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    //score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 160, 90);
}

//PIPES
function placePipes() {
    if (gameOver || !gameStarted) return;

    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);

    pipeArray.push({
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    });

    pipeArray.push({
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    });
}

//CONTROL
function movePlayer(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        velocityY = -6;

        if (gameOver) {
            player.y = playerY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            gameStarted = false;

            document.getElementById("playBtn").style.display = "inline-block";
        }
    }
}

//COLLISION
function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}