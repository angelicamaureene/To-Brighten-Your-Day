/********************************************************************
 * 3‑Minute Firework Show
 *******************************************************************/

/* ---------- Canvas setup ---------- */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* ---------- Utility helpers ---------- */
const TWO_PI = Math.PI * 2;
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function hsvToRgb(h, s, v) {
  let f = (n, k = (n + h / 60) % 6) =>
    v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  return `rgb(${[f(5), f(3), f(1)].map(x => Math.floor(x * 255)).join(",")})`;
}

/* ---------- Particle + Firework classes ---------- */
class Particle {
  constructor(x, y, angle, speed, hue) {
    this.x = x;
    this.y = y;
    this.velX = Math.cos(angle) * speed;
    this.velY = Math.sin(angle) * speed;
    this.life = 0;
    this.opacity = 1;
    this.hue = hue;
  }

  update() {
    this.life += 1;
    // gravity & friction
    this.velY += 0.02;
    this.velX *= 0.98;
    this.velY *= 0.98;
    this.x += this.velX;
    this.y += this.velY;
    // fade
    this.opacity = Math.max(0, 1 - this.life / 80);
  }

  draw() {
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = hsvToRgb(this.hue, 1, 1);
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, TWO_PI);
    ctx.fill();
  }

  isDead() {
    return this.opacity <= 0.01;
  }
}

class Firework {
  constructor() {
    const startX = rand(canvas.width * 0.2, canvas.width * 0.8);
    const startY = canvas.height;
    const targetY = rand(canvas.height * 0.2, canvas.height * 0.45);
    const hue = rand(0, 360);
    this.particles = [];
    this.spark = { x: startX, y: startY, opacity: 1, hue };
    this.targetY = targetY;
  }

  update() {
    if (this.spark) {
      // Rising spark
      this.spark.y -= 4;
      if (this.spark.y <= this.targetY) {
        // Explode!
        const hue = this.spark.hue;
        for (let i = 0; i < 60; i++) {
          const angle = rand(0, TWO_PI);
          const speed = rand(1, 4);
          this.particles.push(
            new Particle(this.spark.x, this.spark.y, angle, speed, hue)
          );
        }
        this.spark = null;
      } else {
        // Draw spark
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff";
        ctx.fillRect(this.spark.x, this.spark.y, 2, 2);
      }
    }

    // Update and draw particles
    this.particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Clean up
    this.particles = this.particles.filter(p => !p.isDead());
  }

  isDead() {
    return !this.spark && this.particles.length === 0;
  }
}

/* ---------- Show controller ---------- */
let fireworks = [];
let lastLaunch = 0;
const LAUNCH_INTERVAL = 200; // ms
const SHOW_DURATION = 180_000; // 3 minutes
let startTime = null;
let animationId;

function animate(timestamp) {
  if (!startTime) startTime = timestamp;
  const elapsed = timestamp - startTime;

  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0,0,0,0.25)"; // trail fade
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "lighter";

  // Launch new fireworks
  if (elapsed - lastLaunch > LAUNCH_INTERVAL) {
    fireworks.push(new Firework());
    lastLaunch = elapsed;
  }

  // Update & draw existing
  fireworks.forEach(fw => fw.update());
  fireworks = fireworks.filter(fw => !fw.isDead());

  if (elapsed < SHOW_DURATION) {
    animationId = requestAnimationFrame(animate);
  } else {
    endShow();
  }
}

function endShow() {
  cancelAnimationFrame(animationId);
  document.getElementById("overlay").classList.add("show");
}

/* ---------- Replay handler ---------- */
document.getElementById("replay").addEventListener("click", () => {
  // Reset everything
  fireworks = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("overlay").classList.remove("show");
  startTime = null;
  lastLaunch = 0;
  animationId = requestAnimationFrame(animate);
});

/* ---------- Kick‑off ---------- */
animationId = requestAnimationFrame(animate);
