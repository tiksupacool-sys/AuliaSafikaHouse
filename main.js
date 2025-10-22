// ========== SMART HOME CONTROL SCRIPT ==========// ========== SMART HOME DASHBOARD (🔥 COOL & CLEAN VERSION) ==========
// Control Panel for Smart Devices – Power Tracking & Toggle System

// ==========================
// === Device Definitions ===
// ==========================
const devices = {
  lamp_tamu:      { name: "Lampu Ruang Tamu", power: 40 },
  lamp_garasi:    { name: "Lampu Garasi", power: 30 },
  lamp_keluarga:  { name: "Lampu Keluarga", power: 50 },
  ac_utama:       { name: "AC Utama", power: 900 },
  ac_kamar:       { name: "AC Kamar", power: 700 },
  tv_keluarga:    { name: "TV Keluarga", power: 200 },
  mw_dapur:       { name: "Microwave Dapur", power: 1200 },
  mw_mini:        { name: "Microwave Mini", power: 800 },
  fridge_utama:   { name: "Kulkas Utama", power: 150 },
  fridge_mini:    { name: "Kulkas Mini", power: 100 },
};

// ========================
// === Initial Setups 🚀 ===
// ========================
window.addEventListener("load", () => {
  document.querySelectorAll(".toggle").forEach(btn => {
    const id = btn.dataset.device;
    const state = JSON.parse(localStorage.getItem(id)) || {};
    const isActive = state.status === "ON";

    setToggleUI(btn, isActive);
    if (isActive) runPowerTimer(id);
  });

  refreshDashboard();
});

// ==============================
// === Toggle Handler 💡🔌 ===
// ==============================
document.querySelectorAll(".toggle").forEach(btn => {
  btn.addEventListener("click", () => toggleDevice(btn));
});

function toggleDevice(btn) {
  const id = btn.dataset.device;
  const current = JSON.parse(localStorage.getItem(id)) || { status: "OFF", usage: 0 };
  const newState = current.status === "ON" ? "OFF" : "ON";

  localStorage.setItem(id, JSON.stringify({
    status: newState,
    lastChange: Date.now(),
    usage: current.usage || 0,
  }));

  setToggleUI(btn, newState === "ON");
  newState === "ON" ? runPowerTimer(id) : stopPowerTimer(id);
  refreshDashboard();
}

// ==========================
// === UI & Power Summary ===
// ==========================
function setToggleUI(btn, isOn) {
  btn.textContent = isOn ? "ON" : "OFF";
  btn.classList.toggle("on", isOn);
  btn.style.backgroundColor = isOn ? "#43a047" : "#e53935";
}

function refreshDashboard() {
  const categories = {
    lampSummary:   ["lamp_tamu", "lamp_garasi", "lamp_keluarga"],
    acSummary:     ["ac_utama", "ac_kamar"],
    tvSummary:     ["tv_keluarga"],
    mwSummary:     ["mw_dapur", "mw_mini"],
    fridgeSummary: ["fridge_utama", "fridge_mini"],
  };

  let totalPower = 0;

  for (const [summaryId, deviceList] of Object.entries(categories)) {
    const summaryEl = document.getElementById(summaryId);
    if (!summaryEl) continue;

    const anyOn = deviceList.some(id => {
      const info = JSON.parse(localStorage.getItem(id));
      if (info?.status === "ON") {
        totalPower += devices[id]?.power || 0;
        return true;
      }
      return false;
    });

    summaryEl.textContent = anyOn ? "ON" : "OFF";
    summaryEl.style.color = anyOn ? "#4caf50" : "#f44336";
  }

  // Show total power
  const summaryContainer = document.getElementById("summary");
  if (summaryContainer) {
    let powerEl = document.getElementById("powerDisplay");
    if (!powerEl) {
      powerEl = document.createElement("p");
      powerEl.id = "powerDisplay";
      summaryContainer.appendChild(powerEl);
    }

    powerEl.innerHTML = `⚡ <strong>${totalPower} W</strong> sedang digunakan`;
  }
}

// ===========================
// === Power Usage Tracker ===
// ===========================
const powerTimers = {};

function runPowerTimer(id) {
  if (powerTimers[id]) return;

  powerTimers[id] = setInterval(() => {
    const data = JSON.parse(localStorage.getItem(id)) || {};
    if (data.status !== "ON") {
      stopPowerTimer(id);
      return;
    }

    data.usage = (data.usage || 0) + 1;
    localStorage.setItem(id, JSON.stringify(data));
  }, 1000);
}

function stopPowerTimer(id) {
  clearInterval(powerTimers[id]);
  delete powerTimers[id];
}

// ================================
// === Cross-tab Sync Magic 🪄 ===
// ================================
window.addEventListener("storage", e => {
  if (devices[e.key]) refreshDashboard();
});


