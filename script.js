import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getDatabase, ref, onValue, push, remove } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

// 1. Firebase Configuration
// Your API key is automatically handled via process.env.API_KEY
const firebaseConfig = {
  apiKey: "process.env.API_KEY", 
  authDomain: "reubens-monster-tracker.firebaseapp.com",
  databaseURL: "https://reubens-monster-tracker-default-rtdb.firebaseio.com",
  projectId: "reubens-monster-tracker",
  storageBucket: "reubens-monster-tracker.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};

// 2. Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 3. UI Elements
const feedEl = document.getElementById('monster-feed');
const totalCountEl = document.getElementById('total-count');
const logForm = document.getElementById('log-form');
const flavorSelect = document.getElementById('flavor-select');
const logoTrigger = document.getElementById('logo-trigger');
const adminPanel = document.getElementById('admin-panel');
const connDot = document.getElementById('connection-dot');
const connText = document.getElementById('connection-text');

const INITIAL_FLAVORS = [
  "Original Green", "Zero Ultra (White)", "Ultra Paradise", 
  "Pipeline Punch", "Mango Loco", "Nitro Super Dry", 
  "Java Mean Bean", "Rehab Tea + Lemonade", "Pacific Punch"
];

// 4. Secret Admin Toggle (3 Clicks)
let clickCount = 0;
let clickTimer;
logoTrigger.addEventListener('click', () => {
  clickCount++;
  clearTimeout(clickTimer);
  clickTimer = setTimeout(() => clickCount = 0, 1000);
  
  if (clickCount >= 3) {
    adminPanel.classList.toggle('hidden');
    clickCount = 0;
    const password = prompt("Identify yourself, Reuben:");
    if (password !== 'monster') {
      adminPanel.classList.add('hidden');
      alert("Unauthorized access denied.");
    }
  }
});

// 5. Populate Flavor Select
INITIAL_FLAVORS.forEach(f => {
  const opt = document.createElement('option');
  opt.value = f;
  opt.textContent = f;
  flavorSelect.appendChild(opt);
});

// 6. Real-time Listeners
onValue(ref(db, '.info/connected'), (snap) => {
  if (snap.val() === true) {
    connDot.className = "w-2 h-2 bg-[#71BE44] rounded-full animate-pulse";
    connText.textContent = "Live Feed Active";
    connText.className = "text-[10px] font-bold uppercase tracking-widest text-[#71BE44]";
  } else {
    connDot.className = "w-2 h-2 bg-zinc-700 rounded-full";
    connText.textContent = "Offline";
    connText.className = "text-[10px] font-bold uppercase tracking-widest text-zinc-600";
  }
});

onValue(ref(db, 'logs'), (snapshot) => {
  const data = snapshot.val();
  renderFeed(data);
});

// 7. Core Functions
function renderFeed(data) {
  feedEl.innerHTML = '';
  if (!data) {
    totalCountEl.textContent = '0';
    feedEl.innerHTML = `
      <div class="col-span-full py-20 text-center border-2 border-dashed border-zinc-900 rounded-[3rem]">
        <p class="text-zinc-500 uppercase tracking-widest font-bold text-sm">No activity detected. Fuel up, Reuben!</p>
      </div>
    `;
    return;
  }

  const logs = Object.keys(data).map(key => ({ id: key, ...data[key] }));
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  totalCountEl.textContent = logs.length;

  logs.forEach(log => {
    const date = new Date(log.timestamp);
    const card = document.createElement('div');
    card.className = "group bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-[#71BE44] transition-all duration-500 shadow-xl relative overflow-hidden";
    
    // Determine color based on flavor
    let colorClass = "border-[#71BE44] text-[#71BE44]";
    if (log.flavor.includes('Ultra')) colorClass = "border-white text-white";
    if (log.flavor.includes('Java')) colorClass = "border-orange-900 text-orange-400";

    card.innerHTML = `
      <div class="inline-block px-3 py-1 rounded-full border text-[9px] font-black tracking-widest uppercase mb-4 ${colorClass} bg-white/5">
        MONSTER
      </div>
      <h3 class="text-xl font-bold text-zinc-100 mb-6">${log.flavor}</h3>
      <div class="flex items-center justify-between border-t border-zinc-800 pt-4">
        <div class="flex flex-col">
          <span class="text-[8px] text-zinc-500 uppercase font-black tracking-[0.2em]">Logged</span>
          <span class="text-xs font-bold text-zinc-300">${date.toLocaleDateString()}</span>
        </div>
        <div class="flex flex-col text-right">
          <span class="text-[8px] text-zinc-500 uppercase font-black tracking-[0.2em]">Time</span>
          <span class="text-xs font-bold text-[#71BE44]">${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>
      <button class="delete-btn absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-700 hover:text-red-500" data-id="${log.id}">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    
    // Delete event
    card.querySelector('.delete-btn').onclick = (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if(confirm('Delete this entry?')) remove(ref(db, `logs/${id}`));
    };

    feedEl.appendChild(card);
  });
}

// 8. Handle Form Submission
logForm.onsubmit = (e) => {
  e.preventDefault();
  const flavor = flavorSelect.value;
  const timestamp = document.getElementById('log-date').value;

  if (!flavor || !timestamp) return alert('Fill in all fields, Reuben!');

  push(ref(db, 'logs'), {
    flavor,
    timestamp: new Date(timestamp).toISOString()
  });

  logForm.reset();
};

// Set default date to now
document.getElementById('log-date').value = new Date().toISOString().slice(0, 16);