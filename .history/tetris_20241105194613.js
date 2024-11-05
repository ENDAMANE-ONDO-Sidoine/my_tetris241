// Récupérer le bouton de démarrage/pause du jeu
const startPauseButton = document.getElementById('start_pause');

// Variables de contrôle du jeu
let gameRunning = false;
let currentLevel = 1;
let message = ""; // Variable pour stocker le message à afficher

// Écouter les clics sur le bouton de démarrage/pause
startPauseButton.addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        update(); // Démarrer le jeu
    } else {
        gameRunning = false;
        // Mettre en pause le jeu (arrêter les mises à jour)
    }
});

// Récupérer le bouton de redémarrage du jeu
const restartButton = document.getElementById('restartButton');
restartButton.addEventListener('click', () => {
    resetGame();
    gameRunning = true;
    update();
});

// Récupérer le canvas et le contexte
const canvas = document.getElementById("tetris");
const ctx = canvas.getContext('2d');

// Échelle pour dessiner les blocs
const scale = 20;
ctx.scale(scale, scale);

// Dimensions du terrain de jeu en termes de blocs
const tWidth = canvas.width / scale;
const tHeight = canvas.height / scale;

// Définition des différentes pièces Tetris
const pieces = [
    [[1, 1], [1, 1]],
    [[0, 2, 0, 0], [0, 2, 0, 0], [0, 2, 0, 0], [0, 2, 0, 0]],
    [[0, 0, 0], [3, 3, 0], [0, 3, 3]],
    [[0, 0, 0], [0, 4, 4], [4, 4, 0]],
    [[5, 0, 0], [5, 0, 0], [5, 5, 0]],
    [[0, 0, 6], [0, 0, 6], [0, 6, 6]],
    [[0, 0, 0], [7, 7, 7], [0, 7, 0]]
];

// Couleurs correspondantes aux pièces
let colors = [null, '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'];

// Matrice représentant le terrain de jeu
let arena = [];

// Variable aléatoire pour sélectionner une pièce Tetris
let rand;

// Objet représentant le joueur
const player = {
    pos: {x: 0, y: 1},
    matrix: null,
    color: null,
    score: 0  
};

// Afficher un message sur le canvas
function displayMessage(text) {
    ctx.fillStyle = "#ff0000";
    ctx.font = "2px Arial";
    ctx.textAlign = "center";
    ctx.fillText(text, tWidth / 2, tHeight / 2);
}

// Fonction pour gérer la fin du jeu
function gameOver() {
    for (let j = 1; j < arena[1].length - 1; j++) {
        if (arena[1][j]) {
            message = "Game Over!";
            gameRunning = false;
            setTimeout(() => {
                resetGame();
                message = "";
            }, 2000);
            return;
        }
    }

    if (player.score >= 50) {
        message = "Level Up!";
        currentLevel++;
        player.score -= 50;
        interval = calculateInterval(currentLevel);
        setTimeout(() => {
            message = "";
        }, 1000);
    }
}

// Intervalle de mise à jour du jeu en millisecondes
let interval = 1000;
let lastTime = 0;
let count = 0;

// Fonction principale de mise à jour du jeu
function update(time = 0) {
    if (!gameRunning) {
        requestAnimationFrame(update);
        return;
    }

    const dt = time - lastTime;
    lastTime = time;
    count += dt;

    const currentInterval = calculateInterval(currentLevel);

    if (count >= currentInterval) {
        if (!collides(player, arena)) {
            player.pos.y++;
            count = 0;
        } else {
            mergeArena(player.matrix, player.pos.x, player.pos.y - 1);
            clearBlocks();
            gameOver();
            resetPlayer();
        }
        interval = currentInterval;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawArena();
    drawPlayer();

    if (message) {
        displayMessage(message); // Afficher le message si présent
    }

    updateStats();
    requestAnimationFrame(update);
}

// Réinitialiser le jeu
function resetGame() {
    initArena();
    player.score = 0;
    currentLevel = 1;
    gameRunning = true;
    count = 0; // Réinitialiser le temps à zéro
    message = "";
    announceTetrimino();
}

// Initialiser le terrain de jeu au début
initArena();
// Démarrer le jeu
update();
