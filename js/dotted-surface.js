document.addEventListener('DOMContentLoaded', () => {
    // Determine target container. Attach to the hero section.
    const hero = document.getElementById('hero');
    if (!hero) return; // Only run if we have a hero section

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '1';
    container.style.pointerEvents = 'none';
    
    // Insert behind everything else in the hero (which has z-index 10)
    hero.insertBefore(container, hero.firstChild);

    const SEPARATION = 150;
    const AMOUNTX = 40;
    const AMOUNTY = 60;

    // Read theme colors dynamically
    const style = getComputedStyle(document.documentElement);
    const getThemeColor = (varName, fallback) => {
        const val = style.getPropertyValue(varName).trim();
        return val ? new THREE.Color(val) : new THREE.Color(fallback);
    };

    let bgVoidColor = getThemeColor('--bg-void', '#060606');
    let accentColor = getThemeColor('--accent', '#e8dcc8');

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(bgVoidColor, 2000, 10000);

    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        10000
    );
    camera.position.set(0, 355, 1220);

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(scene.fog.color, 0);

    container.appendChild(renderer.domElement);

    const positions = [];
    const colors = [];

    const geometry = new THREE.BufferGeometry();

    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
            const y = 0; // Will be animated
            const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

            positions.push(x, y, z);
            colors.push(accentColor.r, accentColor.g, accentColor.b);
        }
    }

    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // Create material
    const material = new THREE.PointsMaterial({
        size: 8,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
    });

    // Create points object
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;

    // Animation function
    const animate = () => {
        requestAnimationFrame(animate);

        const positionAttribute = geometry.attributes.position;
        const positionsArray = positionAttribute.array;

        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                const index = i * 3;

                // Animate Y position with sine waves
                positionsArray[index + 1] =
                    Math.sin((ix + count) * 0.3) * 50 +
                    Math.sin((iy + count) * 0.5) * 50;

                i++;
            }
        }

        positionAttribute.needsUpdate = true;

        renderer.render(scene, camera);
        count += 0.1;
    };

    // Handle window resize
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Listen to themechange custom event
    window.addEventListener('themechange', () => {
        const newStyle = getComputedStyle(document.documentElement);
        const newBgVoidHex = newStyle.getPropertyValue('--bg-void').trim() || '#060606';
        const newAccentHex = newStyle.getPropertyValue('--accent').trim() || '#e8dcc8';

        const newBgVoid = new THREE.Color(newBgVoidHex);
        const newAccent = new THREE.Color(newAccentHex);

        scene.fog.color.copy(newBgVoid);
        renderer.setClearColor(scene.fog.color, 0);

        const colorAttribute = geometry.attributes.color;
        const colorsArray = colorAttribute.array;
        for (let i = 0; i < colorsArray.length; i += 3) {
            colorsArray[i] = newAccent.r;
            colorsArray[i+1] = newAccent.g;
            colorsArray[i+2] = newAccent.b;
        }
        colorAttribute.needsUpdate = true;
    });

    // Start animation
    animate();
});
