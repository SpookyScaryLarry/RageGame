let scene, camera, renderer, ball, ground, obstacles = [];
let jump = false, velocity = 0;

init();
animate();

function init() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);

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

    // Event Listener for Jump
    window.addEventListener('keydown', onKeyDown, false);
}

function animate() {
    requestAnimationFrame(animate);

    // Ball physics
    if (jump) {
        velocity -= 0.05;
        ball.position.y += velocity;
        if (ball.position.y <= 1) {
            ball.position.y = 1;
            jump = false;
            velocity = 0;
        }
    }

    renderer.render(scene, camera);
}

function onKeyDown(event) {
    if (event.code === 'Space' && !jump) {
        jump = true;
        velocity = 0.5;
    }
}
