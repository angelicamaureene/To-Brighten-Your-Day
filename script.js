// script.js

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// CONFIGURATION
const MESSAGE_DURATION = 10000; // ms message display duration
const PAUSE_DURATION_MIN = 2000; // ms min pause
const PAUSE_DURATION_MAX = 5000; // ms max pause
const PARTICLE_SIZE = 2.5;
const PARTICLE_DENSITY = 6; // sample every 6 pixels horizontally and vertically for fireworks points

// Font and text settings
const FONT_FAMILY = "'Fredoka One', cursive";
const FONT_SIZE = 120; // px, adjust for size of text fireworks
const FONT_COLOR = "white"; // just for offscreen canvas drawing (invisible)
// Add this near the top with other config constants:
const RANDOM_FIREWORK_COLORS = [
  "rgba(255, 69, 0, 0.8)",      // orange-red
  "rgba(30, 144, 255, 0.8)",    // dodger blue
  "rgba(255, 215, 0, 0.8)",     // gold
  "rgba(50, 205, 50, 0.8)",     // lime green
  "rgba(138, 43, 226, 0.8)",    // blue violet
  "rgba(255, 105, 180, 0.8)",   // hot pink
  "rgba(255, 140, 0, 0.8)"      // dark orange
];

// Updated spawnRandomFirework function:
function spawnRandomFirework() {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height * 0.7 + canvas.height * 0.15;
  const count = 20 + Math.floor(Math.random() * 30);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 2;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    // Pick a random color from palette
    const color = RANDOM_FIREWORK_COLORS[Math.floor(Math.random() * RANDOM_FIREWORK_COLORS.length)];

    const p = new Particle(x, y, color, 80 + Math.random() * 40);
    p.vx = vx;
    p.vy = vy;
    particles.push(p);
  }
}

// Messages to show
const messages = [
  "My Varada",
  "You are so...",
  "AMAZING",
  "SMART",
  "AWESOME",
  "CLEVER",
  "BREATH TAKING",
  "INTELLIGENT",
  "MAJESTIC",
  "MINDBLOWING",
  "BEAUTIFUL",
  "ABSOLUTELY THE PRETTIEST GIRL IN THE WORLD",
  "THESE FIREWORKS SHINE BRIGHT",
  "BUT YOU...",
  "You my Varada, shine the brightest"
];

// Particle class
class Particle {
  constructor(x, y, color, lifespan = 120) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = PARTICLE_SIZE * (0.8 + Math.random() * 0.6);
    this.lifespan = lifespan;
    this.age = 0;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.age++;
  }
  draw(ctx) {
    const alpha = 1 - this.age / this.lifespan;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 180, 220, ${alpha})`;
    ctx.shadowColor = `rgba(255, 180, 220, ${alpha})`;
    ctx.shadowBlur = 12;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  isAlive() {
    return this.age < this.lifespan;
  }
}

const particles = [];

// Offscreen canvas to render text for sampling pixels
const offCanvas = document.createElement("canvas");
const offCtx = offCanvas.getContext("2d");

function renderTextToOffscreen(text) {
  const padding = 20;
  offCtx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
  const metrics = offCtx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = FONT_SIZE * 1.2;

  offCanvas.width = textWidth + padding * 2;
  offCanvas.height = textHeight + padding * 2;

  offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);
  offCtx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
  offCtx.fillStyle = FONT_COLOR;
  offCtx.textBaseline = "top";
  offCtx.fillText(text, padding, padding);

  return { width: offCanvas.width, height: offCanvas.height };
}

function spawnTextFireworks(text) {
  const { width, height } = renderTextToOffscreen(text);

  // Center start position on main canvas
  const startX = (canvas.width - width) / 2;
  const startY = (canvas.height - height) / 3;

  const imgData = offCtx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Iterate over pixels, sample with density steps
  for (let y = 0; y < height; y += PARTICLE_DENSITY) {
    for (let x = 0; x < width; x += PARTICLE_DENSITY) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha > 128) { // pixel is visible
        const px = startX + x + (Math.random() - 0.5) * PARTICLE_DENSITY;
        const py = startY + y + (Math.random() - 0.5) * PARTICLE_DENSITY;
        particles.push(new Particle(px, py, "rgba(255,180,220,1)", 220));
      }
    }
  }
}

// Spawn random fireworks continuously
function spawnRandomFirework() {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height * 0.7 + canvas.height * 0.15;
  const count = 20 + Math.floor(Math.random() * 30);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 2;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const p = new Particle(x, y, "rgba(255,255,255,0.6)", 80 + Math.random() * 40);
    p.vx = vx;
    p.vy = vy;
    particles.push(p);
  }
}

let lastRandomFireworkTime = 0;
function maybeSpawnRandomFirework(timestamp) {
  if (!lastRandomFireworkTime) lastRandomFireworkTime = timestamp;
  if (timestamp - lastRandomFireworkTime > 400 + Math.random() * 1000) {
    spawnRandomFirework();
    lastRandomFireworkTime = timestamp;
  }
}

// MAIN SHOW CONTROL
let currentMessageIndex = 0;
let lastMessageTime = 0;
let isInPause = false;
let pauseEndTime = 0;

function animate(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background gradient
  const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.height);
  gradient.addColorStop(0, "#000011");
  gradient.addColorStop(1, "#000000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  maybeSpawnRandomFirework(timestamp);

  if (!lastMessageTime) lastMessageTime = timestamp;

  if (!isInPause) {
    if (timestamp - lastMessageTime > MESSAGE_DURATION) {
      // Pause time
      isInPause = true;
      pauseEndTime = timestamp + PAUSE_DURATION_MIN + Math.random() * (PAUSE_DURATION_MAX - PAUSE_DURATION_MIN);
    } else if (timestamp - lastMessageTime < 50) {
      // Just started message, spawn fireworks for text
      spawnTextFireworks(messages[currentMessageIndex]);
    }
  } else {
    // Pausing (only random fireworks)
    if (timestamp > pauseEndTime) {
      // Next message
      currentMessageIndex++;
      if (currentMessageIndex >= messages.length) currentMessageIndex = 0;
      isInPause = false;
      lastMessageTime = timestamp;
    }
  }

  // Update & draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    p.draw(ctx);
    if (!p.isAlive()) {
      particles.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);



