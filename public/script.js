const mn = document.getElementById("mn");
const simModes = document.getElementById("simModes");
const simStatusText = document.getElementById("simStatusText");
const fakeBrowserBar = document.getElementById("fakeBrowserBar");
const simProxBtn = document.getElementById("simProxBtn");

const PAGES = ["music", "pomo", "water", "shelf", "todo"];
const THEMES = {
  dusk: ["#FFB7C5", "#E2D1F9", "#A2E4F5"],
  cyber: ["#19b8ff", "#2d5bff", "#7b4bff"],
  racing: ["#ff1e42", "#ff8800", "#1e3cff"],
  emerald: ["#10b981", "#059669", "#34d399"],
  sunset: ["#ff6b6b", "#feca57", "#ff9ff3"],
};
const NOTE_SVG = `<svg class="music-note-svg" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;

const MODE_LABELS = {
  pet: "Mode Idle: MangCat (Cyber-Neko) melirik, berkedip & menggerakkan telinga secara organik",
  idle: "Mode Idle Jam & Equalizer: Menampilkan cincin baterai, waktu, dan bar equalizer",
  "idle-lyrics":
    "Mode Idle Lyrics: Judul lagu di kiri & 1 baris lirik real-time di kanan dengan gradasi album",
  music:
    "Mode Music: Klik ikon kutip di kiri bawah untuk membuka Live Lyrics atau panah < > untuk geser halaman",
  lyrics:
    "Mode Live Lyrics: Klik baris lirik untuk melompat (seek) ke detik lagu tersebut",
  pomo: "Mode Pomodoro Timer: Dilengkapi Tomat Chronograph SVG & chime Web Audio API",
  water:
    "Mode Water Tracker: Klik tombol + 250 ml untuk mengisi tangki air & mendengar chime",
  shelf:
    "Mode File Shelf: Klik tombol Clear di atas untuk mengosongkan atau tarik file dari komputer",
  todo: "Mode TodoList: Klik + Add Task untuk mengetik tugas baru langsung di dalam Notch",
  peek: "Mode System Peek: Pop-up otomatis saat menekan Caps Lock atau mencolok Charger",
  minimal:
    "Smart Proximity Active: Notch menyusut ke 6px agar tab Chrome & tombol + bebas diklik!",
};

let pageIdx = 0;
let isLyricsOpen = false;
let restingMode = "pet";
let mascotStyle = "neko";
let browserObstructed = false;
let isPlaying = true;

// Web Audio API Chime Synthesizer (Sama persis dengan aplikasi asli)
let audioCtx = null;
function playChime(type) {
  try {
    if (!audioCtx)
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    const notes =
      type === "pomo" ? [523.25, 659.25, 783.99, 1046.5] : [587.33, 880.0];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.11);
      gain.gain.setValueAtTime(0.001, now + idx * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.14, now + idx * 0.11 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.11 + 0.65);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + idx * 0.11);
      osc.stop(now + idx * 0.11 + 0.7);
    });
  } catch {}
}

function renderMascot() {
  const box = document.getElementById("mascotBox");
  if (mascotStyle === "visor") {
    box.innerHTML = `<div class="visor-bar"><div class="visor-Dot"></div></div>`;
  } else if (mascotStyle === "kitsune") {
    box.innerHTML = `<div class="kitsune-wrap"><i class="kit-eye"></i><i class="kit-eye"></i></div>`;
  } else {
    box.innerHTML = `
      <div class="neko-stage" id="nekoStage">
        <span class="neko-ear left"></span>
        <div class="neko-eye-wrap">
          <i class="neko-eye left"></i>
          <i class="neko-eye right"></i>
        </div>
        <span class="neko-ear right"></span>
      </div>`;
  }
}

setInterval(() => {
  const stage = document.getElementById("nekoStage");
  if (!stage) return;
  if (isPlaying && Math.random() < 0.55) {
    stage.classList.add("happy");
    setTimeout(() => stage.classList.remove("happy"), 1800);
  } else {
    stage.classList.remove("happy");
  }
}, 5200);

function changeSimMascot(style) {
  mascotStyle = style;
  renderMascot();
  setSimulatorState("pet");
}

function changeSimTheme(preset) {
  const [c1, c2, c3] = THEMES[preset] || THEMES.dusk;
  document.documentElement.style.setProperty("--c1", c1);
  document.documentElement.style.setProperty("--c2", c2);
  document.documentElement.style.setProperty("--c3", c3);
}

function setSimulatorState(stateName) {
  mn.dataset.s = stateName;
  document.querySelectorAll("#simModes .mode-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === stateName);
  });
  simStatusText.textContent = MODE_LABELS[stateName] || "";
}

function nextPage() {
  isLyricsOpen = false;
  pageIdx = (pageIdx + 1) % PAGES.length;
  setSimulatorState(PAGES[pageIdx]);
}

function prevPage() {
  isLyricsOpen = false;
  pageIdx = (pageIdx - 1 + PAGES.length) % PAGES.length;
  setSimulatorState(PAGES[pageIdx]);
}

function goToPage(idx) {
  isLyricsOpen = false;
  pageIdx = idx;
  setSimulatorState(PAGES[pageIdx]);
}

function toggleLyrics(open) {
  isLyricsOpen = open;
  setSimulatorState(open ? "lyrics" : "music");
  if (open) syncLyricScroll();
}

simModes.addEventListener("click", (e) => {
  const btn = e.target.closest(".mode-btn");
  if (!btn) return;
  const mode = btn.dataset.mode;
  if (browserObstructed) {
    browserObstructed = false;
    fakeBrowserBar.classList.remove("show");
    simProxBtn.classList.remove("active");
  }
  if (["pet", "idle", "idle-lyrics"].includes(mode)) {
    restingMode = mode;
  }
  if (PAGES.includes(mode)) {
    pageIdx = PAGES.indexOf(mode);
    isLyricsOpen = false;
  } else if (mode === "lyrics") {
    pageIdx = 0;
    isLyricsOpen = true;
  }
  setSimulatorState(mode);
});

// Hover pada Notch Simulator
mn.addEventListener("mouseenter", () => {
  if (browserObstructed) return;
  if (["pet", "idle"].includes(mn.dataset.s)) {
    setSimulatorState(PAGES[pageIdx]);
  } else if (mn.dataset.s === "idle-lyrics") {
    setSimulatorState("lyrics");
  }
});

// Wheel scroll horizontal/vertical di atas Notch untuk ganti halaman
mn.addEventListener("wheel", (e) => {
  if (!PAGES.includes(mn.dataset.s)) return;
  e.preventDefault();
  if (e.deltaX + e.deltaY > 0) nextPage();
  else prevPage();
});

// Smart Proximity Browser Tab Simulation
function toggleBrowserObstruction() {
  browserObstructed = !browserObstructed;
  fakeBrowserBar.classList.toggle("show", browserObstructed);
  simProxBtn.classList.toggle("active", browserObstructed);
  if (browserObstructed) {
    setSimulatorState("minimal");
  } else {
    setSimulatorState(restingMode);
  }
}

function addFakeTab() {
  playChime("water");
  simStatusText.textContent =
    "Tombol + Chrome berhasil diklik tanpa terhalang Notch!";
}

// ================= 1. DEMO TRACKS & SYNCED LYRICS =================
const DEMO_TRACKS = [
  {
    title: "Nod-Krai",
    artist: "HOYO-MiX — Genshin Impact",
    duration: 48,
    grad: "linear-gradient(90deg, #244b7a, #3b76ad 50%, #1e3c63)",
    art: "linear-gradient(135deg, #3a6073, #16222a)",
    lyrics: [
      { time: 0, text: "♪", isNote: true },
      { time: 4, text: "Potius nox tegat lumina" },
      { time: 11, text: "Quam in falsa luce esse" },
      { time: 18, text: "Carmen triste nos non canimus" },
      { time: 26, text: "Sub lunae frigido vultu" },
      { time: 34, text: "In umbra silenti manemus" },
      { time: 42, text: "♪", isNote: true },
    ],
  },
  {
    title: "Lower One's Eyes",
    artist: "25-ji, Nightcord de.",
    duration: 44,
    grad: "linear-gradient(90deg, #3b1d38, #6e3562 50%, #2a1730)",
    art: "linear-gradient(135deg, #ff758c, #7b4bff)",
    lyrics: [
      { time: 0, text: "♪", isNote: true },
      { time: 4, text: "Trapped inside a fading dream" },
      { time: 11, text: "Warm dusk colors the silent room" },
      { time: 19, text: "Tracing echoes on the glass" },
      { time: 27, text: "Until the morning light returns" },
      { time: 36, text: "♪", isNote: true },
    ],
  },
];

let trackIdx = 0;
let curPos = 19;
let curDur = DEMO_TRACKS[0].duration;
let parsedLyrics = DEMO_TRACKS[0].lyrics;
let lastActiveLyrIdx = -1;

function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec));
  return (
    String(Math.floor(sec / 60)).padStart(2, "0") +
    ":" +
    String(sec % 60).padStart(2, "0")
  );
}

function loadDemoTrack(idx) {
  trackIdx = (idx + DEMO_TRACKS.length) % DEMO_TRACKS.length;
  const tr = DEMO_TRACKS[trackIdx];
  curPos = 5;
  curDur = tr.duration;
  parsedLyrics = tr.lyrics;
  lastActiveLyrIdx = -1;

  document
    .querySelectorAll(".js-title")
    .forEach((e) => (e.textContent = tr.title));
  document
    .querySelectorAll(".js-artist")
    .forEach((e) => (e.textContent = tr.artist));
  document
    .querySelectorAll(".js-art")
    .forEach((e) => (e.style.backgroundImage = tr.art));
  document.documentElement.style.setProperty("--lyr-glow", tr.grad);

  const lyrList = document.getElementById("lyrList");
  lyrList.innerHTML = parsedLyrics
    .map(
      (l, i) =>
        `<li onclick="seekToSec(${l.time})" data-idx="${i}">${l.isNote ? NOTE_SVG : l.text}</li>`,
    )
    .join("");
  updateMediaUI();
}

function simTogglePlay() {
  isPlaying = !isPlaying;
  document
    .querySelectorAll(".js-bars")
    .forEach((b) => b.classList.toggle("playing", isPlaying));
  const playPath = isPlaying ? "M7 5h4v14H7zM13 5h4v14h-4z" : "M8 5v14l11-7z";
  document
    .querySelectorAll(".js-play-icon path")
    .forEach((p) => p.setAttribute("d", playPath));
}
function simNextTrack() {
  loadDemoTrack(trackIdx + 1);
}
function simPrevTrack() {
  loadDemoTrack(trackIdx - 1);
}

function seekToSec(sec) {
  curPos = Math.max(0, Math.min(curDur, sec));
  updateMediaUI();
}
function seekBarClick(e, barEl) {
  const rect = barEl.getBoundingClientRect();
  const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  seekToSec(frac * curDur);
}

function syncLyricScroll() {
  if (!parsedLyrics.length) return;
  let activeIdx = 0;
  for (let i = 0; i < parsedLyrics.length; i++) {
    if (curPos >= parsedLyrics[i].time) activeIdx = i;
    else break;
  }
  if (activeIdx === lastActiveLyrIdx) return;
  lastActiveLyrIdx = activeIdx;

  const lyrList = document.getElementById("lyrList");
  const items = lyrList.querySelectorAll("li");
  items.forEach((li, i) => li.classList.toggle("on", i === activeIdx));
  const activeEl = items[activeIdx];
  if (activeEl) {
    lyrList.style.transform = `translateY(${52 - activeEl.offsetTop - activeEl.offsetHeight / 2}px)`;
  }
  const idleLyrText = document.getElementById("idleLyrText");
  const activeLine = parsedLyrics[activeIdx];
  idleLyrText.textContent = activeLine.isNote
    ? "Instrumental..."
    : activeLine.text;
}

function updateMediaUI() {
  document
    .querySelectorAll(".js-pos")
    .forEach((e) => (e.textContent = fmtTime(curPos)));
  document
    .querySelectorAll(".js-rem")
    .forEach(
      (e) => (e.textContent = "-" + fmtTime(Math.max(0, curDur - curPos))),
    );
  const pct = curDur > 0 ? Math.min(100, (curPos / curDur) * 100) : 0;
  document
    .querySelectorAll(".js-prog")
    .forEach((e) => (e.style.width = pct + "%"));
  syncLyricScroll();
}

setInterval(() => {
  if (isPlaying) {
    curPos += 0.2;
    if (curPos >= curDur) curPos = 0;
    updateMediaUI();
  }
}, 200);

// ================= 2. POMODORO =================
let pomoTotalSec = 25 * 60;
let pomoRemSec = 25 * 60;
let pomoRunning = false;

function updatePomoRing() {
  document.getElementById("pomoTime").textContent = fmtTime(pomoRemSec);
  const frac = pomoTotalSec > 0 ? 1 - pomoRemSec / pomoTotalSec : 0;
  document.getElementById("pomoRingArc").style.strokeDashoffset = (
    201 * frac
  ).toFixed(1);
}
function setPomoMode(mins, label) {
  pomoRunning = false;
  pomoTotalSec = mins * 60;
  pomoRemSec = pomoTotalSec;
  document.getElementById("pomoLabel").textContent = label;
  document.getElementById("pomoPlaySvg").innerHTML =
    `<path d="M8 5v14l11-7z"/>`;
  updatePomoRing();
}
function togglePomo() {
  pomoRunning = !pomoRunning;
  document.getElementById("pomoPlaySvg").innerHTML = pomoRunning
    ? `<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>`
    : `<path d="M8 5v14l11-7z"/>`;
  if (pomoRunning) playChime("pomo");
}
setInterval(() => {
  if (pomoRunning && pomoRemSec > 0) {
    pomoRemSec--;
    updatePomoRing();
  }
}, 1000);

// ================= 3. WATER REMINDER =================
let waterCurr = 750,
  waterGoal = 1500,
  waterCup = 250;

function updateWaterUI() {
  const pct = Math.min(100, Math.round((waterCurr / waterGoal) * 100));
  const totalCups = 6;
  const drunkCups = Math.floor(waterCurr / waterCup);

  document.getElementById("waterCurr").textContent = (waterCurr / 1000).toFixed(
    2,
  );
  document.getElementById("waterGoalTxt").textContent =
    `/ ${(waterGoal / 1000).toFixed(1)} L`;
  document.getElementById("waterSubTxt").textContent =
    `${drunkCups} dari ${totalCups} gelas hari ini`;
  document.getElementById("waterPctBig").textContent = pct + "%";
  document.getElementById("waterWave").style.height = pct + "%";

  let cupsHtml = "";
  for (let i = 0; i < totalCups; i++) {
    cupsHtml += `<span class="cup-dot ${i < drunkCups ? "filled" : ""}"></span>`;
  }
  document.getElementById("cupsRow").innerHTML = cupsHtml;
}
function drinkWater() {
  waterCurr = Math.min(waterGoal, waterCurr + waterCup);
  playChime("water");
  updateWaterUI();
}
function resetWater() {
  waterCurr = 0;
  updateWaterUI();
}

// ================= 4. FILE SHELF =================
const shelfZone = document.getElementById("shelfZone");
const shelfItems = document.getElementById("shelfItems");
const shelfClearBtn = document.getElementById("shelfClearBtn");
let filesOnShelf = [
  { name: "redbull-cbr250rr.png", ext: "PNG" },
  { name: "laporan-algoritma.pdf", ext: "PDF" },
  { name: "chord-the-absurd.txt", ext: "TXT" },
];

function renderShelf() {
  if (!filesOnShelf.length) {
    shelfZone.style.display = "flex";
    shelfItems.style.display = "none";
    shelfClearBtn.style.display = "none";
    return;
  }
  shelfZone.style.display = "none";
  shelfItems.style.display = "flex";
  shelfClearBtn.style.display = "flex";

  shelfItems.innerHTML = filesOnShelf
    .map(
      (f, i) => `
    <div class="sh-card" title="Di aplikasi asli: Tahan & Geser keluar ke WhatsApp/Discord atau Klik untuk buka">
      <span class="sh-del" onclick="removeShelfItem(event, ${i})">
        <svg viewBox="0 0 10 10"><path d="M2 2l6 6M8 2L2 8"/></svg>
      </span>
      <svg class="f-ico" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
      <span class="sh-name">${f.name}</span>
      <span class="sh-ext">${f.ext}</span>
    </div>
  `,
    )
    .join("");
}
function removeShelfItem(e, i) {
  e.stopPropagation();
  filesOnShelf.splice(i, 1);
  renderShelf();
}
function clearShelf() {
  filesOnShelf = [];
  renderShelf();
}
function restoreSampleShelf() {
  filesOnShelf = [
    { name: "redbull-cbr250rr.png", ext: "PNG" },
    { name: "laporan-algoritma.pdf", ext: "PDF" },
  ];
  renderShelf();
}

// ================= 5. TO-DO LIST =================
let todos = [
  { text: "Selesaikan UI MangNotch", done: true },
  { text: "Fix Smart Proximity Chrome", done: true },
  { text: "Push source code ke GitHub", done: false },
];
const addTodoBtn = document.getElementById("addTodoBtn");
const todoInput = document.getElementById("todoInlineInput");

function renderTodos() {
  const doneCount = todos.filter((t) => t.done).length;
  document.getElementById("todoCount").textContent =
    `${doneCount}/${todos.length}`;
  const listEl = document.getElementById("todoList");
  if (!todos.length) {
    listEl.innerHTML = `<div class="dim" style="font-size:11px;margin:auto 0;text-align:center">Belum ada tugas hari ini</div>`;
    return;
  }
  listEl.innerHTML = todos
    .map(
      (t, i) => `
    <div class="trow ${t.done ? "done" : ""}" onclick="toggleTodo(${i})">
      <div class="trow-left">
        <span class="chk"><svg viewBox="0 0 10 10"><path d="M2 5l2.2 2.2L8 2.5"/></svg></span>
        <span>${t.text}</span>
      </div>
      <span class="tdel" onclick="deleteTodo(event, ${i})">
        <svg viewBox="0 0 10 10"><path d="M2 2l6 6M8 2L2 8"/></svg>
      </span>
    </div>
  `,
    )
    .join("");
}
function toggleTodo(i) {
  todos[i].done = !todos[i].done;
  renderTodos();
}
function deleteTodo(ev, i) {
  ev.stopPropagation();
  todos.splice(i, 1);
  renderTodos();
}
function showTodoInput() {
  addTodoBtn.style.display = "none";
  todoInput.style.display = "block";
  todoInput.value = "";
  todoInput.focus();
}
function hideTodoInput() {
  todoInput.style.display = "none";
  addTodoBtn.style.display = "flex";
}
todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && todoInput.value.trim()) {
    todos.push({ text: todoInput.value.trim(), done: false });
    renderTodos();
    hideTodoInput();
  } else if (e.key === "Escape") {
    hideTodoInput();
  }
});
todoInput.addEventListener("blur", hideTodoInput);

// Clock & Init
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function updateClock() {
  const d = new Date();
  const t =
    String(d.getHours()).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0");
  document.querySelectorAll(".js-time").forEach((e) => (e.textContent = t));
  document
    .querySelectorAll(".js-date")
    .forEach(
      (e) =>
        (e.textContent = `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`),
    );
}
updateClock();
setInterval(updateClock, 5000);

renderMascot();
loadDemoTrack(0);
updateWaterUI();
renderShelf();
renderTodos();

// ================= 6. CUSTOM SELECT LOGIC (Live Demo Dropdown) =================
function toggleCS(listId) {
  // Tutup dropdown lain yang sedang terbuka
  document.querySelectorAll('.custom-select').forEach(cs => {
    if(!cs.querySelector('#' + listId)) {
      cs.classList.remove('open');
    }
  });
  
  const list = document.getElementById(listId);
  if(list) {
    list.parentElement.classList.toggle('open');
  }
}

function selectCS(type, val, text, event) {
  let wrapperId = type === 'mascot' ? 'mascotCustomSelect' : 'themeCustomSelect';
  let wrapper = document.getElementById(wrapperId);
  
  // Update Teks Label & State
  wrapper.querySelector('.cs-val').textContent = text;
  wrapper.dataset.value = val;
  wrapper.classList.remove('open');

  // Hapus class active dari list sebelumnya dan pindahkan ke yang di-klik
  wrapper.querySelectorAll('.cs-opt').forEach(opt => opt.classList.remove('active'));
  if (event) {
    event.target.classList.add('active');
  }

  // Panggil fungsi asli MangNotch
  if(type === 'mascot') changeSimMascot(val);
  if(type === 'theme') changeSimTheme(val);
}

// Menutup dropdown jika user klik di luar area
document.addEventListener('click', (e) => {
  if(!e.target.closest('.custom-select')) {
    document.querySelectorAll('.custom-select.open').forEach(cs => cs.classList.remove('open'));
  }
});