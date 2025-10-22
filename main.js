// ========== SMART HOME MAIN SCRIPT (FIXED VERSION) ==========

// Data perangkat
const devices = {
  lamp_tamu: { name: "Lampu Ruang Tamu", power: 40 },
  lamp_garasi: { name: "Lampu Garasi", power: 30 },
  lamp_keluarga: { name: "Lampu Keluarga", power: 50 },
  ac_utama: { name: "AC Utama", power: 900 },
  ac_kamar: { name: "AC Kamar", power: 700 },
  tv_keluarga: { name: "TV Keluarga", power: 200 },
  mw_dapur: { name: "Microwave Dapur", power: 1200 },
  mw_mini: { name: "Microwave Mini", power: 800 },
  fridge_utama: { name: "Kulkas Utama", power: 150 },
  fridge_mini: { name: "Kulkas Mini", power: 100 },
};

// Aman: pastikan tombol toggle ada dulu
document.querySelectorAll(".toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.device;
    const current = JSON.parse(localStorage.getItem(id)) || { status: "OFF" };
    const newStatus = current.status === "ON" ? "OFF" : "ON";

    localStorage.setItem(
      id,
      JSON.stringify({
        status: newStatus,
        lastChange: Date.now(),
        usage: current.usage || 0,
      })
    );

    updateButtonUI(btn, newStatus === "ON");

    if (newStatus === "ON") startDeviceTimer(id);
    else stopDeviceTimer(id);

    updateDashboard();
  });
});

// Saat halaman dimuat
window.addEventListener("load", () => {
  document.querySelectorAll(".toggle").forEach(btn => {
    const id = btn.dataset.device;
    const saved = JSON.parse(localStorage.getItem(id)) || {};
    const isOn = saved.status === "ON";
    updateButtonUI(btn, isOn);
    if (isOn) startDeviceTimer(id);
  });
  updateDashboard();
});

// Aman: update dashboard hanya jika elemen ada
function updateDashboard() {
  const groups = {
    lampSummary: ["lamp_tamu", "lamp_garasi", "lamp_keluarga"],
    acSummary: ["ac_utama", "ac_kamar"],
    tvSummary: ["tv_keluarga"],
    mwSummary: ["mw_dapur", "mw_mini"],
    fridgeSummary: ["fridge_utama", "fridge_mini"],
  };

  let totalPower = 0;

  for (let key in groups) {
    const el = document.getElementById(key);
    if (!el) continue;

    const devs = groups[key];
    const anyOn = devs.some(d => {
      const info = JSON.parse(localStorage.getItem(d));
      if (info?.status === "ON") totalPower += devices[d]?.power || 0;
      return info?.status === "ON";
    });

    el.textContent = anyOn ? "ON" : "OFF";
    el.style.color = anyOn ? "green" : "red";
  }

  const summary = document.getElementById("summary");
  if (summary) {
    let powerEl = document.getElementById("powerDisplay");
    if (!powerEl) {
      powerEl = document.createElement("p");
      powerEl.id = "powerDisplay";
      summary.appendChild(powerEl);
    }
    powerEl.innerHTML = `⚡ Total Daya: <b>${totalPower} W</b>`;
  }
}

// Fungsi tombol
function updateButtonUI(btn, isOn) {
  btn.textContent = isOn ? "ON" : "OFF";
  btn.classList.toggle("on", isOn);
  btn.style.backgroundColor = isOn ? "#388e3c" : "#d32f2f";
}

// Timer untuk durasi ON
const activeTimers = {};

function startDeviceTimer(id) {
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

function stopDeviceTimer(id) {
  if (activeTimers[id]) {
    clearInterval(activeTimers[id]);
    delete activeTimers[id];
  }
}

// Sinkronisasi antar halaman
window.addEventListener("storage", e => {
  if (devices[e.key]) updateDashboard();
});
