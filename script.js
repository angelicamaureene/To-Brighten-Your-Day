// script.js

// Canvas setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// ========== CONFIGURATION ==========

// Duration configs (in milliseconds)
const MESSAGE_DURATION = 10000; // 10 seconds showing the message
const PAUSE_DURATION_MIN = 2000; // 2 seconds pause minimum
const PAUSE_DURATION_MAX = 5000; // 5 seconds pause maximum

// Bubble letter size and spacing
const LETTER_WIDTH = 40;
const LETTER_HEIGHT = 60;
const LETTER_SPACING = 15;
const LINE_SPACING = 80;

// Firework colors for messages and random bursts
const MESSAGE_FIREWORK_COLOR = 'rgba(255, 180, 220, 0.9)';
const RANDOM_FIREWORK_COLOR = 'rgba(255, 255, 255, 0.6)';

// Messages to display in sequence
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

// ========== LETTER COORDINATES ==========
// Coordinates represent relative points in a 40x60 box for each letter,
// where fireworks will launch from to form bubble letters.

// For simplicity, each letter is made of circle points roughly forming bubble letters.
// Coordinates are [x, y] within box, 0 <= x <= 40, 0 <= y <= 60.

// Define a basic set of letters (A-Z, a-z, space, ., ...)

// You can add more letters if needed by drawing them similarly.

const letterPoints = {
  "A": [ [5,60],[15,10],[25,10],[35,60],[5,40],[35,40],[15,35],[25,35] ],
  "B": [ [5,10],[5,60],[25,60],[35,50],[25,40],[35,30],[25,20],[5,20] ],
  "C": [ [35,10],[15,10],[5,30],[5,50],[15,60],[35,60] ],
  "D": [ [5,10],[5,60],[25,60],[35,40],[35,30],[25,10] ],
  "E": [ [35,10],[5,10],[5,60],[35,60],[5,35],[25,35] ],
  "F": [ [5,10],[5,60],[35,60],[5,35],[25,35] ],
  "G": [ [35,10],[15,10],[5,30],[5,50],[15,60],[35,60],[35,45],[25,45] ],
  "H": [ [5,10],[5,60],[35,10],[35,60],[5,35],[35,35] ],
  "I": [ [20,10],[20,60],[10,10],[30,10],[10,60],[30,60] ],
  "J": [ [35,10],[35,50],[25,60],[15,60],[5,50] ],
  "K": [ [5,10],[5,60],[35,10],[15,35],[35,60] ],
  "L": [ [5,10],[5,60],[35,60] ],
  "M": [ [5,60],[5,10],[20,30],[35,10],[35,60] ],
  "N": [ [5,60],[5,10],[35,60],[35,10] ],
  "O": [ [15,10],[35,25],[35,45],[15,60],[5,45],[5,25] ],
  "P": [ [5,60],[5,10],[35,10],[35,35],[5,35] ],
  "Q": [ [15,10],[35,25],[35,45],[15,60],[5,45],[5,25],[25,50],[35,60] ],
  "R": [ [5,60],[5,10],[35,10],[35,35],[5,35],[25,60],[35,60] ],
  "S": [ [35,10],[15,10],[5,25],[35,35],[35,45],[15,60],[5,60] ],
  "T": [ [5,10],[35,10],[20,10],[20,60] ],
  "U": [ [5,10],[5,50],[15,60],[25,60],[35,50],[35,10] ],
  "V": [ [5,10],[20,60],[35,10] ],
  "W": [ [5,10],[10,60],[20,40],[30,60],[35,10] ],
  "X": [ [5,10],[35,60],[20,35],[35,10],[5,60] ],
  "Y": [ [5,10],[20,35],[35,10],[20,60] ],
  "Z": [ [5,10],[35,10],[5,60],[35,60],[5,10],[35,60] ],

  "a": [ [5,50],[25,50],[35,40],[35,30],[25,20],[5,20],[5,30],[25,40] ],
  "b": [ [5,10],[5,60],[25,60],[35,50],[25,40],[35,30],[25,20],[5,20] ],
  "c": [ [35,30],[25,20],[5,20],[5,40],[25,40],[35,30] ],
  "d": [ [35,10],[35,60],[15,60],[5,50],[15,40],[5,30],[15,20],[35,20] ],
  "e": [ [5,30],[25,30],[35,40],[25,50],[5,50],[5,30],[25,20] ],
  "f": [ [25,10],[15,10],[15,35],[15,60],[35,60] ],
  "g": [ [5,40],[25,40],[35,30],[35,10],[25,10],[5,20],[25,60],[35,60] ],
  "h": [ [5,10],[5,60],[25,60],[25,35],[25,10] ],
  "i": [ [20,20],[20,50],[15,60],[25,60] ],
  "j": [ [30,20],[30,50],[25,60],[15,60],[5,50] ],
  "k": [ [5,10],[5,60],[25,35],[35,10],[25,60] ],
  "l": [ [15,10],[15,60],[35,60] ],
  "m": [ [5,50],[5,10],[15,30],[25,10],[35,30],[35,50] ],
  "n": [ [5,50],[5,10],[25,50],[25,10] ],
  "o": [ [15,20],[25,20],[35,30],[25,40],[15,40],[5,30] ],
  "p": [ [5,50],[5,10],[25,10],[35,20],[25,30],[5,30] ],
  "q": [ [35,50],[35,10],[15,10],[5,20],[15,30],[35,30] ],
  "r": [ [5,50],[5,10],[25,10],[25,30] ],
  "s": [ [35,20],[25,10],[15,10],[5,20],[25,30],[35,40],[25,50],[5,50] ],
  "t": [ [20,10],[20,60],[10,60],[30,60] ],
  "u": [ [5,10],[5,40],[15,50],[25,50],[35,40],[35,10] ],
  "v": [ [5,10],[20,50],[35,10] ],
  "w": [ [5,10],[10,50],[20,30],[30,50],[35,10] ],
  "x": [ [5,10],[35,50],[20,30],[35,10],[5,50] ],
  "y": [ [5,10],[20,30],[35,10],[20,60] ],
  "z": [ [5,10],[35,10],[5,50],[35,50],[5,10],[35,50] ],

  " ": [],

  ".": [ [20,55] ],
  ",": [ [20,55], [25,60] ],
  "'": [ [20,20] ],
  "-": [ [5,30],[35,30] ]
};

// If a letter is missing, fallback to a simple rectangle shape.
function getLetterPoints(char) {
  if (letterPoints[char]) return letterPoints[char];
  return [ [5,10],[35,10],[35,50],[5,50] ]; // fallback rectangle
}

// ========== PARTICLE CLASS ==========

class Particle {
  constructor(x, y, color, lifespan = 120, isMessageParticle = false) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = 2 + Math.random() * 2;
    this.lifespan = lifespan;
    this.age = 0;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.isMessageParticle = isMessageParticle;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.02; // gravity-like effect
    this.age++;
  }
  draw(ctx) {
    const alpha = 1 - this.age / this.lifespan;
    ctx.beginPath();
    ctx.fillStyle = this.color.replace(/[\d\.]+\)$/g, alpha + ')');
    ctx.shadowColor = this.color.replace(/[\d\.]+\)$/g, alpha + ')');
    ctx.shadowBlur = 10;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  isAlive() {
    return this.age < this.lifespan;
  }
}

// ========== FIREWORKS MANAGEMENT ==========

const particles = [];

function spawnRandomFirework() {
  // Random position
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height * 0.6 + canvas.height * 0.2;

  const count = 20 + Math.floor(Math.random() * 30);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 2;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const p = new Particle(x, y, RANDOM_FIREWORK_COLOR, 80 + Math.random() * 40);
    p.vx = vx;
    p.vy = vy;
    particles.push(p);
  }
}

// Spawn random fireworks continuously at random intervals
let lastRandomFireworkTime = 0;
function maybeSpawnRandomFirework(timestamp) {
  if (!lastRandomFireworkTime) lastRandomFireworkTime = timestamp;
  if (timestamp - lastRandomFireworkTime > 400 + Math.random() * 1000) {
    spawnRandomFirework();
    lastRandomFireworkTime = timestamp;
  }
}

// ========== MESSAGE LETTER FIREWORKS SPAWN ==========

// We'll spawn message particles in a grid for each letter's points,
// spacing letters horizontally and multiple lines vertically.

// Returns the (x, y) canvas position of the letter origin
function getLetterOrigin(lineIdx, charIdx) {
  const x = canvas.width / 2 - (messages[lineIdx].length * (LETTER_WIDTH + LETTER_SPACING)) / 2 + charIdx * (LETTER_WIDTH + LETTER_SPACING);
  const y = canvas.height / 3 + lineIdx * LINE_SPACING;
  return { x, y };
}

// Actually, we want multiline messages, so we'll split messages by spaces and commas, but
// to keep it simple: place all letters on one line horizontally, vertically centered at canvas.height/3.

// Spawn fireworks to form one letter at position (originX, originY)
function spawnLetterFireworks(letter, originX, originY) {
  const points = getLetterPoints(letter);
  points.forEach(([px, py]) => {
    // Map relative points to absolute on canvas
    // Add some random jitter so it's not perfectly uniform
    const x = originX + px + (Math.random() - 0.5) * 5;
    const y = originY + py + (Math.random() - 0.5) * 5;
    const p = new Particle(x, y, MESSAGE_FIREWORK_COLOR, 200, true);
    // Particles for message have less velocity so they stay put longer
    p.vx = (Math.random() - 0.5) * 0.3;
    p.vy = (Math.random() - 0.5) * 0.3;
    particles.push(p);
  });
}

// Spawn the entire message as fireworks
function spawnMessageFireworks(message) {
  const line = message;
  const totalWidth = line.length * (LETTER_WIDTH + LETTER_SPACING);
  // Center start X so message is horizontally centered
  const startX = canvas.width / 2 - totalWidth / 2;
  const originY = canvas.height / 3;
  for (let i = 0; i < line.length; i++) {
    const letter = line[i];
    if (letter === ' ') continue; // skip spaces for now
    spawnLetterFireworks(letter, startX + i * (LETTER_WIDTH + LETTER_SPACING), originY);
  }
}

// ========== MAIN SHOW CONTROL ==========

let currentMessageIndex = 0;
let lastMessageTime = 0;
let isInPause = false;
let pauseEndTime = 0;

function animate(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background gradient (dark night sky)
  const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.height);
  gradient.addColorStop(0, "#000011");
  gradient.addColorStop(1, "#000000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  maybeSpawnRandomFirework(timestamp);

  // Show message fireworks or pause
  if (!lastMessageTime) lastMessageTime = timestamp;

  if (!isInPause) {
    // During message display
    if (timestamp - lastMessageTime > MESSAGE_DURATION) {
      // Time to pause (random fireworks only)
      isInPause = true;
      pauseEndTime = timestamp + PAUSE_DURATION_MIN + Math.random() * (PAUSE_DURATION_MAX - PAUSE_DURATION_MIN);
    } else if (timestamp - lastMessageTime < 50) {
      // Just started displaying this message, spawn its fireworks
      spawnMessageFireworks(messages[currentMessageIndex]);
    } else {
      // Continue displaying message (particles remain)
    }
  } else {
    // In pause
    if (timestamp > pauseEndTime) {
      // Pause done, move to next message
      currentMessageIndex++;
      if (currentMessageIndex >= messages.length) {
        currentMessageIndex = 0; // Loop messages
      }
      isInPause = false;
      lastMessageTime = timestamp;
    }
  }

  // Update and draw particles
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

// Start animation
requestAnimationFrame(animate);

