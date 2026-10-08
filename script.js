/* ==================== 粒子背景 ==================== */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let w, h;

const isMobile = window.innerWidth < 768;
const spawnRate = isMobile ? 0.10 : 0.22;

function resize(){
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class ScaleParticle{
  constructor(){
    this.x = Math.random() * w;
    this.y = -30;
    this.size = Math.random() * 4 + 1.5;
    this.speedY = Math.random() * 1.2 + 0.6;
    this.speedX = (Math.random() - 0.5) * 0.6;
    this.rotate = Math.random() * Math.PI * 2;
    this.rotateSpeed = (Math.random() - 0.5) * 0.03;
    this.alpha = Math.random() * 0.45 + 0.2;
    this.color = Math.random() > 0.5 ? '#ffd700' : '#d4af37';
  }
  update(){
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotate += this.rotateSpeed;
  }
  draw(){
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotate);
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/* ---------- 拖尾：金色光带 ---------- */
class LightStreak{
  constructor(x1, y1, x2, y2){
    this.x1 = x1; this.y1 = y1;
    this.x2 = x2; this.y2 = y2;
    this.life = 1;
    this.width = 10 + Math.random() * 8;
  }
  update(){ this.life -= 0.045; }
  draw(){
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(255, 180, 0, 1)';
    ctx.shadowBlur = 26;
    const grad = ctx.createLinearGradient(this.x1, this.y1, this.x2, this.y2);
    grad.addColorStop(0,   'rgba(184, 134, 11, 0)');
    grad.addColorStop(0.35,'rgba(218, 165, 32, ' + (this.life * 0.9) + ')');
    grad.addColorStop(0.6, 'rgba(255, 165, 0, ' + (this.life * 0.95) + ')');
    grad.addColorStop(1,   'rgba(255, 215, 0, 0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = this.width * this.life;
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();
    ctx.shadowBlur = 8;
    ctx.strokeStyle = 'rgba(255, 240, 160, ' + (this.life * 0.85) + ')';
    ctx.lineWidth = Math.max(1, this.width * this.life * 0.28);
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();
    ctx.restore();
  }
}

/* ---------- 拖尾：金鳞碎片 ---------- */
class TrailScale{
  constructor(x, y, burst){
    const angle = Math.random() * Math.PI * 2;
    const speed = burst ? (1.2 + Math.random() * 4.5) : (0.2 + Math.random() * 1.4);
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - (burst ? 0.8 : 0.3);
    this.size = burst ? (4 + Math.random() * 6) : (2.5 + Math.random() * 4);
    this.scaleY = 0.5 + Math.random() * 0.35;
    this.alpha = 1;
    this.decay = burst ? (0.010 + Math.random() * 0.012) : (0.014 + Math.random() * 0.016);
    const colors = ['#FFD700', '#FFB90F', '#FFA500', '#DAA520', '#B8860B'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.rotate = Math.random() * Math.PI * 2;
    this.rotateSpeed = (Math.random() - 0.5) * 0.14;
  }
  update(){
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.94;
    this.vy *= 0.94;
    this.vy += 0.035;
    this.alpha -= this.decay;
    this.size *= 0.985;
    this.rotate += this.rotateSpeed;
  }
  draw(){
    if (this.alpha <= 0 || this.size < 0.3) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotate);
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 22;
    ctx.globalAlpha = Math.max(0, this.alpha * 0.65);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size * 1.5, this.size * this.scaleY * 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size, this.size * this.scaleY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = Math.max(0, this.alpha * 0.9);
    ctx.fillStyle = 'rgba(255, 240, 180, 0.95)';
    ctx.beginPath();
    ctx.ellipse(-this.size * 0.22, -this.size * 0.22,
                this.size * 0.42, this.size * this.scaleY * 0.38,
                0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const scaleList = [];
const trailList = [];
const streakList = [];

function animate(){
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, w, h);

  if (Math.random() < spawnRate) scaleList.push(new ScaleParticle());
  for (let i = scaleList.length - 1; i >= 0; i--){
    const p = scaleList[i];
    p.update();
    p.draw();
    if (p.y > h + 20) scaleList.splice(i, 1);
  }

  for (let i = streakList.length - 1; i >= 0; i--){
    const s = streakList[i];
    s.update();
    s.draw();
    if (s.life <= 0) streakList.splice(i, 1);
  }

  for (let i = trailList.length - 1; i >= 0; i--){
    const p = trailList[i];
    p.update();
    p.draw();
    if (p.alpha <= 0 || p.size < 0.3) trailList.splice(i, 1);
  }
}
animate();

let lastX = -999, lastY = -999;

function spawnTrail(x, y, isBurst){
  if (!isBurst && lastX > -900){
    streakList.push(new LightStreak(lastX, lastY, x, y));
    if (streakList.length > 60){
      streakList.splice(0, streakList.length - 60);
    }
  }
  const n = isBurst ? 14 : (isMobile ? 2 : 3);
  for (let i = 0; i < n; i++){
    trailList.push(new TrailScale(x, y, isBurst));
  }
  if (trailList.length > 380){
    trailList.splice(0, trailList.length - 380);
  }
}

window.addEventListener('mousemove', (e) => {
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  if (dx * dx + dy * dy < 12) return;
  spawnTrail(e.clientX, e.clientY, false);
  lastX = e.clientX;
  lastY = e.clientY;
});

window.addEventListener('mousedown', (e) => {
  lastX = e.clientX;
  lastY = e.clientY;
  spawnTrail(e.clientX, e.clientY, true);
});

window.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  if (!t) return;
  const dx = t.clientX - lastX;
  const dy = t.clientY - lastY;
  if (dx * dx + dy * dy < 12) return;
  spawnTrail(t.clientX, t.clientY, false);
  lastX = t.clientX;
  lastY = t.clientY;
}, { passive: true });

window.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  if (!t) return;
  lastX = t.clientX;
  lastY = t.clientY;
  spawnTrail(t.clientX, t.clientY, true);
}, { passive: true });

/* ==================== 文案逐行动画 ==================== */
(function(){
  const ps = document.querySelectorAll('.content p');
  const SLOW_START = 1.4;
  const SLOW_GAP   = 0.35;
  const LAUNCH_AT  = SLOW_START + SLOW_GAP + 0.25;
  const LAUNCH_GAP = 0.08;

  ps.forEach((p, i) => {
    if (i < 2){
      p.style.animation = `fadeUp 1.1s cubic-bezier(0.35, 0.1, 0.5, 1) ${SLOW_START + i * SLOW_GAP}s both`;
    } else {
      const d = LAUNCH_AT + (i - 2) * LAUNCH_GAP;
      p.style.animation = `fadeUpLaunch 0.6s cubic-bezier(0.85, 0, 0.9, 0.05) ${d}s both`;
    }
  });
})();

/* ==================== 彩蛋入口 ==================== */
document.getElementById('bottomName').addEventListener('click', () => {
  location.href = 'caidan.html';
});

/* ==================== 时间组件 ==================== */
const dateDom = document.getElementById('dateDom');
const timeDom = document.getElementById('timeDom');
const timeBox = document.getElementById('timeBox');
const timeFoldBtn = document.getElementById('timeFoldBtn');

function padZero(n){ return n.toString().padStart(2, '0'); }

function updateDateTime(){
  const now = new Date();
  const weekArr = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
  dateDom.innerText = `${now.getFullYear()}年${padZero(now.getMonth()+1)}月${padZero(now.getDate())}日 ${weekArr[now.getDay()]}`;
  timeDom.innerText = `${padZero(now.getHours())}:${padZero(now.getMinutes())}:${padZero(now.getSeconds())}`;
}
updateDateTime();
setInterval(updateDateTime, 1000);

timeFoldBtn.addEventListener('click', () => {
  timeBox.classList.toggle('collapsed');
  timeFoldBtn.textContent = timeBox.classList.contains('collapsed') ? '◀' : '▶';
});

/* ==================== 音乐播放器 ==================== */
const musicWrap    = document.getElementById('musicWrap');
const bgAudio      = document.getElementById('bgAudio');
const musicToggle  = document.getElementById('musicToggle');
const musicFoldBtn = document.getElementById('musicFoldBtn');
const progressWrap = document.getElementById('progressWrap');
const progressBar  = document.getElementById('progressBar');
const progressThumb= document.getElementById('progressThumb');
const curTimeDom   = document.getElementById('curTime');
const durTimeDom   = document.getElementById('durTime');
const musicTitle   = document.getElementById('musicTitle');
const musicPrev    = document.getElementById('musicPrev');
const musicNext    = document.getElementById('musicNext');

/* ★ 歌曲列表：想加歌就在这加 */
const songs = [

  { title: '老男孩',   src: 'laonanhai.mp3' },
  { title: '野心',   src: 'yexin.mp3' },
  { title: '心似烟火', src: 'xinshiyanhuo.mp3' }
  
];
let currentSong = 0;

let isDragging = false;
let hasInteracted = false;
let audioStarted = false;
const TARGET_VOLUME = 0.5;

/* 出现顺序：时间先，音乐后 */
setTimeout(() => timeBox.classList.add('show'), 1500);
setTimeout(() => musicWrap.classList.add('show'), 2000);

bgAudio.addEventListener('error', (e) => {
  console.error('❌ 音频加载失败，请检查文件是否与 HTML 在同一目录下：', e);
});
bgAudio.addEventListener('stalled', () => {
  console.warn('⚠️ 音频加载停滞，可能网络或文件路径有问题');
});

musicFoldBtn.addEventListener('click', () => {
  musicWrap.classList.toggle('collapsed');
  musicFoldBtn.textContent = musicWrap.classList.contains('collapsed') ? '◀' : '▶';
});

function formatSec(s){
  if (!isFinite(s) || s < 0) s = 0;
  return padZero(Math.floor(s / 60)) + ':' + padZero(Math.floor(s % 60));
}

bgAudio.addEventListener('play', () => {
  musicToggle.textContent = '⏸';
  musicToggle.classList.add('playing');
});
bgAudio.addEventListener('pause', () => {
  musicToggle.textContent = '▶';
  musicToggle.classList.remove('playing');
});

/* ---------- 音量淡入 ---------- */
function fadeInVolume(){
  let v = 0;
  const fade = setInterval(() => {
    v += 0.05;
    if (v >= TARGET_VOLUME){
      v = TARGET_VOLUME;
      clearInterval(fade);
    }
    bgAudio.volume = v;
  }, 50);
}

/* ---------- 首次点击页面自动播放 ---------- */
function startAudioOnce(){
  if (hasInteracted) return;
  hasInteracted = true;

  document.removeEventListener('click', onAnyClick);
  document.removeEventListener('touchend', onAnyTouch);

  bgAudio.volume = 0;
  const playPromise = bgAudio.play();

  if (playPromise && playPromise.then){
    playPromise.then(() => {
      audioStarted = true;
      fadeInVolume();
    }).catch(err => {
      console.warn('自动播放被浏览器拦截，请手动点击播放按钮：', err);
    });
  } else {
    audioStarted = true;
    fadeInVolume();
  }
}

function onAnyClick(){ startAudioOnce(); }
function onAnyTouch(){ startAudioOnce(); }

document.addEventListener('click', onAnyClick);
document.addEventListener('touchend', onAnyTouch);

/* ---------- 播放 / 暂停按钮 ---------- */
musicToggle.addEventListener('click', (e) => {
  e.stopPropagation();

  if (bgAudio.paused){
    if (!audioStarted){
      audioStarted = true;
      bgAudio.volume = TARGET_VOLUME;
    }
    bgAudio.play().catch(err => console.warn(err));
  } else {
    bgAudio.pause();
  }
});

/* ---------- 切歌函数 ---------- */
function loadSong(index){
  currentSong = (index + songs.length) % songs.length;
  const song = songs[currentSong];

  musicTitle.innerText = song.title;

  const wasPlaying = !bgAudio.paused || audioStarted;

  bgAudio.src = song.src;
  bgAudio.load();

  // 重置进度条
  progressBar.style.width = '0%';
  progressThumb.style.left = '0%';
  curTimeDom.innerText = '00:00';
  durTimeDom.innerText = '00:00';

  if (wasPlaying){
    bgAudio.volume = 0;
    bgAudio.play().then(() => {
      audioStarted = true;
      fadeInVolume();
    }).catch(err => {
      console.warn('切歌后播放失败：', err);
    });
  }
}

/* ---------- 上一首 / 下一首 ---------- */
musicPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  loadSong(currentSong - 1);
});

musicNext.addEventListener('click', (e) => {
  e.stopPropagation();
  loadSong(currentSong + 1);
});

/* ---------- 一首播完自动下一首 ---------- */
bgAudio.addEventListener('ended', () => {
  loadSong(currentSong + 1);
});

/* ---------- 初始化：载入第一首 ---------- */
loadSong(0);

/* ---------- 时长 ---------- */
function refreshDuration(){
  if (isFinite(bgAudio.duration)) durTimeDom.innerText = formatSec(bgAudio.duration);
}
bgAudio.addEventListener('loadedmetadata', refreshDuration);
bgAudio.addEventListener('durationchange', refreshDuration);

/* ---------- 进度更新 ---------- */
bgAudio.addEventListener('timeupdate', () => {
  if (isDragging) return;
  const dur = bgAudio.duration;
  if (!isFinite(dur) || dur <= 0) return;
  const pct = bgAudio.currentTime / dur;
  progressBar.style.width = (pct * 100) + '%';
  progressThumb.style.left = (pct * 100) + '%';
  curTimeDom.innerText = formatSec(bgAudio.currentTime);
});

/* ---------- 拖动进度条 ---------- */
function setProgressByX(clientX){
  const rect = progressWrap.getBoundingClientRect();
  let percent = (clientX - rect.left) / rect.width;
  percent = Math.max(0, Math.min(1, percent));
  progressBar.style.width = (percent * 100) + '%';
  progressThumb.style.left = (percent * 100) + '%';
  const dur = bgAudio.duration;
  if (isFinite(dur) && dur > 0){
    bgAudio.currentTime = percent * dur;
    curTimeDom.innerText = formatSec(bgAudio.currentTime);
  }
}

progressWrap.addEventListener('mousedown', e => {
  e.preventDefault();
  isDragging = true;
  setProgressByX(e.clientX);
});
document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  setProgressByX(e.clientX);
});
document.addEventListener('mouseup', () => { isDragging = false; });

progressWrap.addEventListener('touchstart', e => {
  isDragging = true;
  setProgressByX(e.touches[0].clientX);
}, { passive: true });
document.addEventListener('touchmove', e => {
  if (!isDragging) return;
  setProgressByX(e.touches[0].clientX);
}, { passive: true });
document.addEventListener('touchend', () => { isDragging = false; });