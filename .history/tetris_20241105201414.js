// Récupérer le bouton de démarrage/pause du jeu
const startPauseButton = document.getElementById('start_pause');

// Variables de contrôle du jeu
let gameRunning = false;
let currentLevel = 1;

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
    [
        [1, 1],
        [1, 1]
    ],
    [
        [0, 2, 0, 0],
        [0, 2, 0, 0],
        [0, 2, 0, 0],
        [0, 2, 0, 0]
    ],
    [
        [0, 0, 0],
        [3, 3, 0],
        [0, 3, 3]
    ],
    [
        [0, 0, 0],
        [0, 4, 4],
        [4, 4, 0]
    ],
    [
        [5, 0, 0],
        [5, 0, 0],
        [5, 5, 0]
    ],
    [
        [0, 0, 6],
        [0, 0, 6],
        [0, 6, 6]
    ],
    [
        [0, 0, 0],
        [7, 7, 7],
        [0, 7, 0]
    ]
];

// Couleurs correspondantes aux pièces
let colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

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

// Sélectionner une pièce Tetris aléatoire au début du jeu
rand = Math.floor(Math.random() * pieces.length);
player.matrix = pieces[rand];
player.color = colors[rand === 0 ? 0 : rand + 1];

// Fonction pour dessiner une matrice sur le canvas
function drawMatrix(matrix, x, y) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j]) {
                ctx.fillStyle = player.color;
                ctx.fillRect(x + j, y + i, 1, 1);
            }
        }
    }
}

// Fonction pour faire tourner une matrice
function rotateMatrix(matrix, dir) {
    let newMatrix = [];

    for (let i in matrix)
        newMatrix.push([]);

    if (dir === 1) {
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                newMatrix[j][matrix.length - i - 1] = matrix[i][j];
            }
        }
    } else {
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                newMatrix[matrix.length - j - 1][i] = matrix[i][j];
            }
        }
    }

    return newMatrix;
}

// Fonction pour vérifier les collisions entre le joueur et le terrain
function collides(player, arena) {
    for (let i = 0; i < player.matrix.length; i++) {
        for (let j = 0; j < player.matrix[i].length; j++) {
            if (player.matrix[i][j] && arena[player.pos.y + i + 1][player.pos.x + j + 1])
                return 1;
        }
    }

    return 0;
}

// Fonction pour fusionner la pièce du joueur avec le terrain de jeu
function mergeArena(matrix, x, y) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            arena[y+i+1][x+j+1] = arena[y+i+1][x+j+1] || matrix[i][j];
        }
    }
}

// Fonction pour effacer les lignes complètes du terrain de jeu
function clearBlocks() {
    for (let i = 1; i < arena.length - 2; i++) {
        let clear = 1;

        for (let j = 1; j < arena[i].length - 1; j++) {
            if (!arena[i][j]) {
                clear = 0;
                break;
            }
        }

        if (clear) {
            player.score += 10; // Incrémenter le score lorsque la ligne est effacée
            let r = new Array(tWidth).fill(0);
            r.push(1);
            r.unshift(1);

            arena.splice(i, 1);
            arena.splice(1, 0, r);
        }
    }
}

// Fonction pour dessiner le terrain de jeu
function drawArena() {
    for (let i = 1; i < arena.length-2; i++) {
        for (let j = 1; j < arena[i].length-1; j++) {
            if (arena[i][j]) {
                ctx.fillStyle = colors[arena[i][j]];
                ctx.fillRect(j-1, i-1, 1, 1);
            }
        }
    }
}

// Initialiser le terrain de jeu
function initArena() {
    arena = [];

    const r = new Array(tWidth + 2).fill(1);
    arena.push(r);

    for (let i = 0; i < tHeight; i++) {
        let row = new Array(tWidth).fill(0);
        row.push(1);
        row.unshift(1);

        arena.push(row);
    }

    arena.push(r);
    arena.push(r);
}

// Annoncer la prochaine pièce Tetris à venir
function announceTetrimino() {
    const tetriminoNames = ['Square', 'Line', 'T', 'L', 'Mirrored L', 'S', 'Mirrored S'];
    const nextTetriminoCanvas = document.getElementById('nextTetrimino');
    const nextTetriminoText = document.getElementById('nextTetriminoText');
    
    // Calculer la taille des blocs réduits
    const blockSize = nextTetriminoCanvas.width / 16;

    // Effacer le contenu précédent du canvas
    const nextCtx = nextTetriminoCanvas.getContext('2d');
    nextCtx.clearRect(0, 0, nextTetriminoCanvas.width, nextTetriminoCanvas.height);

    // Dessiner le prochain tétrimino sur le canvas avec une taille réduite
    const nextTetrimino = pieces[rand];
    for (let i = 0; i < nextTetrimino.length; i++) {
        for (let j = 0; j < nextTetrimino[i].length; j++) {
            if (nextTetrimino[i][j]) {
                nextCtx.fillStyle = colors[rand + 1];
                // Ajuster les coordonnées selon la taille réduite
                nextCtx.fillRect(j * blockSize, i * blockSize, blockSize, blockSize);
            }
        }
    }

    // Afficher le texte du prochain tétrimino
    nextTetriminoText.innerText = `Next Tetrimino: ${tetriminoNames[rand]}`;
}

// Réinitialiser le jeu
function resetGame() {
    initArena();
    player.score = 0;
    currentLevel = 1;
    gameRunning = true;
    count = 0; // Réinitialiser le temps à zéro
    announceTetrimino();
}

// Gérer la fin du jeu
function gameOver() {
    for (let j = 1; j < arena[1].length - 1; j++) {
        if (arena[1][j]) {
            alert("Game over! Start the game again.");
            gameRunning = false;
            displayGameOver();
            setTimeout(() => {
                resetGame();
            }, 2000);
            return;
        }
    }

    if (player.score >= 50) {
        alert("Congratulations, you're moving to the next level!");
        currentLevel++;
        player.score -= 50;
        interval = calculateInterval(currentLevel);
    }
}

// Afficher le message de fin de jeu
function displayGameOver() {
    ctx.fillStyle = "#ff0000";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2);
}

// Intervalle de mise à jour du jeu en millisecondes
let interval = 1000;
let lastTime = 0;
let count = 0;

// Fonction pour mettre à jour les statistiques affichées
function updateStats() {
    document.getElementById('displayNiveau').innerText = currentLevel;
    document.getElementById('displayScore').innerText = player.score;
    document.getElementById('displayTemps').innerText = Math.floor(count / 1000);
}

// Calculer l'intervalle en fonction du niveau actuel
function calculateInterval(level) {
    return 1000 - (level - 1) * 100; 
}

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

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawArena();
    drawPlayer();

    updateStats();

    requestAnimationFrame(update);
}


// Réinitialiser la position du joueur
function resetPlayer() {
    player.pos.y = 1;
    player.pos.x = 0;

    rand = Math.floor(Math.random() * pieces.length);
    player.matrix = pieces[rand];
    player.color = colors[rand + 1];

    interval = 1000;

    // Annoncer le prochain tétrimino
    announceTetrimino();

    count = 0; // Réinitialiser le compteur à zéro
}

// Fonction pour dessiner le joueur sur le canvas
function drawPlayer() {
    ctx.fillStyle = player.color;
    drawMatrix(player.matrix, player.pos.x, player.pos.y);
}

// Écouter les événements de touche du clavier
document.addEventListener("keydown", event => {
    if (gameRunning) {
        switch (event.key) {
            case "ArrowLeft": // Touche gauche
                movePlayer(-1);
                break;
            case "ArrowRight": // Touche droite
                movePlayer(1);
                break;
            case "ArrowDown": // Touche bas
                movePlayerDown();
                break;
            case "ArrowUp": // Touche haut (rotation)
                rotatePlayer();
                break;
            case " ": // Barre d'espace (accélérer la descente)
                interval = 1;
                break;
        }
    }
});

// Fonction pour déplacer le joueur horizontalement
function movePlayer(direction) {
    player.pos.x += direction;
    if (collides(player, arena)) {
        player.pos.x -= direction;
    }
}

// Fonction pour déplacer le joueur vers le bas
function movePlayerDown() {
    player.pos.y++;
    count = 0;
    if (collides(player, arena)) {
        player.pos.y--;
        mergeArena(player.matrix, player.pos.x, player.pos.y - 1);
        clearBlocks();
        gameOver();
        resetPlayer();
    }
}

// Fonction pour faire pivoter le joueur
function rotatePlayer() {
    player.matrix = rotateMatrix(player.matrix, 1);
    if (collides(player, arena)) {
        player.matrix = rotateMatrix(player.matrix, -1);
    }
}

// Initialiser le terrain de jeu au début
initArena();
// Démarrer le jeu
update();

