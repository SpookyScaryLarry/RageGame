let scene, camera, renderer, ball, ground, obstacles = [];
let jump = false, velocity = 0;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let prevTime = performance.now();
let velocityVec = new THREE.Vector3();
let direction = new THREE.Vector3();

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

    if (moveForward || moveBackward) velocityVec.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocityVec.x -= direction.x * 400.0 * delta;

    ball.position.x += velocityVec.x * delta;
    ball.position.z += velocityVec.z * delta;

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

    camera.position.x = ball.position.x + 10 * Math.sin(camera.rotation.y);
    camera.position.z = ball.position.z + 10 * Math.cos(camera.rotation.y);
    camera.position.y = ball.position.y + 5;
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
            moveLeft = true;
            break;
        case 'KeyS':
            moveBackward = true;
            break;
        case 'KeyD':
            moveRight = true;
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
    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    camera.rotation.y -= movementX * 0.002;
}
