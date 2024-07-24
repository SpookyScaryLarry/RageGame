let scene, camera, renderer, sphere, ground, obstacles = [];
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let isJumping = false;
let velocity = new THREE.Vector3();
const speed = 10; // Movement speed of the sphere
const gravity = -9.8; // Gravity effect
const jumpImpulse = 15; // Impulse applied to start the jump
const sensitivity = 0.002; // Mouse sensitivity for camera movement

let controlsEnabled = false;

// Physics variables
let world, sphereBody, groundBody, obstacleBodies = [];

init();
animate();

function init() {
    // Create the scene
    scene = new THREE.Scene();

    // Create the camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 10, 0);

    // Create the renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Handle window resizing
    window.addEventListener('resize', onWindowResize, false);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Initialize Cannon.js physics world
    world = new CANNON.World();
    world.gravity.set(0, -9.8, 0);

    // Create the sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.y = 1;
    scene.add(sphere);

    // Create Cannon.js sphere body
    sphereBody = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 1, 0),
        shape: new CANNON.Sphere(1)
    });
    world.addBody(sphereBody);

    // Create the ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Create Cannon.js ground body
    groundBody = new CANNON.Body({
        position: new CANNON.Vec3(0, 0, 0),
        type: CANNON.Body.STATIC
    });
    const groundShape = new CANNON.Plane();
    groundBody.addShape(groundShape);
    world.addBody(groundBody);

    // Create obstacles
    for (let i = 0; i < 10; i++) {
        const obstacleGeometry = new THREE.BoxGeometry(2, 3, 2);
        const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
        obstacle.position.set(Math.random() * 40 - 20, 1.5, Math.random() * 40 - 20);
        obstacles.push(obstacle);
        scene.add(obstacle);

        // Create Cannon.js obstacle body
        const obstacleBody = new CANNON.Body({
            position: new CANNON.Vec3(obstacle.position.x, obstacle.position.y, obstacle.position.z),
            mass: 1
        });
        const obstacleShape = new CANNON.Box(new CANNON.Vec3(1, 1.5, 1));
        obstacleBody.addShape(obstacleShape);
        world.addBody(obstacleBody);
        obstacleBodies.push(obstacleBody);
    }

    // Event listeners for controls
    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);
    document.getElementById('lockButton').addEventListener('click', lockMouse, false);
    document.addEventListener('mousemove', onMouseMove, false);
}

function animate() {
    requestAnimationFrame(animate);

    // Step the physics world
    world.step(1 / 60);

    // Update sphere position
    sphere.position.copy(sphereBody.position);
    sphere.quaternion.copy(sphereBody.quaternion);

    // Update obstacle positions
    obstacles.forEach((obstacle, index) => {
        obstacle.position.copy(obstacleBodies[index].position);
        obstacle.quaternion.copy(obstacleBodies[index].quaternion);
    });

    // Handle movement
    const delta = 0.016; // 60 FPS
    const moveDistance = speed * delta;

    if (moveForward) sphereBody.position.z -= moveDistance;
    if (moveBackward) sphereBody.position.z += moveDistance;
    if (moveLeft) sphereBody.position.x -= moveDistance;
    if (moveRight) sphereBody.position.x += moveDistance;

    // Apply jump impulse
    if (isJumping) {
        sphereBody.velocity.y = jumpImpulse;
        isJumping = false;
    }

    // Update the camera position to follow the sphere
    if (controlsEnabled) {
        camera.position.x = sphere.position.x;
        camera.position.z = sphere.position.z + 20; // Fixed distance behind
        camera.position.y = sphere.position.y + 10; // Fixed height
        camera.lookAt(sphere.position);
    }

    // Render the scene
    renderer.render(scene, camera);
}

function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW':
            moveForward = true;
            break;
        case 'KeyA':
            moveLeft = true;
            break;
        case 'KeyS':
            moveBackward = true;
            break;
        case 'KeyD':
            moveRight = true;
            break;
        case 'Space':
            if (sphereBody.position.y <= 1 && !isJumping) { // Can only jump if on the ground
                isJumping = true;
            }
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW':
            moveForward = false;
            break;
        case 'KeyA':
            moveLeft = false;
            break;
        case 'KeyS':
            moveBackward = false;
            break;
        case 'KeyD':
            moveRight = false;
            break;
    }
}

function onMouseMove(event) {
    if (controlsEnabled) {
        const x = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const y = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        // Update camera rotation based on mouse movement
        camera.rotation.y -= x * sensitivity;
        camera.rotation.x -= y * sensitivity;

        // Clamp camera rotation to prevent flipping
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    }
}

function lockMouse() {
    document.body.requestPointerLock();
}

document.addEventListener('pointerlockchange', () => {
    controlsEnabled = document.pointerLockElement === document.body;
});

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
