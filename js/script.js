// Variáveis do jogo
var canvas;
var ctx;
var snake;
var apple;
var tileSize;
var score;
var highScore;
var gameStarted; // Flag para verificar se o jogo foi iniciado

// Elementos do score e high score
var scoreElement;
var highScoreElement;

// Elementos do balão de instruções
var instructionBalloon;
var closeButton;

// Direções
var direction;
var newDirection;

// Inicialização do jogo
function init() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    tileSize = 20;
    snake = [{ x: 10, y: 10 }];
    apple = { x: 15, y: 10 };
    score = 0;
    highScore = localStorage.getItem("highScore") || 0;
    direction = "right";
    newDirection = "right";
    scoreElement = document.getElementById("score");
    highScoreElement = document.getElementById("highscore");
    gameStarted = false; // O jogo não foi iniciado ainda

    // Elementos do balão de instruções
    instructionBalloon = document.createElement("div");
    instructionBalloon.id = "instruction-balloon";
    instructionBalloon.innerHTML = "Para começar a jogar, clique em qualquer tecla do teclado para iniciar o jogo. Caso não pressione nenhuma tecla, o jogo não será iniciado. Divirta-se jogando!";
    document.body.appendChild(instructionBalloon);

    closeButton = document.createElement("span");
    closeButton.id = "close-button";
    closeButton.innerHTML = "X";
    instructionBalloon.appendChild(closeButton);

    closeButton.addEventListener("click", function() {
        closeInstructionBalloon();
    });

    document.addEventListener("keydown", keyDown);
    draw(); // Desenha a cobra e a maçã inicialmente

    var authorImage = document.querySelector('.author-image');
    authorImage.addEventListener('click', function() {
        window.open('https://bit.ly/43AxN7w', '_blank');
    });

    var authorName = document.querySelector('.author-name');
    authorName.addEventListener('click', function() {
        window.open('https://bit.ly/43AxN7w', '_blank');
    });
}

// Loop principal do jogo
function gameLoop() {
    if (gameStarted) {
        clearCanvas();
        update();
        draw();
        updateScore();
    }
}

// Atualiza o estado do jogo
function update() {
    direction = newDirection;
    moveSnake();
    checkCollision();
    checkAppleCollision();
}

// Move a cobra na direção atual
function moveSnake() {
    var head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case "up":
            head.y--;
            break;
        case "down":
            head.y++;
            break;
        case "left":
            head.x--;
            break;
        case "right":
            head.x++;
            break;
    }

    snake.unshift(head);
    snake.pop();
}

// Verifica colisões com as bordas e com a própria cobra
function checkCollision() {
    var head = snake[0];
    var hasCollision = (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= canvas.width / tileSize ||
        head.y >= canvas.height / tileSize ||
        isSnakeCollision(head)
    );

    if (hasCollision) {
        endGame();
    }
}

// Verifica colisão com a maçã
function checkAppleCollision() {
    var head = snake[0];

    if (head.x === apple.x && head.y === apple.y) {
        score++;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
        }
        generateApple();
        increaseSnakeSize();
    }
}

// Verifica colisão da cobra consigo mesma
function isSnakeCollision(head) {
    for (var i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

// Gera a posição de uma nova maçã aleatoriamente
function generateApple() {
    apple.x = Math.floor(Math.random() * (canvas.width / tileSize));
    apple.y = Math.floor(Math.random() * (canvas.height / tileSize));
}

// Aumenta o tamanho da cobra
function increaseSnakeSize() {
    var tail = { x: snake[0].x, y: snake[0].y };
    snake.unshift(tail);
}

// Finaliza o jogo
function endGame() {
    snake = [{ x: 10, y: 10 }];
    score = 0;
    gameStarted = false; // O jogo foi finalizado
}

// Limpa o canvas
function clearCanvas() {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Desenha a cobra, a maçã e as informações do jogo
function draw() {
    drawSnake();
    drawApple();
}

// Desenha a cobra
function drawSnake() {
    ctx.fillStyle = "#000000";

    for (var i = 0; i < snake.length; i++) {
        var segment = snake[i];
        ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
    }
}

// Desenha a maçã
function drawApple() {
    ctx.fillStyle = "red";
    ctx.fillRect(apple.x * tileSize, apple.y * tileSize, tileSize, tileSize);
}

// Atualiza o score e high score
function updateScore() {
    scoreElement.textContent = score;
    highScoreElement.textContent = highScore;
}

// Evento de tecla pressionada
function keyDown(event) {
    if (!gameStarted) {
        // Inicia o jogo ao pressionar qualquer botão do teclado
        gameStarted = true;
        closeInstructionBalloon();
    }

    switch (event.keyCode) {
        case 37: // Setinha para esquerda
            if (direction !== "right") {
                newDirection = "left";
            }
            break;
        case 38: // Setinha para cima
            if (direction !== "down") {
                newDirection = "up";
            }
            break;
        case 39: // Setinha para direita
            if (direction !== "left") {
                newDirection = "right";
            }
            break;
        case 40: // Setinha para baixo
            if (direction !== "up") {
                newDirection = "down";
            }
            break;
    }
}

// Fecha o balão de instruções
function closeInstructionBalloon() {
    instructionBalloon.style.display = "none";
}

// Inicializa o jogo quando a página é carregada
window.onload = function () {
    init();
    setInterval(gameLoop, 100); // Define o loop principal do jogo
};