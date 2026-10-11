(function () {
"use strict";
const A = window.AGENCIA, D = window.DATA;
const $ = s => document.querySelector(s);
const fmt = (n, d = 0) => n.toLocaleString("es-AR", { minimumFractionDigits: d, maximumFractionDigits: d });
const store = {
  get(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};

/* ---------- Agencia ---------- */
$("#agNombre").textContent = A.nombre;
document.title = A.nombre + " · Viajes a Disney";

/* ---------- Estado ---------- */
const iso = d => d.toISOString().slice(0, 10);
const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
const saved = store.get("viaje", null);
const state = {
  destinos: new Set(saved?.destinos || ["wdw"]),
  pax: saved?.pax || { adultos: 2, ninos: 0, bebes: 0 },
  days: Object.assign({ mk: 1, ep: 1, hs: 1, ak: 1, tl: 0, bb: 0, ds: 0, dl: 1, ca: 1, dt: 0 }, saved?.days || {}),
  extras: new Set(saved?.extras || ["Vuelo desde Buenos Aires", "Traslados aeropuerto", "Asistencia al viajero"])
};
const fields = ["fIda", "fVuelta", "hotel", "ticketTipo", "nombre", "wsp", "coment", "crNoches", "crPuerto"];

// selects desde data
D.hoteles.forEach((h, i) => { const o = new Option(h, h); if (i === 1) o.selected = true; $("#hotel").add(o); });
D.puertosCrucero.forEach(p => $("#crPuerto").add(new Option(p, p)));
$("#fIda").value = addDays(150); $("#fVuelta").value = addDays(160);
if (saved?.f) fields.forEach(id => { if (saved.f[id] != null) $("#" + id).value = saved.f[id]; });

function save() {
  const f = {}; fields.forEach(id => f[id] = $("#" + id).value);
  store.set("viaje", { destinos: [...state.destinos], pax: state.pax, days: state.days, extras: [...state.extras], f });
}

/* ---------- Destinos ---------- */
Object.entries(D.resorts).forEach(([k, v]) => {
  const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = v.name; b.dataset.k = k;
  b.onclick = () => { if (state.destinos.has(k)) { if (state.destinos.size > 1) state.destinos.delete(k); } else state.destinos.add(k); render(); };
  $("#destinos").appendChild(b);
});

/* ---------- Steppers ---------- */
function stepper(el, get, set, min, max) {
  el.innerHTML = "";
  const m = document.createElement("button"), o = document.createElement("output"), p = document.createElement("button");
  m.type = p.type = "button"; m.textContent = "−"; p.textContent = "+";
  m.setAttribute("aria-label", "Restar"); p.setAttribute("aria-label", "Sumar");
  o.textContent = get();
  m.onclick = () => { if (get() > min) { set(get() - 1); render(); } };
  p.onclick = () => { if (get() < max) { set(get() + 1); render(); } };
  el.append(m, o, p);
}
document.querySelectorAll(".stepper[data-k]").forEach(el => {
  const k = el.dataset.k; stepper(el, () => state.pax[k], v => state.pax[k] = v, k === "adultos" ? 1 : 0, 9);
});

/* ---------- Extras ---------- */
D.extras.forEach((t, i) => {
  const l = document.createElement("label"); l.className = "check"; l.htmlFor = "ex" + i;
  const c = document.createElement("input"); c.type = "checkbox"; c.id = "ex" + i; c.checked = state.extras.has(t);
  const s = document.createElement("span"); s.textContent = t;
  c.onchange = () => { c.checked ? state.extras.add(t) : state.extras.delete(t); render(); };
  l.append(c, s); $("#extras").appendChild(l);
});
fields.forEach(id => $("#" + id).addEventListener("input", render));

/* ---------- Cálculos ---------- */
function nights() { const a = new Date($("#fIda").value), b = new Date($("#fVuelta").value); const n = Math.round((b - a) / 864e5); return isFinite(n) && n > 0 ? n : 0; }
const activeParks = () => D.parks.filter(p => !p.perNight && state.destinos.has(p.r));
function walking() {
  let lo = 0, hi = 0, days = 0; const list = [];
  activeParks().forEach(p => { const d = state.days[p.id] || 0; if (d) { lo += p.km[0] * d; hi += p.km[1] * d; days += d; list.push([p, d]); } });
  if (state.destinos.has("cruise")) { const n = +$("#crNoches").value; const p = D.parks.find(x => x.id === "cr"); lo += p.km[0] * n; hi += p.km[1] * n; days += n; list.push([p, n]); }
  return { lo, hi, days, list };
}
function tickets() {
  const payers = state.pax.adultos + state.pax.ninos; let lo = 0, hi = 0; const notes = [];
  if (state.destinos.has("wdw")) {
    const td = ["mk", "ep", "hs", "ak"].reduce((s, k) => s + (state.days[k] || 0), 0);
    if (td) {
      const r = D.wdwMulti[Math.min(td, 10)]; lo += r[0] * payers; hi += r[1] * payers;
      notes.push("Orlando: entrada de " + td + " día" + (td > 1 ? "s" : "") + " a parques temáticos, USD " + fmt(r[0]) + "–" + fmt(r[1]) + " por persona según fechas (+" + fmt(D.impuestoFlorida, 1) + "% impuesto Florida).");
    }
    const wp = (state.days.tl || 0) + (state.days.bb || 0);
    if (wp) { const a = (74 * state.pax.adultos + 68 * state.pax.ninos) * wp; lo += a; hi += a; notes.push("Parques acuáticos: " + wp + " día" + (wp > 1 ? "s" : "") + "."); }
    if (state.extras.has("Lightning Lane (filas rápidas)") && td) {
      lo += D.lightningLane[0] * payers * td; hi += D.lightningLane[1] * payers * td;
      notes.push("Lightning Lane Multi Pass: USD " + D.lightningLane[0] + "–" + D.lightningLane[1] + " por persona y día.");
    }
  }
  if (state.destinos.has("dlr")) {
    const d = (state.days.dl || 0) + (state.days.ca || 0);
    if (d) { lo += 104 * payers * d; hi += 224 * payers * d; notes.push("California: USD 104–224 por día según demanda; las entradas de varios días bajan el precio diario."); }
  }
  if ($("#ticketTipo").value === "hopper") notes.push("Park Hopper suma un adicional que confirma el agente.");
  if (state.destinos.has("cruise")) notes.push("Crucero: tarifa según barco, cabina e itinerario, la cotiza el agente.");
  if (state.pax.ninos) notes.push("Niños de 3 a 9 calculados a tarifa adulto (pagan algo menos).");
  return { lo, hi, notes };
}
const fmtD = s => { if (!s) return "—"; const [y, m, d] = s.split("-"); return d + "/" + m + "/" + y.slice(2); };

/* ---------- Render viaje ---------- */
function render() {
  document.querySelectorAll("#destinos .chip").forEach(b => b.setAttribute("aria-pressed", state.destinos.has(b.dataset.k)));
  document.querySelectorAll(".stepper[data-k]").forEach(el => el.querySelector("output").textContent = state.pax[el.dataset.k]);

  const pd = $("#parkDays"); pd.innerHTML = ""; let lastR = null;
  activeParks().forEach(p => {
    if (p.r !== lastR && state.destinos.size > 1) { const h = document.createElement("div"); h.className = "eyebrow"; h.style.marginTop = "8px"; h.textContent = D.resorts[p.r].name; pd.appendChild(h); lastR = p.r; }
    const row = document.createElement("div"); row.className = "counter";
    row.innerHTML = '<div class="lbl"><b></b><small></small></div><div class="stepper"></div>';
    row.querySelector("b").textContent = p.name;
    row.querySelector("small").textContent = p.kind + " · " + fmt(p.km[0]) + "–" + fmt(p.km[1]) + " km por día";
    stepper(row.querySelector(".stepper"), () => state.days[p.id] || 0, v => state.days[p.id] = v, 0, 6);
    pd.appendChild(row);
  });
  $("#cruiseBox").hidden = !state.destinos.has("cruise");

  const n = nights(), w = walking(), t = tickets(), pax = state.pax;
  $("#rTitulo").textContent = [...state.destinos].map(k => D.resorts[k].short).join(" + ");
  const dest = state.destinos.has("dlr") && !state.destinos.has("wdw") ? "LAX" : "MCO";
  $("#rCodigo").textContent = A.aeropuertoSalida + " → " + dest;
  $("#rFechas").textContent = fmtD($("#fIda").value) + " → " + fmtD($("#fVuelta").value) + (n ? " · " + n + " n" : "");
  $("#rPax").textContent = pax.adultos + " ad" + (pax.ninos ? " · " + pax.ninos + " niñ" : "") + (pax.bebes ? " · " + pax.bebes + " beb" : "");
  if (w.days) {
    $("#rKm").innerHTML = fmt(w.lo) + "–" + fmt(w.hi) + "<small>km</small>";
    const r1k = x => fmt(Math.round(x * D.pasosPorKm / 1000) * 1000);
    $("#rPasos").textContent = r1k(w.lo) + "–" + r1k(w.hi) + " pasos en " + w.days + " día" + (w.days > 1 ? "s" : "") + " · hasta " + fmt(w.hi / w.days, 1) + " km en un día largo";
    $("#rBar").style.width = Math.min(100, (w.hi / 42.195) / 6 * 100) + "%";
    $("#rKmNota").textContent = "Equivale a unas " + fmt(((w.lo + w.hi) / 2) / 42.195, 1) + " maratones en el viaje. Barra: escala de 0 a 6 maratones.";
  } else { $("#rKm").textContent = "—"; $("#rPasos").textContent = "Sumá días de parque para calcularlo."; $("#rBar").style.width = "0"; $("#rKmNota").textContent = ""; }

  const fl = $("#rFlags"); fl.innerHTML = "";
  const flag = s => { const d = document.createElement("div"); d.className = "flag"; d.textContent = s; fl.appendChild(d); };
  if ((pax.ninos || pax.bebes) && w.days) flag("Con chicos chicos, llevá o alquilá cochecito: hasta " + fmt(w.hi / w.days) + " km en un día es mucho para piernas de 3 a 6 años.");
  if (w.days && n && w.days > n - 1) flag("Tenés " + w.days + " días de actividad en " + n + " noches: casi sin descanso. Sumá un día libre a mitad del viaje.");
  $("#rTicketsLbl").textContent = "Entradas · referencia precios públicos (" + D.actualizado + ")";
  if (t.hi) $("#rTickets").innerHTML = "USD " + fmt(t.lo) + "–" + fmt(t.hi) + "<small>total</small>"; else $("#rTickets").textContent = "A cotizar";
  $("#rTicketsNota").textContent = t.notes.join(" ");

  const L = [];
  L.push("Hola! Quiero cotizar un viaje a Disney.", "");
  L.push("Nombre: " + ($("#nombre").value || "(sin completar)"));
  L.push("WhatsApp: " + ($("#wsp").value || "(sin completar)"));
  L.push("Destino: " + [...state.destinos].map(k => D.resorts[k].name).join(" + "));
  L.push("Fechas: " + fmtD($("#fIda").value) + " al " + fmtD($("#fVuelta").value) + (n ? " (" + n + " noches)" : ""));
  L.push("Viajeros: " + pax.adultos + " adultos, " + pax.ninos + " niños (3-9), " + pax.bebes + " bebés");
  if (w.list.length) { L.push("Plan:"); w.list.forEach(([p, d]) => L.push("  - " + p.name + ": " + d + (p.perNight ? " noches" : " día" + (d > 1 ? "s" : "")))); }
  if (state.destinos.has("cruise")) L.push("Crucero: " + $("#crNoches").value + " noches desde " + $("#crPuerto").value);
  L.push("Alojamiento: " + $("#hotel").value);
  L.push("Entrada: " + $("#ticketTipo").selectedOptions[0].textContent);
  if (state.extras.size) L.push("Extras: " + [...state.extras].join(", "));
  if ($("#coment").value.trim()) L.push("Comentarios: " + $("#coment").value.trim());
  if (t.hi) L.push("", "Referencia de entradas vista en la app: USD " + fmt(t.lo) + "-" + fmt(t.hi));
  const msg = L.join("\n");
  $("#msg").textContent = msg;
  const num = String(A.whatsapp || "").replace(/\D/g, "");
  $("#btnWsp").href = "https://wa.me/" + num + "?text=" + encodeURIComponent(msg);
  save();
}
$("#btnWsp").addEventListener("click", e => {
  if (!$("#nombre").value.trim()) { e.preventDefault(); $("#toast").textContent = "Completá tu nombre en el paso 5 antes de enviar."; $("#nombre").focus(); }
  else $("#toast").textContent = "";
});
$("#btnCopy").onclick = async () => {
  const m = $("#msg").textContent;
  try { await navigator.clipboard.writeText(m); $("#toast").textContent = "Pedido copiado. Pegalo en WhatsApp o mail."; }
  catch (e) { $("#msgBox").open = true; const r = document.createRange(); r.selectNodeContents($("#msg")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); $("#toast").textContent = "Texto seleccionado: copialo con el menú del teléfono."; }
};

/* ---------- Parques ---------- */
$("#pasosPorKm").textContent = "1 km ≈ " + fmt(D.pasosPorKm) + " pasos";
let parkFilter = "wdw";
Object.entries(D.resorts).forEach(([k, v]) => {
  const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = v.short; b.dataset.k = k;
  b.onclick = () => { parkFilter = k; renderParks(); }; $("#resortFilter").appendChild(b);
});
function renderParks() {
  document.querySelectorAll("#resortFilter .chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.k === parkFilter));
  const list = D.parks.filter(p => p.r === parkFilter);
  const ch = $("#chart"); ch.innerHTML = "";
  list.forEach(p => {
    const [a, b] = p.km;
    const r = document.createElement("div"); r.className = "bar-row";
    r.innerHTML = '<span></span><div class="track"><i></i><b></b></div>';
    r.querySelector("span").textContent = p.name; r.querySelector("span").title = p.name;
    const i = r.querySelector("i"); i.style.left = (a / 20 * 100) + "%"; i.style.width = ((b - a) / 20 * 100) + "%"; if (p.est) i.classList.add("est");
    const lab = r.querySelector("b"); lab.textContent = fmt(a) + "–" + fmt(b);
    if (b > 15) { lab.style.right = (100 - a / 20 * 100) + "%"; lab.style.marginRight = "6px"; } else { lab.style.left = (b / 20 * 100) + "%"; lab.style.marginLeft = "6px"; }
    ch.appendChild(r);
  });
  const pl = $("#parkList"); pl.innerHTML = "";
  list.forEach(p => {
    const [a, b] = p.km;
    const d = document.createElement("details"); d.className = "park";
    d.innerHTML = '<summary><span class="t"><b></b><small></small></span><span class="pill"></span></summary><div class="park-body"><div class="stats"><div class="stat"><div class="k">Km/día</div><div class="v k1"></div></div><div class="stat"><div class="k">Pasos</div><div class="v k2"></div></div><div class="stat"><div class="k">Entrada 1 día</div><div class="v k3"></div></div></div><p class="w"></p><ul class="tips"></ul><p class="note src"></p></div>';
    d.querySelector("b").textContent = p.name; d.querySelector("small").textContent = p.kind;
    d.querySelector(".pill").textContent = fmt((a + b) / 2) + " km";
    d.querySelector(".k1").textContent = fmt(a) + "–" + fmt(b);
    d.querySelector(".k2").textContent = fmt(a * D.pasosPorKm / 1000) + "–" + fmt(b * D.pasosPorKm / 1000) + " mil";
    d.querySelector(".k3").textContent = p.t[1] ? (p.t[0] === p.t[1] ? "USD " + p.t[0] : "USD " + p.t[0] + "–" + p.t[1]) : (p.perNight ? "A cotizar" : "Libre");
    d.querySelector(".w").textContent = p.walk;
    const ul = d.querySelector(".tips"); p.tips.forEach(t => { const li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
    d.querySelector(".src").textContent = p.est ? "Km: estimación nuestra, sin medición publicada todavía." : "Km: rango publicado para un día completo (8 a 12 h en el parque).";
    pl.appendChild(d);
  });
}

/* ---------- Mapa ---------- */
let map = null, mapResort = "wdw", meMarker = null, accCircle = null, trailLine = null, watchId = null, last = null, follow = true;
const parkLayers = {};
const today = () => new Date().toISOString().slice(0, 10);
let walk = store.get("walk", { date: today(), km: 0 });
if (walk.date !== today()) walk = { date: today(), km: 0 };
function hav(a, b) { const R = 6371, r = x => x * Math.PI / 180; const dLa = r(b.lat - a.lat), dLo = r(b.lng - a.lng); const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }
function nearest(pos) { let best = null; D.parks.filter(p => p.lat).forEach(p => { const d = hav(pos, p); if (!best || d < best.d) best = { p, d }; }); return best; }
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

[["wdw", "Walt Disney World"], ["dlr", "Disneyland Resort"]].forEach(([k, v]) => {
  const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = v; b.dataset.k = k;
  b.onclick = () => { mapResort = k; follow = false; showResort(); }; $("#mapResort").appendChild(b);
});
function initMap() {
  if (map || !window.L) { if (!window.L) $("#geoStatus").textContent = "No se pudo cargar el mapa. Revisá la conexión."; return; }
  map = L.map("map", { zoomControl: true, attributionControl: true });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map);
  D.parks.filter(p => p.lat).forEach(p => {
    const color = p.water ? css("--ok") : p.shop ? css("--gold") : css("--sky");
    const c = L.circle([p.lat, p.lng], { radius: p.rad, color, weight: 2, fillOpacity: .12, dashArray: p.water || p.shop ? "6 5" : null }).addTo(map);
    c.bindTooltip(p.name, { permanent: true, direction: "center", className: "" });
    c.bindPopup("<b>" + p.name + "</b><br>" + fmt(p.km[0]) + "–" + fmt(p.km[1]) + " km en un día completo");
    parkLayers[p.id] = c;
  });
  map.on("dragstart", () => { follow = false; });
  trailLine = L.polyline([], { color: css("--accent"), weight: 4, opacity: .7 }).addTo(map);
  showResort();
}
function showResort() {
  document.querySelectorAll("#mapResort .chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.k === mapResort));
  if (map) { const r = D.resorts[mapResort]; map.setView(r.center, r.zoom); }
}
function updateStats(pos) {
  const n = pos ? nearest(pos) : null;
  $("#mNear").textContent = n ? n.p.name.replace("Disneyland Park", "Disneyland").split(" ").slice(0, 2).join(" ") : "—";
  $("#mDist").textContent = n ? (n.d < 1 ? fmt(n.d * 1000) + " m" : fmt(n.d, 1) + " km") : "—";
  $("#mHoy").textContent = fmt(walk.km, 1) + " km";
  Object.entries(parkLayers).forEach(([id, c]) => c.setStyle({ fillOpacity: n && n.p.id === id && n.d < 1.2 ? .3 : .12 }));
  return n;
}
function onPos(p) {
  const pos = { lat: p.coords.latitude, lng: p.coords.longitude }, acc = p.coords.accuracy;
  if (last && acc < 35) {
    const d = hav(last, pos);
    if (d > 0.008 && d < 0.5) { walk.km += d; walk.date = today(); store.set("walk", walk); last = pos; trailLine.addLatLng([pos.lat, pos.lng]); }
  } else if (!last && acc < 60) { last = pos; trailLine.addLatLng([pos.lat, pos.lng]); }
  if (!meMarker) {
    meMarker = L.marker([pos.lat, pos.lng], { icon: L.divIcon({ className: "", html: '<div class="me-marker"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), zIndexOffset: 1000 }).addTo(map);
    accCircle = L.circle([pos.lat, pos.lng], { radius: acc, color: css("--accent"), weight: 1, fillOpacity: .08 }).addTo(map);
  } else { meMarker.setLatLng([pos.lat, pos.lng]); accCircle.setLatLng([pos.lat, pos.lng]).setRadius(acc); }
  const n = updateStats(pos), st = $("#geoStatus"); st.className = "status";
  if (n && n.d < 1.2) { st.textContent = "Estás en " + n.p.name + ". Precisión ±" + Math.round(acc) + " m."; if (follow) map.setView([pos.lat, pos.lng], Math.max(map.getZoom(), 16)); }
  else st.textContent = "Estás a " + fmt(n.d, 0) + " km del parque más cercano (" + n.p.name + "). Cuando llegues, el mapa te sigue solo.";
}
$("#btnGps").onclick = () => {
  const st = $("#geoStatus");
  if (!navigator.geolocation) { st.className = "status warn"; st.textContent = "Este navegador no da acceso al GPS."; return; }
  if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; $("#btnGps").textContent = "Usar mi GPS"; st.textContent = "GPS pausado."; return; }
  st.className = "status"; st.textContent = "Buscando tu ubicación… aceptá el permiso si te lo pide."; follow = true;
  watchId = navigator.geolocation.watchPosition(onPos, err => {
    st.className = "status warn";
    st.textContent = err.code === 1 ? "No diste permiso de ubicación. Activalo en la configuración del navegador para este sitio." : "No pudimos obtener tu ubicación. Probá al aire libre.";
    navigator.geolocation.clearWatch(watchId); watchId = null; $("#btnGps").textContent = "Usar mi GPS";
  }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
  $("#btnGps").textContent = "Pausar GPS";
  if ("wakeLock" in navigator) navigator.wakeLock.request("screen").catch(() => {});
};
$("#btnReset").onclick = () => { walk = { date: today(), km: 0 }; store.set("walk", walk); last = null; if (trailLine) trailLine.setLatLngs([]); updateStats(null); };

/* ---------- Tabs ---------- */
function showTab(tab) {
  document.querySelectorAll("nav.tabs button").forEach(x => x.setAttribute("aria-selected", x.dataset.tab === tab));
  ["viaje", "parques", "mapa"].forEach(t => $("#tab-" + t).hidden = t !== tab);
  window.scrollTo({ top: 0 });
  if (tab === "mapa") { initMap(); setTimeout(() => map && map.invalidateSize(), 50); }
  if (location.hash !== "#" + tab) history.replaceState(null, "", "#" + tab);
}
document.querySelectorAll("nav.tabs button").forEach(b => b.onclick = () => showTab(b.dataset.tab));

/* ---------- Instalar ---------- */
let deferred = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; $("#btnInstall").hidden = false; });
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent), standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
if (isIOS && !standalone) $("#btnInstall").hidden = false;
$("#btnInstall").onclick = async () => {
  if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; $("#btnInstall").hidden = true; }
  else if (isIOS) $("#iosSheet").hidden = false;
};
$("#iosClose").onclick = () => $("#iosSheet").hidden = true;
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));

render(); renderParks(); updateStats(null);
const h = location.hash.slice(1); if (["viaje", "parques", "mapa"].includes(h)) showTab(h);
})();
