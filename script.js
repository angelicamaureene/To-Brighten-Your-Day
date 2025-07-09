/* =========================================================
   Fireworks Message Show — mobile‑friendly, 10‑s interval
   ========================================================= */

/* ---------- Canvas setup ---------- */
const canvas = document.getElementById("canvas");
const ctx    = canvas.getContext("2d");

function fitCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
fitCanvas();
window.addEventListener("resize", fitCanvas);

/* ---------- Message data (UPDATED) ---------- */
const messages = [
  "My Varada",
  "You are so...",
  "AMAZING",
  "SMART",
  "AWESOME",
  "CLEVER",
  "BREATHTAKING",
  "INTELLIGENT",
  "MAJESTIC",
  "MINDBLOWING",
  "BEAUTIFUL",
  "ABSOLUTELY",
  "THE PRETTIEST",
  "GIRL",
  "IN",
  "THE",
  "WORLD",
  "THESE",
  "FIREWORKS",
  "SHINE",
  "BRIGHT",
  "BUT YOU...",
  "You",
  "my Varada,",
  "shine",
  "the",
  "brightest"
];

/* ---------- Timing constants ---------- */
const MESSAGE_INTERVAL = 10_000;          // 10 s per message
let   nextMessageTime  = 0;
let   msgIndex         = -1;

/* ---------- Visual settings ---------- */
const MSG_COLOR    = "rgba(255,180,220,1)";
const RANDOM_COLORS = [
  "rgba(255,69,0,0.85)",
  "rgba(30,144,255,0.85)",
  "rgba(255,215,0,0.85)",
  "rgba(50,205,50,0.85)",
  "rgba(138,43,226,0.85)",
  "rgba(255,105,180,0.85)",
  "rgba(255,140,0,0.85)"
];

/* ---------- Particle class ---------- */
class Particle {
  constructor(x, y, color, life=140) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random()-0.5)*0.35;
    this.vy = (Math.random()-0.5)*0.35;
    this.life = life;
    this.age  = 0;
    this.base = color;
    this.r    = 2 + Math.random()*1.6;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.age++;
  }
  draw(ctx) {
    const a = 1 - this.age/this.life;
    const c = this.base.replace(/[\d.]+\)$/g, a+")");
    ctx.beginPath();
    ctx.fillStyle   = c;
    ctx.shadowColor = c;
    ctx.shadowBlur  = 10;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
    ctx.fill();
  }
  alive() { return this.age < this.life; }
}
const particles = [];

/* ---------- Off‑screen canvas for pixel sampling ---------- */
const offCanvas = document.createElement("canvas");
const offCtx    = offCanvas.getContext("2d");
const FONT_FAMILY = "'Fredoka One', cursive";

/* Render text, auto‑shrink & wrap if needed */
function renderText(text) {
  const maxW = canvas.width * 0.9;
  let fontSize = Math.min(70, canvas.width / 12);

  offCtx.font = `${fontSize}px ${FONT_FAMILY}`;
  while (offCtx.measureText(text).width > maxW && fontSize > 24) {
    fontSize -= 2;
    offCtx.font = `${fontSize}px ${FONT_FAMILY}`;
  }

  // word‑wrap
  const words = text.split(" ");
  const lines = [];
  let line = "";
  words.forEach(w => {
    const test = (line ? line + " " : "") + w;
    if (offCtx.measureText(test).width <= maxW || !line) line = test;
    else { lines.push(line); line = w; }
  });
  lines.push(line);

  const lh  = fontSize * 1.25;
  const pad = 20;
  offCanvas.width  = maxW + pad*2;
  offCanvas.height = lines.length * lh + pad*2;

  offCtx.clearRect(0,0,offCanvas.width,offCanvas.height);
  offCtx.font = `${fontSize}px ${FONT_FAMILY}`;
  offCtx.fillStyle = "#fff";
  offCtx.textBaseline = "top";
  offCtx.textAlign = "center";
  lines.forEach((ln,i) => offCtx.fillText(ln, offCanvas.width/2, pad + i*lh));

  return { w: offCanvas.width, h: offCanvas.height, density: Math.max(4, Math.round(fontSize/16)) };
}

/* Spawn fireworks particles that form the given text */
function spawnMessageFireworks(text) {
  const { w,h,density } = renderText(text);
  const startX = (canvas.width - w)/2;
  const startY = (canvas.height - h)/3;

  const data = offCtx.getImageData(0,0,w,h).data;
  for (let y=0; y<h; y+=density) {
    for (let x=0; x<w; x+=density) {
      if (data[(y*w + x)*4 + 3] > 128) {
        const jitter = density*0.4;
        particles.push(
          new Particle(
            startX + x + (Math.random()-0.5)*jitter,
            startY + y + (Math.random()-0.5)*jitter,
            MSG_COLOR,
            220
          )
        );
      }
    }
  }
}

/* ---------- Random background bursts ---------- */
function randomBurst() {
  const cx = Math.random()*canvas.width;
  const cy = Math.random()*canvas.height*0.7 + canvas.height*0.15;
  const count = 24 + Math.floor(Math.random()*26);
  for (let i=0;i<count;i++){
    const ang = Math.random()*Math.PI*2;
    const spd = Math.random()*3 + 2;
    const p = new Particle(cx,cy,
      RANDOM_COLORS[Math.floor(Math.random()*RANDOM_COLORS.length)],
      80 + Math.random()*40
    );
    p.vx = Math.cos(ang)*spd;
    p.vy = Math.sin(ang)*spd;
    particles.push(p);
  }
}
let lastBurst = 0;
function maybeBurst(t){
  if(t - lastBurst > 400 + Math.random()*900){
    randomBurst();
    lastBurst = t;
  }
}

/* ---------- Animation loop ---------- */
function loop(t) {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // night‑sky gradient
  const g = ctx.createRadialGradient(canvas.width/2,canvas.height/2,0,canvas.width/2,canvas.height/2,canvas.height);
  g.addColorStop(0,"#000013"); g.addColorStop(1,"#000");
  ctx.fillStyle = g; ctx.fillRect(0,0,canvas.width,canvas.height);

  maybeBurst(t);

  if (nextMessageTime === 0 || t >= nextMessageTime) {
    msgIndex = (msgIndex + 1) % messages.length;
    spawnMessageFireworks(messages[msgIndex]);
    nextMessageTime = (nextMessageTime === 0 ? t : nextMessageTime) + MESSAGE_INTERVAL;
  }

  // update & draw particles
  for (let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    p.update(); p.draw(ctx);
    if (!p.alive()) particles.splice(i,1);
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);





