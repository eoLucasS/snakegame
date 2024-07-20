// Variáveis do jogo
var canvas;
var ctx;
var snake;
var apple;
var tileSize;
var score;
var highScore;
var gameStarted; // Flag para verificar se o jogo foi iniciado
var gameInterval; // Intervalo do jogo, para ajustar a velocidade
var isPaused = false; // Flag para verificar se o jogo está pausado

// Elementos do score e high score
var scoreElement;
var highScoreElement;

// Elementos do balão de instruções
var instructionBalloon;
var closeButton;

// Direções
var direction;
var newDirection;
var firstMove; // Flag para verificar se é o primeiro movimento da cobra

// Dificuldade
var difficulty;
var gameSpeed; // Velocidade do jogo, ajustável pela dificuldade

// Power-ups
var powerUp;
var powerUpActive = false;
var powerUpType;
var powerUpTimeout;

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
  firstMove = true;
  scoreElement = document.getElementById("score");
  highScoreElement = document.getElementById("highscore");
  gameStarted = false; // O jogo não foi iniciado ainda

  // Configurar a dificuldade
  var difficultySelect = document.getElementById("difficulty");
  difficultySelect.addEventListener("change", setDifficulty);
  setDifficulty(); // Definir dificuldade inicial

  // Configurar botão de pausa
  var pauseButton = document.getElementById("pauseButton");
  pauseButton.addEventListener("click", togglePause);

  // Elementos do balão de instruções
  instructionBalloon = document.createElement("div");
  instructionBalloon.id = "instruction-balloon";
  instructionBalloon.innerHTML =
    "Para começar a jogar, clique em qualquer tecla do teclado para iniciar o jogo. Caso não pressione nenhuma tecla, o jogo não será iniciado. Divirta-se jogando!";
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

  generatePowerUp();
}

// Definir a dificuldade e ajustar a velocidade do jogo
function setDifficulty() {
  var difficultySelect = document.getElementById("difficulty");
  difficulty = difficultySelect.value;
  switch (difficulty) {
    case "easy":
      gameSpeed = 150;
      break;
    case "medium":
      gameSpeed = 100;
      break;
    case "hard":
      gameSpeed = 50;
      break;
  }
  if (gameStarted && !isPaused) {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
  }
}

// Alternar o estado de pausa
function togglePause() {
  if (gameStarted) {
    isPaused = !isPaused;
    var pauseButton = document.getElementById("pauseButton");
    if (isPaused) {
      clearInterval(gameInterval);
      pauseButton.textContent = "Despausar";
    } else {
      gameInterval = setInterval(gameLoop, gameSpeed);
      pauseButton.textContent = "Pausar";
    }
  }
}

// Loop principal do jogo
function gameLoop() {
  if (gameStarted && !isPaused) {
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
  checkPowerUpCollision();
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
  var hasCollisionWithWall =
    head.x < 0 ||
    head.y < 0 ||
    head.x >= canvas.width / tileSize ||
    head.y >= canvas.height / tileSize;
  var hasCollisionWithSelf =
    isSnakeCollision(head) && (!powerUpActive || powerUpType !== "immunity");

  if (hasCollisionWithWall) {
    if (powerUpActive && powerUpType === "immunity") {
      // Cobra está imune e colidiu com a parede, mudar direção
      if (head.x < 0) {
        head.x = 0;
        newDirection = head.y < canvas.height / tileSize / 2 ? "down" : "up";
      } else if (head.x >= canvas.width / tileSize) {
        head.x = canvas.width / tileSize - 1;
        newDirection = head.y < canvas.height / tileSize / 2 ? "down" : "up";
      } else if (head.y < 0) {
        head.y = 0;
        newDirection = head.x < canvas.width / tileSize / 2 ? "right" : "left";
      } else if (head.y >= canvas.height / tileSize) {
        head.y = canvas.height / tileSize - 1;
        newDirection = head.x < canvas.width / tileSize / 2 ? "right" : "left";
      }
    } else {
      endGame();
    }
  } else if (hasCollisionWithSelf) {
    endGame();
  }
}

// Verifica colisão da cobra consigo mesma
function isSnakeCollision(head) {
  for (var i = 1; i < snake.length; i++) {
    if (
      Math.abs(head.x - snake[i].x) < 1 &&
      Math.abs(head.y - snake[i].y) < 1
    ) {
      return true;
    }
  }
  return false;
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

// Verifica colisão com power-up
function checkPowerUpCollision() {
  var head = snake[0];

  if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
    activatePowerUp();
    powerUp = null; // Remover o power-up do campo
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

// Gera a posição de uma nova maçã aleatoriamente, evitando a posição ocupada pela cobra e uma distância mínima da cobra
function generateApple() {
  var validPosition = false;
  var randomX, randomY;

  while (!validPosition) {
    randomX = Math.floor(Math.random() * (canvas.width / tileSize));
    randomY = Math.floor(Math.random() * (canvas.height / tileSize));

    validPosition = true;

    // Verifica se a posição gerada está ocupada pela cobra ou próxima da cobra
    for (var i = 0; i < snake.length; i++) {
      if (snake[i].x === randomX && snake[i].y === randomY) {
        validPosition = false;
        break;
      }
      if (Math.abs(snake[i].x - randomX) < 2 && Math.abs(snake[i].y - randomY) < 2) {
        validPosition = false;
        break;
      }
    }
  }

  apple.x = randomX;
  apple.y = randomY;
}

// Gera um novo power-up aleatoriamente
function generatePowerUp() {
  var validPosition = false;
  var randomX, randomY;

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

    // Verifica se a posição gerada está ocupada pela maçã
    if (randomX === apple.x && randomY === apple.y) {
      validPosition = false;
    }
  }

  powerUp = { x: randomX, y: randomY };
  powerUpType = Math.random() < 0.5 ? "speed" : "immunity";
}

// Ativa o power-up
function activatePowerUp() {
  powerUpActive = true;

  switch (powerUpType) {
    case "speed":
      clearInterval(gameInterval);
      gameSpeed /= 2; // Aumenta a velocidade do jogo
      gameInterval = setInterval(gameLoop, gameSpeed);
      powerUpTimeout = setTimeout(deactivatePowerUp, 5000); // Power-up dura 5 segundos
      break;
    case "immunity":
      powerUpTimeout = setTimeout(deactivatePowerUp, 5000); // Power-up dura 5 segundos
      break;
  }
}

// Desativa o power-up
function deactivatePowerUp() {
  powerUpActive = false;

  if (powerUpType === "speed") {
    clearInterval(gameInterval);
    gameSpeed *= 2; // Restaura a velocidade do jogo
    gameInterval = setInterval(gameLoop, gameSpeed);
  }

  generatePowerUp();
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
  firstMove = true;
  clearInterval(gameInterval); // Parar o loop do jogo
  isPaused = false; // Resetar o estado de pausa
  document.getElementById("pauseButton").textContent = "Pausar"; // Resetar o texto do botão de pausa

  // Desativar qualquer power-up ativo
  if (powerUpActive) {
    clearTimeout(powerUpTimeout);
    powerUpActive = false;
    if (powerUpType === "speed") {
      gameSpeed *= 2; // Restaura a velocidade do jogo se estiver sob efeito de speed
    }
  }

  // Gerar um novo power-up
  generatePowerUp();
}

// Limpa o canvas
function clearCanvas() {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Desenha a cobra, a maçã, o power-up e as informações do jogo
function draw() {
  drawSnake();
  drawApple();
  drawPowerUp();
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
  // Desenha o círculo da maçã
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(apple.x * tileSize + tileSize / 2, apple.y * tileSize + tileSize / 2, tileSize / 2, 0, 2 * Math.PI);
  ctx.fill();

  // Desenha o reflexo no topo da maçã
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.beginPath();
  ctx.ellipse(
    apple.x * tileSize + tileSize / 2,
    apple.y * tileSize + tileSize / 2 - tileSize / 4,
    tileSize / 2.5, tileSize / 6, 0, 0, 2 * Math.PI
  );
  ctx.fill();

  // Desenha o cabo verde
  ctx.strokeStyle = "green";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(apple.x * tileSize + tileSize / 2, apple.y * tileSize + tileSize / 2 - tileSize / 2);
  ctx.lineTo(apple.x * tileSize + tileSize / 2, apple.y * tileSize + tileSize / 2 - tileSize / 2 - tileSize / 4);
  ctx.stroke();

  // Desenha a folha ao lado do cabo
  ctx.strokeStyle = "green"; // Cor da folha
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(apple.x * tileSize + tileSize / 2, apple.y * tileSize + tileSize / 2 - tileSize / 2 - tileSize / 4);
  ctx.lineTo(apple.x * tileSize + tileSize / 2 - tileSize / 6, apple.y * tileSize + tileSize / 2 - tileSize / 2 - tileSize / 4 - tileSize / 4);
  ctx.stroke();
}

// Desenha o power-up
function drawPowerUp() {
  if (powerUp) {
    ctx.fillStyle = powerUpType === "speed" ? "blue" : "green";
    ctx.beginPath();
    ctx.arc(powerUp.x * tileSize + tileSize / 2, powerUp.y * tileSize + tileSize / 2, tileSize / 2, 0, 2 * Math.PI);
    ctx.fill();
  }
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
    gameInterval = setInterval(gameLoop, gameSpeed); // Inicia o loop do jogo
  }

  switch (event.keyCode) {
    case 37: // Setinha para esquerda
      if (direction !== "right" || firstMove) {
        newDirection = "left";
        firstMove = false;
      }
      break;
    case 38: // Setinha para cima
      if (direction !== "down" || firstMove) {
        newDirection = "up";
        firstMove = false;
      }
      break;
    case 39: // Setinha para direita
      if (direction !== "left" || firstMove) {
        newDirection = "right";
        firstMove = false;
      }
      break;
    case 40: // Setinha para baixo
      if (direction !== "up" || firstMove) {
        newDirection = "down";
        firstMove = false;
      }
      break;
  }
}

// Fecha o balão de instruções
function closeInstructionBalloon() {
  if (instructionBalloon) {
    instructionBalloon.remove();
  }
}

// Inicializa o jogo ao carregar a página
window.onload = function () {
  init();
};