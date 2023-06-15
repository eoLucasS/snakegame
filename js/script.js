// Variáveis do jogo
var canvas;
var ctx;
var snake;
var apple;
var tileSize;
var score;
var highScore;
var gameStarted; // Flag para verificar se o jogo foi iniciado
var firstMove; // Flag para verificar se é a primeira jogada

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
  firstMove = true; // É a primeira jogada

  // Elementos do balão de instruções
  instructionBalloon = document.createElement("div");
  instructionBalloon.id = "instruction-balloon";
  instructionBalloon.innerHTML =
    "Para começar a jogar, clique nas setas do teclado para iniciar o jogo. Caso não pressione nenhuma tecla, o jogo não será iniciado. Divirta-se jogando!";
  document.body.appendChild(instructionBalloon);

  closeButton = document.createElement("span");
  closeButton.id = "close-button";
  closeButton.innerHTML = "X";
  instructionBalloon.appendChild(closeButton);

  closeButton.addEventListener("click", function () {
    closeInstructionBalloon();
  });

  document.addEventListener("keydown", keyDown);
  draw(); // Desenha a cobra e a maçã inicialmente

  var authorImage = document.querySelector(".author-image");
  authorImage.addEventListener("click", function () {
    window.open("https://bit.ly/43AxN7w", "_blank");
  });

  var authorName = document.querySelector(".author-name");
  authorName.addEventListener("click", function () {
    window.open("https://bit.ly/43AxN7w", "_blank");
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
  var hasCollision =
    head.x < 0 ||
    head.y < 0 ||
    head.x >= canvas.width / tileSize ||
    head.y >= canvas.height / tileSize ||
    isSnakeCollision(head);

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

// Gera a posição de uma nova maçã aleatoriamente, evitando a posição ocupada pela cobra
function generateApple() {
    var validPosition = false;
    var randomX, randomY; // Move a declaração para fora do loop
    
    while (!validPosition) {
      randomX = Math.floor(Math.random() * (canvas.width / tileSize));
      randomY = Math.floor(Math.random() * (canvas.height / tileSize));
  
      validPosition = true;
  
      // Verifica se a posição gerada está ocupada pela cobra
      for (var i = 0; i < snake.length; i++) {
        if (snake[i].x === randomX && snake[i].y === randomY) {
          validPosition = false;
          break;
        }
      }
    }
  
    apple.x = randomX;
    apple.y = randomY;
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
      ctx.fillStyle = "#000000"; // Cor do corpo da cobra
      
      ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
      
      // Desenha a cabeça da cobra
      if (i === 0) {
        var x = segment.x * tileSize + tileSize / 2;
        var y = segment.y * tileSize + tileSize / 2;
        var radius = tileSize / 2;
        
        // Desenha os olhos
        ctx.beginPath();
        ctx.arc(x - radius / 2, y - radius / 4, radius / 6, 0, 2 * Math.PI); // Olho esquerdo
        ctx.arc(x + radius / 2, y - radius / 4, radius / 6, 0, 2 * Math.PI); // Olho direito
        ctx.fillStyle = "#ff0000"; // Cor dos olhos vermelhos
        ctx.fill();
        
        ctx.fillStyle = "#000000"; // Cor da cabeça da cobra
      }
    }
  }

// Desenha a maçã
function drawApple() {
  ctx.fillStyle = "red";
  ctx.fillRect(
    apple.x * tileSize,
    apple.y * tileSize,
    tileSize,
    tileSize
  );
}

// Atualiza o score e high score
function updateScore() {
  scoreElement.textContent = score;
  highScoreElement.textContent = highScore;
}

// Evento de tecla pressionada
function keyDown(event) {
  if (!gameStarted) {
    // Inicia o jogo ao pressionar uma tecla válida
    if (
      event.keyCode === 37 || // Esquerda
      event.keyCode === 38 || // Cima
      event.keyCode === 39 || // Direita
      event.keyCode === 40 // Baixo
    ) {
      gameStarted = true;
      closeInstructionBalloon();
    }
  }

  if (gameStarted) {
    switch (event.keyCode) {
      case 37: // Esquerda
        if (direction !== "right" || firstMove) {
          newDirection = "left";
          firstMove = false;
        }
        break;
      case 38: // Cima
        if (direction !== "down" || firstMove) {
          newDirection = "up";
          firstMove = false;
        }
        break;
      case 39: // Direita
        if (direction !== "left" || firstMove) {
          newDirection = "right";
          firstMove = false;
        }
        break;
      case 40: // Baixo
        if (direction !== "up" || firstMove) {
          newDirection = "down";
          firstMove = false;
        }
        break;
    }
  }
}

// Fecha o balão de instruções
function closeInstructionBalloon() {
  if (instructionBalloon) {
    instructionBalloon.parentNode.removeChild(instructionBalloon);
  }
}

// Inicializa o jogo quando a página é carregada
window.onload = function () {
  init();
  setInterval(gameLoop, 100);
};
