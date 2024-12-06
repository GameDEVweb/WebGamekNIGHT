const homeScreen = document.getElementById('home');
const gameScreen = document.getElementById('game');
const resultScreen = document.getElementById('result');
const playButton = document.getElementById('playButton');
const backButton = document.getElementById('backButton');
const restartButton = document.getElementById('restartButton');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timerElement = document.getElementById('timer');
const resultText = document.getElementById('resultText');

let player = { x: 250, y: 250, size: 80, speed: 5, sprite: new Image() }; // Tamanho do jogador aumentado
let enemy = { x: 100, y: 100, size: 80, speed: 1.5, sprite: new Image(), moving: false }; // Tamanho do inimigo aumentado e status de movimento
let keys = {};
let timeLeft = 10;
let phase = 1;
let timerInterval;
let gameLoopInterval;

// Diálogos por fase
const phaseDialogues = [
    "Corra... enquanto pode.",
    "Ele está chegando mais perto...",
    "Você não pode escapar desta vez..."
];

// Carregar sprites
player.sprite.src = 'p.png';  // Certifique-se de usar a imagem desejada para o player
enemy.sprite.src = 'm.png';   // Certifique-se de usar a imagem desejada para o inimigo

// Eventos de controle de tela
playButton.addEventListener('click', startGame);
backButton.addEventListener('click', goHome);
restartButton.addEventListener('click', restartGame);

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Funções principais
function startGame() {
    phase = 1; // Sempre reinicia o jogo na fase 1
    resetGame();
    homeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    startPhase();
}

function goHome() {
    clearInterval(timerInterval);
    clearInterval(gameLoopInterval);
    homeScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
}

function restartGame() {
    resultScreen.classList.add('hidden');
    startGame();
}

// Funções do jogo
function resetGame() {
    player.x = 250;
    player.y = 250;
    enemy.x = Math.random() * (canvas.width - enemy.size);
    enemy.y = Math.random() * (canvas.height - enemy.size);
    enemy.speed = 1.5 + (phase - 1) * 0.5;
    enemy.moving = false;
    timeLeft = 10;
}

function startPhase() {
    resetGame();
    showPhaseDialogue(phase, () => {
        startCountdown(() => {
            // Após o countdown, inicia o cronômetro e o loop de jogo
            startTimer();
            startGameLoop();
        });
    });
}

function showPhaseDialogue(phase, callback) {
    const dialogue = document.createElement('div');
    dialogue.textContent = phaseDialogues[phase - 1];
    dialogue.style.position = 'absolute';
    dialogue.style.top = '50%';
    dialogue.style.left = '50%';
    dialogue.style.transform = 'translate(-50%, -50%)';
    dialogue.style.fontSize = '24px';
    dialogue.style.color = 'white';
    dialogue.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    dialogue.style.padding = '20px';
    dialogue.style.borderRadius = '10px';
    dialogue.style.textAlign = 'center';
    document.body.appendChild(dialogue);

    setTimeout(() => {
        document.body.removeChild(dialogue);
        callback();
    }, 1000); // Diálogo aparece por 1 segundo antes do countdown
}

function startCountdown(callback) {
    let countdown = 3;
    const countdownDisplay = document.createElement('div');
    countdownDisplay.style.position = 'absolute';
    countdownDisplay.style.top = '50%';
    countdownDisplay.style.left = '50%';
    countdownDisplay.style.transform = 'translate(-50%, -50%)';
    countdownDisplay.style.fontSize = '48px';
    countdownDisplay.style.color = 'white';
    document.body.appendChild(countdownDisplay);

    // Impedir o inimigo de se mover durante o countdown
    enemy.moving = false;

    const interval = setInterval(() => {
        countdownDisplay.textContent = countdown > 0 ? countdown : "Vá!";
        countdown--;

        if (countdown < 0) {
            clearInterval(interval);
            document.body.removeChild(countdownDisplay);
            enemy.moving = true; // Ativar o inimigo após o countdown
            callback(); // Callback para continuar o jogo
        }
    }, 1000);
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Tempo: ${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            nextPhase();
        }
    }, 1000);
}

function nextPhase() {
    if (phase < 3) {
        phase++;
        startPhase();
    } else {
        endGame(true);
    }
}

function startGameLoop() {
    gameLoopInterval = setInterval(() => {
        updateGame();
        drawGame();
    }, 1000 / 60);
}

function updateGame() {
    // Movimenta o jogador
    if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y < canvas.height - player.size) player.y += player.speed;
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.size) player.x += player.speed;

    // Movimenta o inimigo somente se estiver ativo
    if (enemy.moving) {
        if (enemy.x < player.x) enemy.x += enemy.speed;
        else if (enemy.x > player.x) enemy.x -= enemy.speed;

        if (enemy.y < player.y) enemy.y += enemy.speed;
        else if (enemy.y > player.y) enemy.y -= enemy.speed;
    }

    // Checa colisão
    if (
        player.x < enemy.x + enemy.size &&
        player.x + player.size > enemy.x &&
        player.y < enemy.y + enemy.size &&
        player.y + player.size > enemy.y
    ) {
        endGame(false);
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha o jogador
    ctx.drawImage(player.sprite, player.x, player.y, player.size, player.size);

    // Desenha o inimigo
    ctx.drawImage(enemy.sprite, enemy.x, enemy.y, enemy.size, enemy.size);
}

function endGame(win) {
    clearInterval(timerInterval);
    clearInterval(gameLoopInterval);
    gameScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    resultText.textContent = win ? 'Você venceu!' : 'Você perdeu!';

    // Se o jogador perder, o jogo reinicia após 2 segundos
    if (!win) {
        setTimeout(() => {
            restartGame(); // Reinicia o jogo
        }, 2000); // Espera 2 segundos antes de reiniciar
    }
}
