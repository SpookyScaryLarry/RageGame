let scene, camera, renderer, ball, ground, obstacles = [];
let jump = false, velocity = 0;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let prevTime = performance.now();
let velocityVec = new THREE.Vector3();
let direction = new THREE.Vector3();
let ballBox, obstacleBoxes = [];

init();
animate();

function init() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;
    camera.position.y = 5;
    camera.lookAt(0, 1, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);

    // Ball
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    ball = new THREE.Mesh(geometry, material);
    ball.position.y = 1;
    scene.add(ball);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Obstacles
    for (let i = 0; i < 5; i++) {
        const obstacleGeometry = new THREE.BoxGeometry(1, 1, 1);
        const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
        obstacle.position.set(i * 5 - 10, 0.5, 0);
        obstacles.push(obstacle);
        scene.add(obstacle);
    }

    // Bounding Boxes for Collision Detection
    ballBox = new THREE.Box3().setFromObject(ball);
    obstacles.forEach(obstacle => {
        obstacleBoxes.push(new THREE.Box3().setFromObject(obstacle));
    });

    // Event Listeners for Controls
    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);
    document.addEventListener('mousemove', onMouseMove, false);

    // Lock pointer for mouse movement
    document.body.requestPointerLock = document.body.requestPointerLock ||
        document.body.mozRequestPointerLock ||
        document.body.webkitRequestPointerLock;

    document.body.onclick = function() {
        document.body.requestPointerLock();
    };
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    velocityVec.x -= velocityVec.x * 10.0 * delta;
    velocityVec.z -= velocityVec.z * 10.0 * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (moveForward || moveBackward) velocityVec.z -= direction.z * 200.0 * delta; // Reduced speed
    if (moveLeft || moveRight) velocityVec.x += direction.x * 200.0 * delta; // Reduced speed

    ball.position.x += velocityVec.x * delta;
    ball.position.z += velocityVec.z * delta;

    // Update bounding box
    ballBox.setFromObject(ball);

    // Check collisions with obstacles
    for (let i = 0; i < obstacleBoxes.length; i++) {
        if (ballBox.intersectsBox(obstacleBoxes[i])) {
            // Handle collision: simple example is to stop movement
            velocityVec.x = 0;
            velocityVec.z = 0;
        }
    }

    // Ball physics for jumping
    if (jump) {
        velocity -= 0.05;
        ball.position.y += velocity;
        if (ball.position.y <= 1) {
            ball.position.y = 1;
            jump = false;
            velocity = 0;
        }
    }

    // Camera remains in a fixed position
    camera.position.x = 0;
    camera.position.y = 5;
    camera.position.z = 10;
    camera.lookAt(ball.position);

    renderer.render(scene, camera);

    prevTime = time;
}

function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW':
            moveForward = true;
            break;
        case 'KeyA':
            moveRight = true; // Reversed
            break;
        case 'KeyS':
            moveBackward = true;
            break;
        case 'KeyD':
            moveLeft = true; // Reversed
            break;
        case 'Space':
            if (!jump) {
                jump = true;
                velocity = 0.5;
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
            moveRight = false; // Reversed
            break;
        case 'KeyS':
            moveBackward = false;
            break;
        case 'KeyD':
            moveLeft = false; // Reversed
            break;
    }
}

function onMouseMove(event) {
    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    camera.rotation.y -= movementX * 0.002;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
