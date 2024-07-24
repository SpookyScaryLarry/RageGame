let scene, camera, renderer, sphere, ground, obstacles = [];
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let isJumping = false;
let velocity = new THREE.Vector3();
let sphereBox, obstacleBoxes = [];
const speed = 10; // Movement speed of the sphere
const gravity = -9.8; // Gravity effect
const jumpImpulse = 15; // Impulse applied to start the jump

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

    // Create the sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.y = 1;
    scene.add(sphere);

    // Create the ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Create obstacles
    for (let i = 0; i < 10; i++) {
        const obstacleGeometry = new THREE.BoxGeometry(2, 3, 2);
        const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
        obstacle.position.set(Math.random() * 40 - 20, 1.5, Math.random() * 40 - 20);
        obstacles.push(obstacle);
        scene.add(obstacle);
    }

    // Create bounding boxes for collision detection
    sphereBox = new THREE.Box3().setFromObject(sphere);
    obstacles.forEach(obstacle => {
        obstacleBoxes.push(new THREE.Box3().setFromObject(obstacle));
    });

    // Event listeners for controls
    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);
}

function animate() {
    requestAnimationFrame(animate);

    const delta = 0.016; // 60 FPS
    const moveDistance = speed * delta;

    // Handle movement
    if (moveForward) sphere.position.z -= moveDistance;
    if (moveBackward) sphere.position.z += moveDistance;
    if (moveLeft) sphere.position.x -= moveDistance;
    if (moveRight) sphere.position.x += moveDistance;

    // Apply gravity and handle jumping
    if (sphere.position.y > 1) {
        velocity.y += gravity * delta; // Apply gravity when in the air
    } else {
        sphere.position.y = 1;
        velocity.y = 0;
        isJumping = false;
    }
    sphere.position.y += velocity.y * delta;

    // Update sphere bounding box
    sphereBox.setFromObject(sphere);

    // Check collisions with obstacles
    obstacles.forEach((obstacle, index) => {
        const obstacleBox = new THREE.Box3().setFromObject(obstacle);
        if (sphereBox.intersectsBox(obstacleBox)) {
            // Handle collision
            if (moveForward) sphere.position.z += moveDistance;
            if (moveBackward) sphere.position.z -= moveDistance;
            if (moveLeft) sphere.position.x += moveDistance;
            if (moveRight) sphere.position.x -= moveDistance;
        }
    });

    // Update the camera position to follow the sphere
    camera.position.x = sphere.position.x;
    camera.position.z = sphere.position.z + 20; // Fixed distance behind
    camera.position.y = sphere.position.y + 10; // Fixed height
    camera.lookAt(sphere.position);

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
            if (sphere.position.y <= 1 && !isJumping) { // Can only jump if on the ground
                isJumping = true;
                velocity.y = jumpImpulse; // Apply initial jump impulse
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

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
