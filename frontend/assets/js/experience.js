const canvases = [...document.querySelectorAll('canvas[data-neural-scene]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || document.body.classList.contains('reduce-motion');

if (canvases.length && !reducedMotion && 'WebGLRenderingContext' in window) {
    let threeModule;
    const loadThree = () => {
        if (!threeModule) {
            threeModule = import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
        }
        return threeModule;
    };

    const createScene = async canvas => {
        try {
            const THREE = await loadThree();
            if (!canvas.isConnected) return;

            const renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: true,
                powerPreference: 'low-power'
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30);
            camera.position.z = 5.2;

            const group = new THREE.Group();
            scene.add(group);
            scene.add(new THREE.AmbientLight(0x9ca9ff, 1.1));

            const violetLight = new THREE.PointLight(0x8061ff, 18, 12);
            violetLight.position.set(-2.2, 1.8, 3);
            scene.add(violetLight);
            const cyanLight = new THREE.PointLight(0x00d4ff, 12, 12);
            cyanLight.position.set(2.4, -1.5, 2.5);
            scene.add(cyanLight);

            const core = new THREE.Mesh(
                new THREE.IcosahedronGeometry(0.82, 2),
                new THREE.MeshStandardMaterial({
                    color: 0x271b60,
                    emissive: 0x352078,
                    emissiveIntensity: 1.1,
                    metalness: 0.45,
                    roughness: 0.28
                })
            );
            group.add(core);

            const wireframe = new THREE.Mesh(
                new THREE.IcosahedronGeometry(0.86, 1),
                new THREE.MeshBasicMaterial({
                    color: 0x9a82ff,
                    wireframe: true,
                    transparent: true,
                    opacity: 0.68
                })
            );
            group.add(wireframe);

            const ringA = new THREE.Mesh(
                new THREE.TorusGeometry(1.2, 0.008, 6, 100),
                new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.7 })
            );
            ringA.rotation.set(0.8, 0.3, 0.25);
            group.add(ringA);

            const ringB = new THREE.Mesh(
                new THREE.TorusGeometry(1.48, 0.006, 6, 100),
                new THREE.MeshBasicMaterial({ color: 0x7c5cff, transparent: true, opacity: 0.48 })
            );
            ringB.rotation.set(1.15, 0.15, -0.5);
            group.add(ringB);

            const points = [];
            const count = 42;
            for (let index = 0; index < count; index += 1) {
                const y = 1 - (index / (count - 1)) * 2;
                const radius = Math.sqrt(1 - y * y);
                const angle = Math.PI * (3 - Math.sqrt(5)) * index;
                points.push(new THREE.Vector3(
                    Math.cos(angle) * radius * 1.56,
                    y * 1.56,
                    Math.sin(angle) * radius * 1.56
                ));
            }

            const lineVertices = [];
            for (let first = 0; first < points.length; first += 1) {
                for (let second = first + 1; second < points.length; second += 1) {
                    if (points[first].distanceToSquared(points[second]) < 0.68) {
                        lineVertices.push(
                            points[first].x, points[first].y, points[first].z,
                            points[second].x, points[second].y, points[second].z
                        );
                    }
                }
            }
            const networkGeometry = new THREE.BufferGeometry();
            networkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
            const network = new THREE.LineSegments(
                networkGeometry,
                new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.36 })
            );
            group.add(network);

            const nodeGeometry = new THREE.BufferGeometry();
            nodeGeometry.setFromPoints(points);
            const nodes = new THREE.Points(
                nodeGeometry,
                new THREE.PointsMaterial({
                    color: 0x9beaff,
                    size: 0.045,
                    sizeAttenuation: true,
                    transparent: true,
                    opacity: 0.9
                })
            );
            group.add(nodes);

            let frame = 0;
            let inView = false;
            let pointerX = 0;
            let pointerY = 0;
            let disposed = false;
            const resize = () => {
                const bounds = canvas.getBoundingClientRect();
                if (!bounds.width || !bounds.height) return;
                renderer.setSize(bounds.width, bounds.height, false);
                camera.aspect = bounds.width / bounds.height;
                camera.updateProjectionMatrix();
            };
            const draw = time => {
                if (disposed || !inView || document.hidden) return;
                group.rotation.y += (pointerX * 0.16 - group.rotation.y) * 0.025;
                group.rotation.x += (pointerY * 0.12 - group.rotation.x) * 0.025;
                core.rotation.y = time * 0.00018;
                wireframe.rotation.y = -time * 0.00012;
                ringA.rotation.z += 0.0012;
                ringB.rotation.y += 0.0007;
                renderer.render(scene, camera);
                frame = window.requestAnimationFrame(draw);
            };
            const start = () => {
                if (frame || !inView || document.hidden || disposed) return;
                resize();
                frame = window.requestAnimationFrame(draw);
            };
            const stop = () => {
                if (frame) window.cancelAnimationFrame(frame);
                frame = 0;
            };
            const intersectionObserver = new IntersectionObserver(entries => {
                inView = entries[0].isIntersecting;
                if (inView) start();
                else stop();
            }, { rootMargin: '120px' });
            intersectionObserver.observe(canvas);
            const resizeObserver = new ResizeObserver(resize);
            resizeObserver.observe(canvas);
            const onPointerMove = event => {
                const bounds = canvas.getBoundingClientRect();
                pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
                pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
            };
            const onVisibilityChange = () => document.hidden ? stop() : start();
            const onContextLost = event => {
                event.preventDefault();
                stop();
            };
            const onContextRestored = () => start();
            canvas.addEventListener('pointermove', onPointerMove, { passive: true });
            canvas.addEventListener('webglcontextlost', onContextLost);
            canvas.addEventListener('webglcontextrestored', onContextRestored);
            document.addEventListener('visibilitychange', onVisibilityChange);
            resize();

            const dispose = () => {
                disposed = true;
                stop();
                intersectionObserver.disconnect();
                resizeObserver.disconnect();
                canvas.removeEventListener('pointermove', onPointerMove);
                canvas.removeEventListener('webglcontextlost', onContextLost);
                canvas.removeEventListener('webglcontextrestored', onContextRestored);
                document.removeEventListener('visibilitychange', onVisibilityChange);
                scene.traverse(object => {
                    object.geometry?.dispose();
                    if (Array.isArray(object.material)) object.material.forEach(material => material.dispose());
                    else object.material?.dispose();
                });
                renderer.dispose();
            };
            window.addEventListener('pagehide', dispose, { once: true });
        } catch (error) {
            console.warn('3D study visual unavailable; using the lightweight CSS fallback.', error);
            canvas.hidden = true;
        }
    };

    const sceneObserver = new IntersectionObserver(entries => {
        entries.filter(entry => entry.isIntersecting).forEach(entry => {
            sceneObserver.unobserve(entry.target);
            createScene(entry.target);
        });
    }, { rootMargin: '160px' });

    canvases.forEach(canvas => sceneObserver.observe(canvas));
}
