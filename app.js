// ========================
// Flashcards data (Electronics only)
// ========================
const CARDS = [
  {
    q: "Vacuum tubes primarily control the flow of what?",
    choices: ["Electrons in a vacuum","Protons in plasma","Photons in fiber","Neutrons in graphite"],
    correct: 0,
    hint: "Think electron valves."
  },
  {
    q: "Which tube type can amplify signals?",
    choices: ["Diode tube","Triode tube","CRT","Phototube"],
    correct: 1,
    hint: "It has a control grid."
  },
  {
    q: "What does a diode tube do?",
    choices: ["Amplifies signals","Oscillates light","One-way current flow","Measures capacitance"],
    correct: 2,
    hint: "Like a rectifier."
  },
  {
    q: "CRT stands for",
    choices: ["Controlled Resistor Transducer","Cathode Ray Tube","Current Relay Terminal","Capacitive Ray Transceiver"],
    correct: 1,
    hint: "Old TVs used it."
  },
  {
    q: "Why did transistors replace vacuum tubes?",
    choices: ["Tubes are cooler","Transistors are smaller, efficient, durable","Tubes are cheaper","Transistors need glass"],
    correct: 1,
    hint: "Size and efficiency won."
  },
  {
    q: "Valence electrons are",
    choices: ["Electrons in the outermost shell","Protons in the nucleus","Free neutrons","Electrons at 0 K"],
    correct: 0,
    hint: "They set bonding and conduction."
  },
  {
    q: "Conductors typically have how many valence electrons?",
    choices: ["1","2","4","8"],
    correct: 0,
    hint: "Copper is a clue."
  },
  {
    q: "Semiconductors like Si and Ge have",
    choices: ["1 valence electron","2 valence electrons","4 valence electrons","8 valence electrons"],
    correct: 2,
    hint: "Midway between conductor and insulator."
  },
  {
    q: "Insulators usually have",
    choices: ["1 valence electron","4 valence electrons","7 or 8 valence electrons","No electrons"],
    correct: 2,
    hint: "Tightly bound outer shells."
  },
  {
    q: "Microchips are made by integrating many",
    choices: ["Vacuum tubes on glass","Transistors on silicon","Resistors on wood","Batteries in series"],
    correct: 1,
    hint: "Millions to billions today."
  },
  {
    q: "A phototube is mainly used to",
    choices: ["Detect light","Amplify audio","Rectify AC","Store charge"],
    correct: 0,
    hint: "Think light meters."
  },
  {
    q: "Gas discharge tubes are used in",
    choices: ["Neon lights and surge protectors","Microprocessors","Solar panels","Batteries"],
    correct: 0,
    hint: "Glowy signs and protection."
  }
];

// ========================
// State & helpers
// ========================
const $ = sel => document.querySelector(sel);
const progressEl = $("#progress");
const scoreEl = $("#score");
const qEl = $("#question");
const listEl = $("#choices");
const hintBtn = $("#hintBtn");
const hintText = $("#hintText");
const nextBtn = $("#nextBtn");
const reviewBtn = $("#reviewBtn");
const restartBtn = $("#restartBtn");

const KEY = "flashcards-electronics-v1";
const saved = JSON.parse(localStorage.getItem(KEY) || "{}");

let order = saved.order || shuffle([...Array(CARDS.length).keys()]);
let idx = clamp(saved.idx ?? 0, 0, CARDS.length - 1);
let score = saved.score ?? 0;
let best = saved.best ?? 0;
let wrongBank = saved.wrongBank || []; // store indexes of missed questions
let reviewMode = saved.reviewMode || false;

function persist() {
  localStorage.setItem(KEY, JSON.stringify({ order, idx, score, best, wrongBank, reviewMode }));
}
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ========================
// Rendering
// ========================
function render() {
  const sequence = reviewMode ? wrongBank : order;
  const total = sequence.length || 1;
  const cardIndex = sequence.length ? sequence[idx % sequence.length] : order[0];
  const card = CARDS[cardIndex];

  progressEl.textContent = `Q ${Math.min(idx+1, total)} / ${total}`;
  scoreEl.textContent = `Score: ${score}${best ? ` (Best: ${best})` : ""}`;
  qEl.textContent = card.q;

  listEl.innerHTML = "";
  hintText.hidden = true;
  hintText.textContent = card.hint;

  card.choices.forEach((c, i) => {
    const li = document.createElement("li");
    li.className = "choice";
    li.setAttribute("role", "option");
    li.tabIndex = 0;
    li.dataset.index = i;
    li.innerHTML = `<span class="index">${i+1}.</span> ${c}`;
    li.addEventListener("click", () => check(i, cardIndex));
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); check(i, cardIndex); }
    });
    listEl.appendChild(li);
  });

  nextBtn.disabled = true;
  persist();
}

function check(choice, cardIndex){
  // prevent multiple grading
  if ([...listEl.children].some(li => li.classList.contains("correct") || li.classList.contains("incorrect"))) return;

  const card = CARDS[cardIndex];
  [...listEl.children].forEach((li, i) => {
    li.classList.toggle("correct", i === card.correct);
    if (i === choice && choice !== card.correct) li.classList.add("incorrect");
  });

  if (choice === card.correct) {
    score++;
  } else {
    if (!wrongBank.includes(cardIndex)) wrongBank.push(cardIndex);
  }

  nextBtn.disabled = false;
  if (score > best) best = score;
  persist();
}

function next() {
  const sequence = reviewMode ? wrongBank : order;
  if (sequence.length === 0) return;
  idx++;
  if (idx >= sequence.length) {
    // finished one pass
    idx = 0;
    // If we were in review mode and all were answered once, reshuffle
    if (reviewMode) shuffle(wrongBank);
    else shuffle(order);
  }
  render();
}

function restart() {
  order = shuffle([...Array(CARDS.length).keys()]);
  idx = 0; score = 0; wrongBank = []; reviewMode = false;
  render();
}

function toggleReview() {
  if (wrongBank.length === 0) {
    alert("No wrong answers yet to review. Keep practicing!");
    return;
  }
  reviewMode = !reviewMode;
  idx = 0; score = 0;
  render();
  reviewBtn.textContent = reviewMode ? "Exit review (R)" : "Review wrong (R)";
}

// ========================
// Events
// ========================
hintBtn.addEventListener("click", () => {
  const open = hintText.hidden;
  hintText.hidden = !open;
  hintBtn.setAttribute("aria-expanded", String(open));
  hintBtn.textContent = open ? "Hide hint (H)" : "Show hint (H)";
});

nextBtn.addEventListener("click", next);
restartBtn.addEventListener("click", restart);
reviewBtn.addEventListener("click", toggleReview);

window.addEventListener("keydown", (e) => {
  if (e.key >= "1" && e.key <= "4") {
    const i = Number(e.key) - 1;
    const sequence = reviewMode ? wrongBank : order;
    const cardIndex = sequence.length ? sequence[idx % sequence.length] : order[0];
    check(i, cardIndex);
  }
  if (e.key.toLowerCase() === "h") hintBtn.click();
  if (e.key.toLowerCase() === "n") nextBtn.click();
  if (e.key.toLowerCase() === "r") reviewBtn.click();
});

// Initial paint
render();
