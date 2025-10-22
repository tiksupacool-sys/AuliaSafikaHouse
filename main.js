// ========== SMART HOME CONTROL SCRIPT ==========
// Versi: Final (Professional Refactor)
// Fungsi: Mengelola status perangkat, konsumsi daya, dan UI smart home

// ========================
// === Data Perangkat ===
// ========================
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

// ==============================
// === Event Listener Toggle ===
// ==============================
document.querySelectorAll(".toggle").forEach(button => {
  button.addEventListener("click", () => handleToggle(button));
});

// ============================
// === Inisialisasi Halaman ===
// ============================
window.addEventListener("load", () => {
  document.querySelectorAll(".toggle").forEach(button => {
    const id = button.dataset.device;
    const savedState = JSON.parse(localStorage.getItem(id)) || {};
    const isOn = savedState.status === "ON";

    updateButtonUI(button, isOn);
    if (isOn) startUsageTimer(id);
  });

  updateDashboard();
});

// ===============================
// === Fungsi Toggle Perangkat ===
// ===============================
function handleToggle(button) {
  const id = button.dataset.device;
  const current = JSON.parse(localStorage.getItem(id)) || { status: "OFF", usage: 0 };
  const newStatus = current.status === "ON" ? "OFF" : "ON";

  // Simpan status baru
  localStorage.setItem(id, JSON.stringify({
    status: newStatus,
    lastChange: Date.now(),
    usage: current.usage || 0,
  }));

  // Update UI & timer
  updateButtonUI(button, newStatus === "ON");

  newStatus === "ON" ? startUsageTimer(id) : stopUsageTimer(id);
  updateDashboard();
}

// =============================
// === Update Tampilan UI ===
// =============================
function updateButtonUI(button, isOn) {
  button.textContent = isOn ? "ON" : "OFF";
  button.classList.toggle("on", isOn);
  button.style.backgroundColor = isOn ? "#388e3c" : "#d32f2f";
}

// =======================================
// === Update Ringkasan & Konsumsi Daya ===
// =======================================
function updateDashboard() {
  const groupMap = {
    lampSummary:     ["lamp_tamu", "lamp_garasi", "lamp_keluarga"],
    acSummary:       ["ac_utama", "ac_kamar"],
    tvSummary:       ["tv_keluarga"],
    mwSummary:       ["mw_dapur", "mw_mini"],
    fridgeSummary:   ["fridge_utama", "fridge_mini"],
  };

  let totalPower = 0;

  for (const groupId in groupMap) {
    const summaryEl = document.getElementById(groupId);
    if (!summaryEl) continue;

    const devicesInGroup = groupMap[groupId];
    const anyActive = devicesInGroup.some(id => {
      const data = JSON.parse(localStorage.getItem(id));
      if (data?.status === "ON") {
        totalPower += devices[id]?.power || 0;
        return true;
      }
      return false;
    });

    summaryEl.textContent = anyActive ? "ON" : "OFF";
    summaryEl.style.color = anyActive ? "green" : "red";
  }

  // Tampilkan total daya
  const summaryEl = document.getElementById("summary");
  if (summaryEl) {
    let powerEl = document.getElementById("powerDisplay");
    if (!powerEl) {
      powerEl = document.createElement("p");
      powerEl.id = "powerDisplay";
      summaryEl.appendChild(powerEl);
    }

    powerEl.innerHTML = `⚡ Total Daya: <b>${totalPower} W</b>`;
  }
}

// ==========================
// === Timer Pemakaian ON ===
// ==========================
const activeTimers = {};

function startUsageTimer(id) {
  if (activeTimers[id]) return;

  activeTimers[id] = setInterval(() => {
    const data = JSON.parse(localStorage.getItem(id)) || {};
    if (data.status !== "ON") {
      clearInterval(activeTimers[id]);
      delete activeTimers[id];
      return;
    }

    data.usage = (data.usage || 0) + 1;
    localStorage.setItem(id, JSON.stringify(data));
  }, 1000);
}

function stopUsageTimer(id) {
  if (activeTimers[id]) {
    clearInterval(activeTimers[id]);
    delete activeTimers[id];
  }
}

// ===========================================
// === Sinkronisasi antar Tab / Jendela ===
// ===========================================
window.addEventListener("storage", e => {
  if (devices[e.key]) {
    updateDashboard();
  }
});
