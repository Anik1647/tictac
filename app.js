// Elements
const boxes = document.querySelectorAll('.box');
const resetBtn = document.querySelector('#reset-btn');
const newGameBtn = document.querySelector('#new-game-btn');
const statusBar = document.querySelector('#statusBar');
const turnText = document.querySelector('#turnText');

// Modals & inputs
const startModal = document.querySelector('#startModal');
const startBtn = document.querySelector('#startBtn');
const p1Input = document.querySelector('#p1');
const p2Input = document.querySelector('#p2');

const resultModal = document.querySelector('#resultModal');
const resultTitle = document.querySelector('#resultTitle');
const resultText = document.querySelector('#resultText');
const playAgainBtn = document.querySelector('#playAgainBtn');
const newNamesBtn = document.querySelector('#newNamesBtn');

// Effects canvas
const fxCanvas = document.querySelector('#fxCanvas');
const fx = fxCanvas.getContext('2d');
let animId = null;
const confettiParticles = [];
// Constellation particles
let nodes = [];
const mouse = {x:0.5, y:0.5, active:false};
function resizeCanvas(){
  fxCanvas.width = window.innerWidth;
  fxCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
window.addEventListener('mousemove', (e)=>{
  mouse.x = e.clientX / window.innerWidth;
  mouse.y = e.clientY / window.innerHeight;
  mouse.active = true;
});
window.addEventListener('mouseleave', ()=>{ mouse.active = false; });

// Initialize constellation nodes
function initConstellation(){
  const density = Math.min(90, Math.floor((fxCanvas.width*fxCanvas.height)/16000));
  nodes = Array.from({length: density}, ()=>({
    x: Math.random()*fxCanvas.width,
    y: Math.random()*fxCanvas.height,
    vx: (Math.random()*2-1)*0.6,
    vy: (Math.random()*2-1)*0.6,
    r: Math.random()*1.6 + 1.2
  }));
}
initConstellation();

function render(){
  fx.clearRect(0,0,fxCanvas.width, fxCanvas.height);

  // Animated Constellation Particles
  const linkDist = 120; // px
  const mouseX = mouse.x * fxCanvas.width;
  const mouseY = mouse.y * fxCanvas.height;

  // Update & draw nodes
  fx.globalCompositeOperation = 'source-over';
  for(const n of nodes){
    n.x += n.vx; n.y += n.vy;
    if(n.x < 0 || n.x > fxCanvas.width) n.vx *= -1;
    if(n.y < 0 || n.y > fxCanvas.height) n.vy *= -1;
    // gentle mouse attraction
    if(mouse.active){
      const dx = mouseX - n.x, dy = mouseY - n.y; const d2 = dx*dx + dy*dy;
      if(d2 < 160*160){ n.vx += dx*0.00003; n.vy += dy*0.00003; }
    }
    // node glow
    const grad = fx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 16);
    grad.addColorStop(0, 'rgba(255,255,255,0.12)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    fx.fillStyle = grad; fx.beginPath(); fx.arc(n.x, n.y, 16, 0, Math.PI*2); fx.fill();
    // core dot
    fx.fillStyle = 'rgba(255,255,255,0.85)';
    fx.beginPath(); fx.arc(n.x, n.y, n.r, 0, Math.PI*2); fx.fill();
  }

  // Lines between near particles (and to mouse)
  fx.lineWidth = 1;
  for(let i=0;i<nodes.length;i++){
    for(let j=i+1;j<nodes.length;j++){
      const a = nodes[i], b = nodes[j];
      const dx = a.x-b.x, dy = a.y-b.y; const dist = Math.hypot(dx,dy);
      if(dist < linkDist){
        fx.strokeStyle = `rgba(255,255,255,${(1 - dist/linkDist)*0.25})`;
        fx.beginPath(); fx.moveTo(a.x, a.y); fx.lineTo(b.x, b.y); fx.stroke();
      }
    }
    // link to mouse point
    if(mouse.active){
      const a = nodes[i];
      const dx = a.x-mouseX, dy = a.y-mouseY; const dist = Math.hypot(dx,dy);
      if(dist < linkDist){
        fx.strokeStyle = `rgba(99, 179, 237, ${(1 - dist/linkDist)*0.35})`;
        fx.beginPath(); fx.moveTo(a.x, a.y); fx.lineTo(mouseX, mouseY); fx.stroke();
      }
    }
  }

  // Confetti particles (draw above constellation)
  fx.globalCompositeOperation = 'source-over';
  for(let i=confettiParticles.length-1;i>=0;i--){
    const p = confettiParticles[i];
    p.life -= 1; if(p.life<=0){ confettiParticles.splice(i,1); continue; }
    p.x += p.vx; p.y += p.vy; p.vy += p.g;
    p.rot += p.vr;
    fx.save();
    fx.translate(p.x, p.y);
    fx.rotate(p.rot);
    fx.fillStyle = p.color;
    if(p.shape==='rect') fx.fillRect(-p.size, -p.size, p.size*2, p.size*2);
    else { fx.beginPath(); fx.arc(0,0,p.size,0,Math.PI*2); fx.fill(); }
    fx.restore();
  }

  animId = requestAnimationFrame(render);
}
cancelAnimationFrame(animId);
render();

// Game state
const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

let players = { X: 'Player 1', O: 'Player 2' };
let current = 'X';
let running = false;

// Helpers
const openModal = (el) => el.classList.add('open');
const closeModal = (el) => el.classList.remove('open');

function setTurnText(){
  statusBar.classList.remove('hidden');
  turnText.textContent = `${players[current]}'s turn — ${current}`;
}

function clearBoard(){
  boxes.forEach(b => {
    b.textContent = '';
    b.disabled = false;
    b.classList.remove('mark-X','mark-O','win');
  });
}

function startGame(){
  const p1 = (p1Input.value || 'Player 1').trim();
  const p2 = (p2Input.value || 'Player 2').trim();
  players = { X: p1, O: p2 };
  current = 'X';
  clearBoard();
  running = true;
  setTurnText();
  closeModal(startModal);
}

function handleBoxClick(e){
  if(!running) return;
  const btn = e.currentTarget;
  if(btn.textContent) return; // already marked
  btn.textContent = current;
  btn.classList.add(`mark-${current}`);
  const winner = getWinner();
  if(winner){
    endGame(winner);
    return;
  }
  if(isDraw()){
    endGame(null);
    return;
  }
  current = current === 'X' ? 'O' : 'X';
  setTurnText();
}

function getWinner(){
  const values = [...boxes].map(b=>b.textContent);
  for(const [a,b,c] of winPatterns){
    if(values[a] && values[a]===values[b] && values[b]===values[c]){
      [a,b,c].forEach(i=> boxes[i].classList.add('win'));
      return values[a];
    }
  }
  return null;
}

function isDraw(){
  return [...boxes].every(b=> b.textContent);
}

function endGame(winner){
  running = false;
  boxes.forEach(b=> b.disabled = true);
  if(winner){
    resultTitle.textContent = 'We have a Winner!';
    resultText.textContent = `${players[winner]} (${winner}) wins! 🎉`;
    launchConfetti();
  }else{
    resultTitle.textContent = 'It\'s a Draw!';
    resultText.textContent = 'Great game! 🤝';
  }
  openModal(resultModal);
}

function resetBoard(){
  clearBoard();
  running = true;
  current = 'X';
  setTurnText();
}

function newGame(){
  // keep names
  resetBoard();
  closeModal(resultModal);
}

// Event wiring
boxes.forEach(b => b.addEventListener('click', handleBoxClick));
resetBtn.addEventListener('click', () => { // reset board only
  resetBoard();
});
newGameBtn.addEventListener('click', () => openModal(startModal));
startBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', () => { newGame(); });
newNamesBtn.addEventListener('click', () => {
  closeModal(resultModal);
  openModal(startModal);
});

// Initial state: open start modal
openModal(startModal);

// ---------- Celebration FX (confetti fireworks) + BG orbs ----------
function launchConfetti(){
  const colors = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899'];
  const burst = (x, y) => {
    const count = 120;
    for(let i=0;i<count;i++){
      const angle = Math.random()*Math.PI*2;
      const speed = 2 + Math.random()*5;
      confettiParticles.push({
        x, y,
        vx: Math.cos(angle)*speed,
        vy: Math.sin(angle)*speed - 2,
        g: 0.06 + Math.random()*0.04,
        life: 80 + Math.random()*40,
        size: 2 + Math.random()*3,
        color: colors[(Math.random()*colors.length)|0],
        rot: Math.random()*Math.PI,
        vr: (Math.random()-0.5)*0.3,
        shape: Math.random()<0.5 ? 'rect' : 'circ'
      });
    }
  };

  const H = fxCanvas.height; const W = fxCanvas.width;
  burst(W*0.25, H*0.35);
  burst(W*0.5,  H*0.25);
  burst(W*0.75, H*0.35);
}
