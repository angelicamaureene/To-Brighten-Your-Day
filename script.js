/*  =========================================================
    Fireworks Message Show – mobile‑responsive edition
    ========================================================= */

const canvas = document.getElementById("canvas");
const ctx     = canvas.getContext("2d");

/* ---------- Basic resize ---------- */
function fitCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
fitCanvas();
window.addEventListener("resize", fitCanvas);

/* ---------- Show timing ---------- */
const MESSAGE_TIME   = 10_000;          // ms fireworks forming the message
const PAUSE_MIN      = 2_000;           // ms random‑only
const PAUSE_MAX      = 5_000;

/* ---------- Visual tuning ---------- */
const MESSAGE_COLOR      = "rgba(255,180,220,1)";  // pink for text
const RANDOM_COLORS      = [
  "rgba(255,69,0,0.85)",     // orange‑red
  "rgba(30,144,255,0.85)",   // blue
  "rgba(255,215,0,0.85)",    // gold
  "rgba(50,205,50,0.85)",    // lime
  "rgba(138,43,226,0.85)",   // violet
  "rgba(255,105,180,0.85)",  // hot‑pink
  "rgba(255,140,0,0.85)"     // dark orange
];

/* ---------- Messages ---------- */
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

/* ---------- Particle ---------- */
class Particle {
  constructor(x, y, color, life=120) {
    this.x = x;      this.y = y;
    this.vx = (Math.random()-0.5)*0.35;
    this.vy = (Math.random()-0.5)*0.35;
    this.life = life;
    this.age  = 0;
    this.colorBase = color;
    this.radius = 2 + Math.random()*1.6;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.age++;
  }
  draw(ctx) {
    const alpha = 1 - this.age/this.life;
    const c = this.colorBase.replace(/[\d.]+\)$/g, alpha+")");
    ctx.beginPath();
    ctx.fillStyle = c;
    ctx.shadowColor = c;
    ctx.shadowBlur = 10;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.fill();
  }
  alive() { return this.age < this.life; }
}
const particles = [];

/* ---------- Off‑screen canvas for pixel sampling ---------- */
const offCanvas = document.createElement("canvas");
const offCtx    = offCanvas.getContext("2d");
const FONT_FAMILY = "'Fredoka One', cursive";

/* Determine a font size that fits WIDTH*0.9, add line‑wrapping if needed */
function renderToOffscreen(text) {
  const maxWidth = canvas.width*0.9;
  let fontSize = Math.min(80, canvas.width / 10);

  // keep shrinking until single‑line fits
  offCtx.font = `${fontSize}px ${FONT_FAMILY}`;
  while (offCtx.measureText(text).width > maxWidth && fontSize > 26) {
    fontSize -= 2;
    offCtx.font = `${fontSize}px ${FONT_FAMILY}`;
  }

  /* If even minimum font would overflow, perform crude word‑wrap */
  const words = text.split(" ");
  const lines = [];
  let line = "";
  words.forEach(w=>{
    const test = (line?line+" ":"")+w;
    if (offCtx.measureText(test).width <= maxWidth || !line) {
      line = test;
    } else {
      lines.push(line);
      line = w;
    }
  });
  lines.push(line);

  const lineHeight = fontSize*1.25;
  const padding = 20;
  offCanvas.width  = maxWidth + padding*2;
  offCanvas.height = lines.length*lineHeight + padding*2;

  offCtx.clearRect(0,0,offCanvas.width,offCanvas.height);
  offCtx.font = `${fontSize}px ${FONT_FAMILY}`;
  offCtx.fillStyle = "#fff";
  offCtx.textBaseline = "top";
  offCtx.textAlign = "center";

  lines.forEach((ln, i)=>{
    offCtx.fillText(ln, offCanvas.width/2, padding+i*lineHeight);
  });

  return {w:offCanvas.width, h:offCanvas.height, density: Math.max(4, Math.round(fontSize/18))};
}

/* Spawn fireworks on each filled pixel (sampled coarsely) */
function spawnMessageFireworks(text) {
  const {w,h,density} = renderToOffscreen(text);
  const startX = (canvas.width - w)/2;
  const startY = (canvas.height - h)/3;

  const data = offCtx.getImageData(0,0,w,h).data;
  for (let y=0;y<h;y+=density){
    for (let x=0;x<w;x+=density){
      const idx = (y*w + x)*4 + 3;      // alpha channel
      if (data[idx] > 128) {
        const jitter = density*0.4;
        particles.push(
          new Particle(
            startX + x + (Math.random()-0.5)*jitter,
            startY + y + (Math.random()-0.5)*jitter,
            MESSAGE_COLOR,
            220
          )
        );
      }
    }
  }
}

/* ---------- Random fireworks ---------- */
function randomBurst() {
  const cx = Math.random()*canvas.width;
  const cy = Math.random()*canvas.height*0.7 + canvas.height*0.15;
  const count = 24 + Math.floor(Math.random()*26);
  for (let i=0;i<count;i++){
    const angle = Math.random()*Math.PI*2;
    const speed = Math.random()*3 + 2;
    const vx = Math.cos(angle)*speed;
    const vy = Math.sin(angle)*speed;
    const color = RANDOM_COLORS[Math.floor(Math.random()*RANDOM_COLORS.length)];
    const p = new Particle(cx, cy, color, 80+Math.random()*40);
    p.vx = vx; p.vy = vy;
    particles.push(p);
  }
}
let lastBurst = 0;
function maybeRandomBurst(t){
  if(t-lastBurst > 400+Math.random()*1000){
    randomBurst();
    lastBurst = t;
  }
}

/* ---------- Show controller ---------- */
let msgIndex = 0;
let msgStart = 0;
let pausing   = false;
let pauseEnd  = 0;

function loop(t){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // soft radial night‑sky gradient
  const g = ctx.createRadialGradient(canvas.width/2,canvas.height/2,0,canvas.width/2,canvas.height/2,canvas.height);
  g.addColorStop(0,"#000012"); g.addColorStop(1,"#000");
  ctx.fillStyle = g; ctx.fillRect(0,0,canvas.width,canvas.height);

  maybeRandomBurst(t);

  if(!msgStart) msgStart = t;

  if (t - msgStart < 60) {
  spawnMessageFireworks(messages[msgIndex]);
}
if (t - msgStart > MESSAGE_TIME) {
  msgIndex = (msgIndex + 1) % messages.length;
  msgStart = t;
}


  /* Update & draw particles */
  for(let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    p.update(); p.draw(ctx);
    if(!p.alive()) particles.splice(i,1);
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);




