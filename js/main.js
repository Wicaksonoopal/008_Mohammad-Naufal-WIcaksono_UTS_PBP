// bentuk animasi transisi
function generateWavyPolygon(cx, cy, r, phase = 0) {
  const numPoints = 72;
  if (r <= 0.5) {
    const pt = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
    return `polygon(${new Array(numPoints).fill(pt).join(", ")})`;
  }
  const points = [];
  const step = (2 * Math.PI) / numPoints;
  for (let i = 0; i < numPoints; i++) {
    const theta = i * step;
    const wave = 1 + 0.085 * Math.sin(7 * theta + phase) + 0.035 * Math.cos(14 * theta + phase * 1.6);
    const px = cx + r * wave * Math.cos(theta) * 1.25;
    const py = cy + r * wave * Math.sin(theta) * 1.05;
    points.push(`${px.toFixed(1)}px ${py.toFixed(1)}px`);
  }
  return `polygon(${points.join(", ")})`;
}

function calculateTargetRadius(origin) {
  const maxDist = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y)
  );
  return Math.ceil(maxDist * 1.2);
}

// titik transisi
function getOrigin(evt) {
  if (evt && evt.submitter) {
    const r = evt.submitter.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  if (evt && typeof evt.clientX === "number" && (evt.clientX > 0 || evt.clientY > 0)) {
    return { x: evt.clientX, y: evt.clientY };
  }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

// sfx
const sfx = new Audio("assets/sfx.mp3");
sfx.preload = "auto";
sfx.volume = 0.6;

function mainkanSfx() {
  if (musik.muted) return;
  sfx.currentTime = 0;
  sfx.play().catch(() => {});
}

const transisi = document.getElementById("transisi");

// membuat keyframes animasi transisi
function buatFrames(origin, skala = 1) {
  const r = calculateTargetRadius(origin) * skala;
  return [
    { clipPath: generateWavyPolygon(origin.x, origin.y, 0, 0) },
    { clipPath: generateWavyPolygon(origin.x + 22, origin.y - 12, r * 0.45, 1.2), offset: 0.38 },
    { clipPath: generateWavyPolygon(origin.x + 10, origin.y - 5, r * 0.85, 2.2), offset: 0.7 },
    { clipPath: generateWavyPolygon(origin.x, origin.y, r, 3.4) },
  ];
}

let sedangTransisi = false;

// membuka halaman dari titik transisi
function bukaHalaman(dari, ke, evt) {
  if (sedangTransisi) return;
  sedangTransisi = true;
  mainkanSfx();

  const origin = getOrigin(evt);
  const opsi = {
    duration: 900,
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    fill: "forwards",
  };

  ke.classList.remove("d-none");
  ke.scrollTop = 0;
  transisi.classList.remove("d-none");
  dari.style.zIndex = 1;
  transisi.style.zIndex = 2;
  ke.style.zIndex = 3;

  transisi.animate(buatFrames(origin, 1.12), opsi);
  const anim = ke.animate(buatFrames(origin), opsi);

  anim.onfinish = () => {
    dari.classList.add("d-none");
    transisi.classList.add("d-none");
    dari.style.zIndex = "";
    transisi.style.zIndex = "";
    ke.style.zIndex = "";
    transisi.getAnimations().forEach((a) => a.cancel());
    try { anim.cancel(); } catch (_) {}
    sedangTransisi = false;
  };
}

// menutup halaman ke titik transisi
function tutupHalaman(dari, ke, evt) {
  if (sedangTransisi) return;
  sedangTransisi = true;
  mainkanSfx();

  const origin = getOrigin(evt);
  const opsi = {
    duration: 800,
    easing: "cubic-bezier(0.11, 0, 0.5, 0)",
    fill: "forwards",
    direction: "reverse",
  };

  ke.classList.remove("d-none");
  ke.scrollTop = 0;
  transisi.classList.remove("d-none");
  ke.style.zIndex = 1;
  transisi.style.zIndex = 2;
  dari.style.zIndex = 3;

  transisi.animate(buatFrames(origin, 1.12), opsi);
  const anim = dari.animate(buatFrames(origin), opsi);

  anim.onfinish = () => {
    dari.classList.add("d-none");
    transisi.classList.add("d-none");
    dari.style.zIndex = "";
    transisi.style.zIndex = "";
    ke.style.zIndex = "";
    transisi.getAnimations().forEach((a) => a.cancel());
    try { anim.cancel(); } catch (_) {}
    sedangTransisi = false;
  };
}


// elemen
const cover = document.getElementById("cover");
const mempelai = document.getElementById("mempelai");
const acara = document.getElementById("acara");
const rsvp = document.getElementById("rsvp");
const terimakasih = document.getElementById("terimakasih");
const formRsvp = document.getElementById("form-rsvp");
const btnOpen = document.getElementById("btn-open");
const musik = document.getElementById("musik");
const btnMusik = document.getElementById("btn-musik");
musik.volume = 0.2;


// musik
btnMusik.addEventListener("click", () => {
  musik.muted = !musik.muted;
  btnMusik.classList.toggle("muted", musik.muted);
  btnMusik.setAttribute("aria-label", musik.muted ? "Nyalakan suara" : "Matikan suara");
});


// navigasi halaman
// play musik
btnOpen.addEventListener("click", (e) => {
  musik.play().catch(() => {});
  btnMusik.classList.remove("d-none");
  bukaHalaman(cover, mempelai, e);
});

// mempelai -> cover
document.getElementById("btn-cover").addEventListener("click", (e) => {
  tutupHalaman(mempelai, cover, e);
});

// mempelai -> acara
document.getElementById("btn-acara").addEventListener("click", (e) => {
  bukaHalaman(mempelai, acara, e);
});

// acara -> mempelai
document.getElementById("btn-kembali").addEventListener("click", (e) => {
  tutupHalaman(acara, mempelai, e);
});

// acara -> rsvp
document.getElementById("btn-rsvp").addEventListener("click", (e) => {
  bukaHalaman(acara, rsvp, e);
});

// rsvp -> acara
document.getElementById("btn-rsvp-kembali").addEventListener("click", (e) => {
  tutupHalaman(rsvp, acara, e);
});

// kirim rsvp -> terima kasih
formRsvp.addEventListener("submit", (e) => {
  e.preventDefault();
  bukaHalaman(rsvp, terimakasih, e);
});

// terima kasih -> cover
document.getElementById("btn-ke-cover").addEventListener("click", (e) => {
  formRsvp.reset();
  tutupHalaman(terimakasih, cover, e);
});


// hitung mundur akad
const target = new Date("2026-10-30T15:00:00+07:00").getTime();

function updateCountdown() {
  const selisih = target - Date.now();

  if (selisih <= 0) {
    ["hari", "jam", "menit", "detik"].forEach((id) => {
      document.getElementById("cd-" + id).textContent = "0";
    });
    return;
  }

  const detik = Math.floor(selisih / 1000);
  document.getElementById("cd-hari").textContent = Math.floor(detik / 86400);
  document.getElementById("cd-jam").textContent = Math.floor((detik % 86400) / 3600);
  document.getElementById("cd-menit").textContent = Math.floor((detik % 3600) / 60);
  document.getElementById("cd-detik").textContent = detik % 60;
}

updateCountdown();
setInterval(updateCountdown, 1000);