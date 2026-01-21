// --- CONFIGURATION ---
const config = {
    greeting: "Hello, Miss",
    letter: "I really like your name!<br>And I made this just for you.",
    chatText: "Happy Birthday! Wishing you a fantastic year ahead! 🎉",
    card1: "It shines brighter than the moon we both love.",
    card2: "Pure, kind, and absolutely beautiful.",
    card3: "My favorite song in the whole world.",
    finalMsg: "You are the best thing that happened to me."
};

// --- INITIALIZE CONTENT ---
document.getElementById('letter-content').innerHTML = config.letter;
document.getElementById('chat-msg').innerText = config.chatText;
document.getElementById('card1').innerText = config.card1;
document.getElementById('card2').innerText = config.card2;
document.getElementById('card3').innerText = config.card3;
document.getElementById('final-sub').innerText = config.finalMsg;

// --- 1. HEART RAIN LOGIC ---
function createRain() {
    const container = document.getElementById('rain-container');
    const drop = document.createElement('div');
    drop.classList.add('drop');
    
    drop.style.left = Math.random() * 100 + "vw";
    drop.style.top = "-50px";
    
    const duration = Math.random() * 3 + 3; 
    drop.style.transition = `top ${duration}s linear, opacity ${duration}s ease-in`;
    
    container.appendChild(drop);
    
    requestAnimationFrame(() => {
        drop.style.top = "110vh"; 
        drop.style.opacity = "0"; 
    });

    setTimeout(() => {
        drop.remove();
    }, duration * 1000);
}
setInterval(createRain, 150);

// --- 2. ENVELOPE INTERACTION ---
const envelope = document.querySelector('.envelope');
const music = document.getElementById('bg-music');

document.getElementById('envelope-trigger').addEventListener('click', () => {
    envelope.classList.toggle('open');
    
    // Play music starting at 40 seconds
    if (music && music.paused) {
        music.currentTime = 40; 
        music.play().catch(error => console.log("Playback failed:", error));
    }
});

// --- 3. PAPER PLANE ANIMATION ---
const sendBtn = document.getElementById('send-btn');
const plane = document.getElementById('paper-plane');
const sentText = document.getElementById('sent-text');

sendBtn.addEventListener('click', () => {
    gsap.to(sendBtn, { scale: 0, duration: 0.2 });
    gsap.set(plane, { visibility: "visible", x: 0, y: 0, scale: 1, opacity: 1 });
    
    const tl = gsap.timeline();
    tl.to(plane, {
        x: 300, y: -300, rotation: -45, opacity: 0, duration: 1.5, ease: "power2.inOut"
    })
    .to(sentText, { opacity: 1, duration: 0.5 }, "-=0.5");
});

// --- 4. SCROLL ANIMATIONS ---
gsap.registerPlugin(ScrollTrigger);

// Typewriter Effect
gsap.utils.toArray('.narrative-text').forEach(textEl => {
    const targetText = textEl.getAttribute('data-text') || "";
    
    ScrollTrigger.create({
        trigger: textEl,
        start: "top 80%",
        once: true,
        onEnter: () => typeWriter(textEl, targetText)
    });
});

function typeWriter(element, text) {
    element.innerHTML = '<span class="cursor"></span>';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.innerHTML = element.innerHTML.replace('<span class="cursor"></span>', text.charAt(i) + '<span class="cursor"></span>');
            i++;
            setTimeout(type, 40);
        }
    }
    type();
}

// Reveal Chat
gsap.to("#chat-msg", {
    opacity: 1, y: 0, duration: 0.8,
    scrollTrigger: { trigger: ".chat-wrapper", start: "top 75%" }
});

// Reveal Cards
gsap.utils.toArray('.card').forEach((card, i) => {
    gsap.to(card, {
        opacity: 1, y: 0, duration: 0.8, delay: i * 0.2,
        scrollTrigger: { trigger: ".cards-grid", start: "top 75%" }
    });
});

// Reveal Poems
gsap.utils.toArray('.content').forEach((content) => {
    gsap.from(content, {
        opacity: 0, y: 30, duration: 1,
        scrollTrigger: { trigger: content, start: "top 80%" }
    });
});

// --- 5. FINALE (Updated for Mobile Responsiveness) ---
document.getElementById('flame').addEventListener('click', function() {
    gsap.to(this, { scale: 0, opacity: 0, duration: 0.5 });
    gsap.to("#final-msg", { opacity: 1, duration: 1, delay: 0.5 });
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.7 } });

    setTimeout(() => {
        initParticles(); 
        document.getElementById('three-container').classList.add('active');
        document.getElementById('morph-input').classList.add('active');
        
        setTimeout(() => {
            morphToText("Happy Birthday");
            setTimeout(() => {
                morphToHeart();
            }, 3000); 
        }, 1500); 
    }, 2000);
});


// ==========================================
//    THREE.JS PARTICLE SYSTEM (Mobile Optimized)
// ==========================================
let scene, camera, renderer, particles;
let count = 4000; 

function getHeartTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#FFFFFF'; 
    ctx.beginPath();
    ctx.moveTo(16, 26);
    ctx.bezierCurveTo(16, 26, 3, 18, 3, 10);
    ctx.bezierCurveTo(3, 3, 12, 3, 16, 10);
    ctx.bezierCurveTo(20, 3, 29, 3, 29, 10);
    ctx.bezierCurveTo(29, 18, 16, 26, 16, 26);
    ctx.fill();
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function initParticles() {
    const container = document.getElementById('three-container');
    while(container.firstChild) container.removeChild(container.firstChild);

    scene = new THREE.Scene();
    
    // --- RESPONSIVE CAMERA SETUP ---
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Adjust camera distance based on screen width
    // On mobile (aspect ratio < 1), we move the camera back significantly
    const aspect = window.innerWidth / window.innerHeight;
    camera.position.z = aspect < 1 ? 90 : 30; 

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    createSphereParticles();
    animateParticles();
    setupInputListeners();
}

function createSphereParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorObj = new THREE.Color();

    for (let i = 0; i < count; i++) {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        const r = 10;
        const x = r * Math.cos(theta) * Math.sin(phi);
        const y = r * Math.sin(theta) * Math.sin(phi);
        const z = r * Math.cos(phi);

        positions[i * 3] = x + (Math.random() - 0.5);
        positions[i * 3 + 1] = y + (Math.random() - 0.5);
        positions[i * 3 + 2] = z + (Math.random() - 0.5);

        colorObj.setStyle('#fc1f68'); 
        colors[i * 3] = colorObj.r;
        colors[i * 3 + 1] = colorObj.g;
        colors[i * 3 + 2] = colorObj.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.6, 
        map: getHeartTexture(), 
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false, 
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createTextPoints(text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const fontSize = 60;
    
    ctx.font = `bold ${fontSize}px Arial`;
    const textMetrics = ctx.measureText(text);
    canvas.width = textMetrics.width + 50;
    canvas.height = fontSize + 50;

    ctx.fillStyle = 'white';
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const points = [];

    for (let y = 0; y < canvas.height; y += 3) {
        for (let x = 0; x < canvas.width; x += 3) {
            const index = (y * canvas.width + x) * 4;
            if (data[index + 3] > 128) {
                points.push({
                    x: (x - canvas.width / 2) * 0.2,
                    y: -(y - canvas.height / 2) * 0.2
                });
            }
        }
    }
    return points;
}

function morphToText(text) {
    const textPoints = createTextPoints(text);
    const geometry = particles.geometry;
    const currentPositions = geometry.attributes.position.array;
    const targetPositions = new Float32Array(count * 3);

    gsap.to(particles.rotation, { x: 0, y: 0, z: 0, duration: 1 });

    for (let i = 0; i < count; i++) {
        if (i < textPoints.length) {
            const p = textPoints[i];
            targetPositions[i * 3] = p.x;
            targetPositions[i * 3 + 1] = p.y;
            targetPositions[i * 3 + 2] = 0;
        } else {
            const r = 30; // Extras fly further out
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            targetPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            targetPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            targetPositions[i * 3 + 2] = r * Math.cos(phi);
        }
    }

    for (let i = 0; i < currentPositions.length; i += 3) {
        gsap.to(currentPositions, {
            [i]: targetPositions[i],
            [i + 1]: targetPositions[i + 1],
            [i + 2]: targetPositions[i + 2],
            duration: 2,
            ease: "power2.inOut",
            onUpdate: () => {
                geometry.attributes.position.needsUpdate = true;
            }
        });
    }
}

function morphToHeart() {
    const geometry = particles.geometry;
    const currentPositions = geometry.attributes.position.array;
    const targetPositions = new Float32Array(count * 3);

    gsap.to(particles.rotation, { x: 0, y: 0, z: 0, duration: 1 });

    for (let i = 0; i < count; i++) {
        let x, y, z;
        while (true) {
            let tx = Math.random() * 3 - 1.5; 
            let ty = Math.random() * 3 - 1.5;
            if ( Math.pow(tx*tx + ty*ty - 1, 3) - (tx*tx * ty*ty*ty) <= 0 ) {
                x = tx * 15;
                y = ty * 15;
                break;
            }
        }
        z = (Math.random() - 0.5) * 4; 

        targetPositions[i * 3] = x;
        targetPositions[i * 3 + 1] = y + 3; 
        targetPositions[i * 3 + 2] = z;
    }

    for (let i = 0; i < currentPositions.length; i += 3) {
        gsap.to(currentPositions, {
            [i]: targetPositions[i],
            [i + 1]: targetPositions[i + 1],
            [i + 2]: targetPositions[i + 2],
            duration: 2.5,
            ease: "elastic.out(1, 0.3)",
            onUpdate: () => {
                geometry.attributes.position.needsUpdate = true;
            }
        });
    }
}

function animateParticles() {
    requestAnimationFrame(animateParticles);
    if(particles) {
        particles.rotation.y += 0.005; 
    }
    renderer.render(scene, camera);
}

function setupInputListeners() {
    const btn = document.getElementById('typeBtn');
    const input = document.getElementById('morphText');

    btn.addEventListener('click', () => {
        const val = input.value.trim().toLowerCase();
        if(val === 'heart') morphToHeart();
        else if(val) morphToText(input.value);
    });
    
    input.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') {
            const val = input.value.trim().toLowerCase();
            if(val === 'heart') morphToHeart();
            else if(val) morphToText(input.value);
        }
    });
}

// Responsive Camera Adjustment on Resize
window.addEventListener('resize', () => {
    if(camera && renderer) {
        const aspect = window.innerWidth / window.innerHeight;
        camera.aspect = aspect;
        // Update camera Z on resize too
        camera.position.z = aspect < 1 ? 90 : 30; 
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});
// --- 6. FLIP CARD INTERACTION ---
// Select all flip cards
document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', function() {
        // Toggle the flip class
        this.classList.toggle('flipped');
        
        // Get the back face element
        const backFace = this.querySelector('.flip-back');
        const text = backFace.getAttribute('data-text');
        
        // Check if we have already typed the message to avoid re-typing
        if (this.classList.contains('flipped') && !backFace.classList.contains('typed')) {
            backFace.innerHTML = ""; // Clear placeholder
            backFace.classList.add('typed'); // Mark as typed
            typeCardMessage(backFace, text);
        }
    });
});

// Helper function for typing card text
function typeCardMessage(element, text) {
    let i = 0;
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, 50); // Typing speed
        }
    }
    type();
}