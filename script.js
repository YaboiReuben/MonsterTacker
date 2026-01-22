import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set, remove } from "firebase/database";
import { GoogleGenAI } from "@google/genai";

// --- FIREBASE CONFIGURATION ---
// REPLACE THESE VALUES WITH YOUR FIREBASE PROJECT CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- INITIAL STATE ---
let state = {
    logs: [],
    flavors: [],
    isAdmin: false
};

// --- DOM ELEMENTS ---
const monsterFeed = document.getElementById('monster-feed');
const monsterCount = document.getElementById('monster-count');
const emptyState = document.getElementById('empty-state');
const logoTrigger = document.getElementById('logo-trigger');
const adminIndicator = document.getElementById('admin-indicator');
const passwordModal = document.getElementById('password-modal');
const adminPanel = document.getElementById('admin-panel');
const logsTableBody = document.getElementById('logs-table-body');
const flavorSelect = document.getElementById('flavor-select');
const syncStatusDot = document.getElementById('sync-status-dot');
const syncStatusText = document.getElementById('sync-status-text');

// --- DATABASE SYNCING ---

// Sync Flavors
onValue(ref(db, 'flavors'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        state.flavors = Object.values(data);
    } else {
        // Seed default flavors if empty
        const defaults = [
            "Monster Energy Original Green \"OG\"",
            "Monster Energy Zero Sugar",
            "Monster Energy Nitro Super Dry",
            "Ultra Zero Ultra (White)",
            "Ultra Strawberry Dreams",
            "Juice Monster Mango Loco",
            "Rehab Tea + Lemonade"
        ];
        defaults.forEach(f => {
            push(ref(db, 'flavors'), f);
        });
    }
    render();
});

// Sync Logs
onValue(ref(db, 'logs'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        // Convert object to array and include Firebase keys as IDs
        state.logs = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));
    } else {
        state.logs = [];
    }
    
    // Update Connection UI
    syncStatusDot.className = "w-2 h-2 bg-green-500 rounded-full animate-pulse";
    syncStatusText.textContent = "Real-time sync active";
    
    render();
});

// --- RENDER FUNCTIONS ---
function render() {
    // Render Feed
    monsterFeed.innerHTML = '';
    if (state.logs.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        // Sort logs by date descending
        [...state.logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(log => {
            const card = createMonsterCard(log);
            monsterFeed.appendChild(card);
        });
    }

    // Stats
    monsterCount.textContent = state.logs.length;

    // Admin UI
    if (state.isAdmin) {
        adminIndicator.classList.remove('hidden');
        renderAdminTables();
        updateFlavorSelect();
    }
}

function createMonsterCard(log) {
    const date = new Date(log.timestamp);
    const div = document.createElement('div');
    div.className = 'monster-card p-6 rounded-2xl flex flex-col justify-between h-full';
    
    let color = '#71BE44';
    if (log.flavor.toLowerCase().includes('ultra')) color = '#ffffff';
    if (log.flavor.toLowerCase().includes('juice')) color = '#f97316';
    if (log.flavor.toLowerCase().includes('rehab')) color = '#facc15';

    div.innerHTML = `
        <div>
            <span class="inline-block px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest mb-4" style="border-color: ${color}; color: ${color}">
                ${log.flavor.split(' ')[0]}
            </span>
            <h3 class="text-lg font-bold leading-tight text-zinc-100">${log.flavor}</h3>
        </div>
        <div class="mt-8 flex justify-between items-end border-t border-zinc-800 pt-4">
            <div class="text-[10px] text-zinc-500 uppercase font-bold">
                <p>Date</p>
                <span class="text-zinc-300 text-xs">${date.toLocaleDateString()}</span>
            </div>
            <div class="text-[10px] text-zinc-500 uppercase font-bold text-right">
                <p>Time</p>
                <span class="text-[#71BE44] text-xs">${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        </div>
    `;
    return div;
}

function renderAdminTables() {
    logsTableBody.innerHTML = [...state.logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(log => `
        <tr class="border-b border-zinc-800 hover:bg-white/5 transition-colors">
            <td class="p-4 font-bold">${log.flavor}</td>
            <td class="p-4 text-zinc-500 font-mono text-xs">${new Date(log.timestamp).toLocaleDateString()}</td>
            <td class="p-4 text-right">
                <button onclick="window.deleteLog('${log.id}')" class="text-zinc-600 hover:text-red-500 p-2"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        </tr>
    `).join('');
}

function updateFlavorSelect() {
    flavorSelect.innerHTML = state.flavors.map(f => `<option value="${f}">${f}</option>`).join('');
}

// --- INTERACTION LOGIC ---
let clickCount = 0;
let clickTimer;
logoTrigger.addEventListener('click', () => {
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 1000);
    if (clickCount >= 3) {
        passwordModal.classList.remove('hidden');
        clickCount = 0;
    }
});

document.getElementById('auth-btn').addEventListener('click', () => {
    const pass = document.getElementById('admin-pass').value;
    if (pass === 'monster') {
        state.isAdmin = true;
        passwordModal.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        render();
    } else {
        alert('ACCESS DENIED');
    }
    document.getElementById('admin-pass').value = '';
});

document.getElementById('close-pass-btn').addEventListener('click', () => passwordModal.classList.add('hidden'));
document.getElementById('close-admin-btn').addEventListener('click', () => adminPanel.classList.add('hidden'));
document.getElementById('open-admin-btn').addEventListener('click', () => adminPanel.classList.remove('hidden'));

// --- LOGGING ---
document.getElementById('submit-log-btn').addEventListener('click', () => {
    const flavor = flavorSelect.value;
    const timeValue = document.getElementById('log-time').value;
    const time = timeValue ? new Date(timeValue).toISOString() : new Date().toISOString();
    
    if (!flavor) return;
    
    push(ref(db, 'logs'), {
        flavor: flavor,
        timestamp: time
    });
    
    // Reset form
    document.getElementById('log-time').value = new Date().toISOString().slice(0, 16);
});

document.getElementById('add-flavor-btn').addEventListener('click', () => {
    const input = document.getElementById('new-flavor-input');
    const name = input.value.trim();
    if (name && !state.flavors.includes(name)) {
        push(ref(db, 'flavors'), name);
        input.value = '';
    }
});

window.deleteLog = (id) => {
    if (confirm('Permanently delete this record from Firebase?')) {
        remove(ref(db, `logs/${id}`));
    }
};

// --- AI ANALYSIS ---
document.getElementById('ai-insight-btn').addEventListener('click', async () => {
    const btn = document.getElementById('ai-insight-btn');
    const output = document.getElementById('ai-output');
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Reading History...';
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const history = state.logs.map(l => l.flavor).join(', ');
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Act as a hilarious, edgy energy drink sommelier. Analyze Reuben's consumption history from his Realtime Database: ${history}. Give him a "Caffeine Persona" name and a 2-sentence witty analysis. Mention his favorite flavor if evident. Keep it brief.`
        });
        
        output.innerHTML = `<i class="fa-solid fa-quote-left mr-2 opacity-50"></i> ${response.text}`;
        output.classList.remove('hidden');
    } catch (e) {
        output.innerHTML = "AI Analysis is only available when a valid Gemini API Key is provided in the environment settings.";
        output.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-brain"></i> Generate AI Consumption Report';
    }
});

// --- INITIALIZE ---
document.getElementById('log-time').value = new Date().toISOString().slice(0, 16);
render();