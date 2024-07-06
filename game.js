const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = 800;
const HEIGHT = 600;
const gravity = 9.8;
const catWidth = 50;
const catHeight = 50;
const bananaRadius = 5;

let buildings = [];
let player1, player2;
let currentPlayer = 1;
let banana = null;

const background = new Image();
background.src = 'background.png';

const catImage = new Image();
catImage.src = 'cat.png';

class Building {
    constructor(x, width, height) {
        this.x = x;
        this.width = width;
        this.height = height;
    }

    draw() {
        ctx.fillStyle = 'gray';
        ctx.fillRect(this.x, HEIGHT - this.height, this.width, this.height);
        for (let i = 0; i < this.width; i += 20) {
            for (let j = 0; j < this.height; j += 20) {
                ctx.fillStyle = 'white';
                ctx.fillRect(this.x + i + 5, HEIGHT - this.height + j + 5, 10, 10);
            }
        }
    }
}

class Cat {
    constructor(x, y, flip = false) {
        this.x = x;
        this.y = y;
        this.flip = flip;
    }

    draw() {
        ctx.save();
        if (this.flip) {
            ctx.scale(-1, 1);
            ctx.drawImage(catImage, -this.x - catWidth, this.y, catWidth, catHeight);
        } else {
            ctx.drawImage(catImage, this.x, this.y, catWidth, catHeight);
        }
        ctx.restore();
    }
}

class Banana {
    constructor(x, y, angle, velocity) {
        this.x = x;
        this.y = y;
        this.angle = angle * Math.PI / 180;
        this.velocity = velocity;
        this.time = 0;
        this.trajectory = [];
    }

    update() {
        this.x += this.velocity * Math.cos(this.angle) * 0.1;
        this.y -= (this.velocity * Math.sin(this.angle) - 0.5 * gravity * this.time) * 0.1;
        this.time += 0.1;
        this.trajectory.push({ x: this.x, y: this.y });
    }

    draw() {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(this.x, this.y, bananaRadius, 0, Math.PI * 2);
        ctx.fill();

        if (this.trajectory.length > 1) {
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(this.trajectory[0].x, this.trajectory[0].y);
            for (let point of this.trajectory) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
        }
    }
}

function generateBuildings() {
    let x = 0;
    while (x < WIDTH) {
        const width = Math.random() * 60 + 60;
        const height = Math.random() * 300 + 100;
        buildings.push(new Building(x, width, height));
        x += width + Math.random() * 40 + 40;
    }
}

function init() {
    generateBuildings();
    player1 = new Cat(buildings[0].x + buildings[0].width / 2 - catWidth / 2, 
                      HEIGHT - buildings[0].height - catHeight);
    player2 = new Cat(buildings[buildings.length - 1].x + buildings[buildings.length - 1].width / 2 - catWidth / 2, 
                      HEIGHT - buildings[buildings.length - 1].height - catHeight, true);
}

function draw() {
    ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);

    for (let building of buildings) {
        building.draw();
    }

    player1.draw();
    player2.draw();

    if (banana) {
        banana.draw();
    }

    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Player ${currentPlayer}`, 10, 30);
}

function update() {
    if (banana) {
        banana.update();

        for (let building of buildings) {
            if (banana.x > building.x && banana.x < building.x + building.width &&
                banana.y > HEIGHT - building.height && banana.y < HEIGHT) {
                banana = null;
                currentPlayer = 3 - currentPlayer;
                break;
            }
        }

        if (banana && (banana.y > HEIGHT || banana.x < 0 || banana.x > WIDTH)) {
            banana = null;
            currentPlayer = 3 - currentPlayer;
        } else if (banana && 
            ((currentPlayer === 1 && 
              banana.x > player2.x && banana.x < player2.x + catWidth &&
              banana.y > player2.y && banana.y < player2.y + catHeight) ||
             (currentPlayer === 2 && 
              banana.x > player1.x && banana.x < player1.x + catWidth &&
              banana.y > player1.y && banana.y < player1.y + catHeight))) {
            alert(`Player ${currentPlayer} wins!`);
            init();
        }
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.getElementById('shootButton').addEventListener('click', () => {
    if (banana) return;

    const angle = parseFloat(document.getElementById('angleInput').value);
    const velocity = parseFloat(document.getElementById('velocityInput').value);

    if (isNaN(angle) || isNaN(velocity)) {
        alert('Please enter valid numbers for angle and velocity.');
        return;
    }

    if (currentPlayer === 1) {
        banana = new Banana(player1.x + catWidth, player1.y, angle, velocity);
    } else {
        banana = new Banana(player2.x, player2.y, 180 - angle, velocity);
    }
});

init();
gameLoop();