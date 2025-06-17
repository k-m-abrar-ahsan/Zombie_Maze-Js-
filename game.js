let scene, camera, renderer;
let player, maze, exit;
let playerPosition = new THREE.Vector3(0, 0, 0);
let playerRotation = 0;
let playerSpeed = 0.1;
let keys = { up: false, down: false, left: false, right: false };
let enemies = [];
let score = 0;
let lives = 5;
let cellSize = 1;
let gridSize = 10;
let mazeData = [];

init();

function init() {
    // Create scene
    scene = new THREE.Scene();
    
    // Set up camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);  // Position the camera above the scene
    camera.lookAt(new THREE.Vector3(0, 0, 0));  // Point camera to the center
    
    // Set up renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Set up lighting
    let ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
    scene.add(ambientLight);

    let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5).normalize(); // Direction of light
    scene.add(directionalLight);
    
    // Set up player
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    player = new THREE.Mesh(geometry, material);
    player.position.set(0, 0.5, 0);  // Position player in the scene
    scene.add(player);
    
    // Set up maze and player position
    generateMaze();
    setPlayerAtEntry();
    
    // Spawn enemies
    spawnEnemies(5);
    
    // Start the game loop
    animate();
}

// Generate maze (this is just an example of random maze generation)
function generateMaze() {
    mazeData = [];
    for (let i = 0; i < gridSize; i++) {
        mazeData.push([]);
        for (let j = 0; j < gridSize; j++) {
            mazeData[i].push(Math.random() < 0.3 ? 1 : 0); // 1 = wall, 0 = path
        }
    }
    mazeData[0][0] = 0; // Entrance
    mazeData[gridSize - 1][gridSize - 1] = 0; // Exit
    createMazeObjects();
}

function createMazeObjects() {
    maze = new THREE.Group();
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (mazeData[i][j] === 1) {
                let wallGeometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize);
                let wallMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
                let wall = new THREE.Mesh(wallGeometry, wallMaterial);
                wall.position.set(i - gridSize / 2, 0, j - gridSize / 2);
                maze.add(wall);
            }
        }
    }
    scene.add(maze);
}

function setPlayerAtEntry() {
    playerPosition.set(-gridSize / 2 + 0.5, 0, -gridSize / 2 + 0.5);
    player.position.copy(playerPosition);
}

// Spawn enemies
class Enemy {
    constructor(x, z) {
        this.position = new THREE.Vector3(x, 0, z);
        this.speed = 0.05;
        this.mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshBasicMaterial({ color: 0xFF0000 }));
        this.mesh.position.set(x, 0, z);
        scene.add(this.mesh);
    }
    
    move() {
        this.position.x += (Math.random() - 0.5) * this.speed;
        this.position.z += (Math.random() - 0.5) * this.speed;
        this.mesh.position.set(this.position.x, 0, this.position.z);
    }
}

function spawnEnemies(numEnemies) {
    for (let i = 0; i < numEnemies; i++) {
        let x = Math.floor(Math.random() * gridSize) - gridSize / 2;
        let z = Math.floor(Math.random() * gridSize) - gridSize / 2;
        enemies.push(new Enemy(x, z));
    }
}

// Handle keyboard input
window.addEventListener("keydown", (event) => {
    if (event.key === "w") keys.up = true;
    if (event.key === "s") keys.down = true;
    if (event.key === "a") keys.left = true;
    if (event.key === "d") keys.right = true;
});

window.addEventListener("keyup", (event) => {
    if (event.key === "w") keys.up = false;
    if (event.key === "s") keys.down = false;
    if (event.key === "a") keys.left = false;
    if (event.key === "d") keys.right = false;
});

function updatePlayerMovement() {
    let newX = playerPosition.x;
    let newZ = playerPosition.z;

    if (keys.up) {
        newX += Math.cos(playerRotation) * playerSpeed;
        newZ += Math.sin(playerRotation) * playerSpeed;
    }
    if (keys.down) {
        newX -= Math.cos(playerRotation) * playerSpeed;
        newZ -= Math.sin(playerRotation) * playerSpeed;
    }
    if (keys.left) {
        playerRotation -= 0.05;
    }
    if (keys.right) {
        playerRotation += 0.05;
    }

    // Check collision with walls
    if (!checkCollision(newX, newZ)) {
        playerPosition.x = newX;
        playerPosition.z = newZ;
    }

    player.rotation.y = playerRotation;
}

function checkCollision(newX, newZ) {
    for (let i = 0; i < maze.children.length; i++) {
        let wall = maze.children[i];
        let dist = Math.sqrt(Math.pow(wall.position.x - newX, 2) + Math.pow(wall.position.z - newZ, 2));
        if (dist < 0.5) { // Collision threshold
            return true;
        }
    }
    return false;
}

function animate() {
    requestAnimationFrame(animate);
    
    updatePlayerMovement();
    enemies.forEach(enemy => enemy.move());
    
    renderer.render(scene, camera);
}
