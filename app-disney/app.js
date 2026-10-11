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
document.title = A.nombre + " · Disney y Universal";

/* ---------- Estado ---------- */
const iso = d => d.toISOString().slice(0, 10);
const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
const saved = store.get("viaje", null);
const state = {
  destinos: new Set(saved?.destinos || ["wdw"]),
  pax: saved?.pax || { adultos: 2, ninos: 0, bebes: 0 },
  days: Object.assign({ mk: 1, ep: 1, hs: 1, ak: 1, tl: 0, bb: 0, ds: 0, dl: 1, ca: 1, dt: 0, usf: 1, ioa: 1, epu: 1, vb: 0, cw: 0, ush: 1 }, saved?.days || {}),
  extras: new Set(saved?.extras || ["Vuelo desde Buenos Aires", "Traslados aeropuerto", "Asistencia al viajero"]),
  compras: saved?.compras ?? 1,
  plan: saved?.plan || "qs",
  eventos: new Set(saved?.eventos || [])
};
const fields = ["fIda", "fVuelta", "hotel", "ticketTipo", "nombre", "wsp", "coment", "crNoches", "crPuerto"];

// selects desde data
D.hoteles.forEach((h, i) => { const o = new Option(h, h); if (i === 1) o.selected = true; $("#hotel").add(o); });
D.puertosCrucero.forEach(p => $("#crPuerto").add(new Option(p, p)));
$("#fIda").value = addDays(150); $("#fVuelta").value = addDays(160);
if (saved?.f) fields.forEach(id => { if (saved.f[id] != null) $("#" + id).value = saved.f[id]; });

function save() {
  const f = {}; fields.forEach(id => f[id] = $("#" + id).value);
  store.set("viaje", { destinos: [...state.destinos], pax: state.pax, days: state.days, extras: [...state.extras], compras: state.compras, plan: state.plan, eventos: [...state.eventos], f });
}

/* ---------- Destinos ---------- */
Object.entries(D.resorts).forEach(([k, v]) => {
  const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.dataset.k = k;
  const nm = document.createElement("span"); nm.textContent = v.name; const bd = document.createElement("span"); bd.className = "badge"; b.append(nm, bd);
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

stepper($("#comprasStep"), () => state.compras, v => state.compras = v, 0, 6);

/* ---------- Eventos ---------- */
function tripRange() { const a = $("#fIda").value, b = $("#fVuelta").value; return a && b && b >= a ? [a, b] : null; }
function eventsFor(r) { const t = tripRange(); if (!t) return []; return (D.eventos || []).filter(e => (!r || e.r === r) && e.from <= t[1] && e.to >= t[0]); }
const activeEvents = () => eventsFor().filter(e => state.destinos.has(e.r));
const fmtShort = s => { const [y, m, d] = s.split("-"); return +d + " " + ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"][+m - 1]; };
function renderEventos() {
  const box = $("#eventos"); box.innerHTML = "";
  const list = activeEvents();
  const tit = $("#evTitulo");
  if (!tripRange()) { tit.textContent = "Eventos en tus fechas"; box.innerHTML = '<p class="note">Elegí fechas en el paso 1 para ver los eventos.</p>'; return; }
  if (!list.length) {
    tit.textContent = "No hay eventos en tus fechas";
    const card = document.createElement("div"); card.className = "evento vacio";
    const t = document.createElement("b"); t.textContent = "Sin eventos especiales en esas fechas";
    const p = document.createElement("p"); p.textContent = "Los parques funcionan normal, con sus shows y fuegos de todos los días.";
    card.append(t, p);
    const t2 = tripRange()[1];
    const next = (D.eventos || []).filter(e => state.destinos.has(e.r) && e.from > t2).sort((x, y) => x.from.localeCompare(y.from))[0];
    if (next) { const n = document.createElement("small"); n.textContent = "El próximo: " + next.name + " (" + D.resorts[next.r].short + "), desde el " + fmtShort(next.from) + " de " + next.from.slice(0, 4) + (next.aprox ? ", fecha aproximada" : "") + "."; card.appendChild(n); }
    box.appendChild(card); return;
  }
  tit.textContent = "Eventos en tus fechas (" + list.length + ")";
  list.forEach(e => {
    const card = document.createElement(e.extra ? "label" : "div"); card.className = "evento" + (e.extra ? " sel" : "");
    const top = document.createElement("div"); top.className = "ev-top";
    const t = document.createElement("b"); t.textContent = e.name;
    const tag = document.createElement("span"); tag.className = "pill" + (e.extra ? " pill-extra" : ""); tag.textContent = e.extra ? "Entrada aparte" : "Incluido";
    top.append(t, tag);
    const meta = document.createElement("small"); meta.textContent = D.resorts[e.r].short + " · " + e.place + " · " + fmtShort(e.from) + " al " + fmtShort(e.to) + (e.noches ? " (algunas noches)" : "") + (e.aprox ? " · fechas aproximadas" : "");
    const desc = document.createElement("p"); desc.textContent = e.desc;
    card.append(top, meta, desc);
    if (e.extra) {
      const row = document.createElement("div"); row.className = "ev-add";
      const c = document.createElement("input"); c.type = "checkbox"; c.id = "ev-" + e.id; c.checked = state.eventos.has(e.id);
      c.onchange = () => { c.checked ? state.eventos.add(e.id) : state.eventos.delete(e.id); render(); };
      const l = document.createElement("span"); l.textContent = "Sumar al pedido" + (e.price ? " · USD " + e.price[0] + "–" + e.price[1] + " por persona" : " · precio a cotizar");
      row.append(c, l); card.appendChild(row); card.htmlFor = c.id;
    }
    box.appendChild(card);
  });
}

/* ---------- Extras ---------- */
D.extras.forEach((t, i) => {
  const l = document.createElement("label"); l.className = "check"; l.htmlFor = "ex" + i;
  const c = document.createElement("input"); c.type = "checkbox"; c.id = "ex" + i; c.checked = state.extras.has(t);
  const s = document.createElement("span"); s.textContent = t;
  c.onchange = () => { c.checked ? state.extras.add(t) : state.extras.delete(t); render(); };
  l.append(c, s); $("#extras").appendChild(l);
});
// Plan de comidas: opciones y aclaración
const planBox = document.createElement("div"); planBox.id = "planBox"; planBox.className = "planbox"; planBox.hidden = true;
planBox.innerHTML = '<b>Plan de comidas de Disney</b><p class="note">Solo existe en Walt Disney World (Orlando) y solo si te alojás en un hotel de Disney. Se contrata para todas las noches del hotel y para todas las personas de la habitación.</p><div class="planopts"></div><p class="note" id="planEst"></p>';
D.planesComida.forEach(pl => {
  const l = document.createElement("label"); l.className = "planopt" + (pl.off ? " off" : ""); l.htmlFor = "plan-" + pl.id;
  const r = document.createElement("input"); r.type = "radio"; r.name = "plan"; r.id = "plan-" + pl.id; r.value = pl.id; r.disabled = !!pl.off; r.checked = state.plan === pl.id;
  r.onchange = () => { state.plan = pl.id; render(); };
  const tx = document.createElement("div"); const t = document.createElement("b"); t.textContent = pl.name + (pl.off ? " · no disponible" : " · ≈ USD " + pl.price + " por adulto por noche");
  const d = document.createElement("small"); d.textContent = pl.desc; tx.append(t, d); l.append(r, tx);
  planBox.querySelector(".planopts").appendChild(l);
});
$("#extras").after(planBox);
fields.forEach(id => $("#" + id).addEventListener("input", render));

/* ---------- Cálculos ---------- */
function nights() { const a = new Date($("#fIda").value), b = new Date($("#fVuelta").value); const n = Math.round((b - a) / 864e5); return isFinite(n) && n > 0 ? n : 0; }
const activeParks = () => D.parks.filter(p => !p.perNight && state.destinos.has(p.r));
function walking() {
  let lo = 0, hi = 0, days = 0; const list = [];
  activeParks().forEach(p => { const d = state.days[p.id] || 0; if (d) { lo += p.km[0] * d; hi += p.km[1] * d; days += d; list.push([p, d]); } });
  if (state.destinos.has("cruise")) { const n = +$("#crNoches").value; const p = D.parks.find(x => x.id === "cr"); lo += p.km[0] * n; hi += p.km[1] * n; days += n; list.push([p, n]); }
  if (state.compras) { lo += D.comprasKm[0] * state.compras; hi += D.comprasKm[1] * state.compras; days += state.compras; }
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
    if (state.extras.has("Lightning Lane (filas rápidas Disney)") && td) {
      lo += D.lightningLane[0] * payers * td; hi += D.lightningLane[1] * payers * td;
      notes.push("Lightning Lane Multi Pass: USD " + D.lightningLane[0] + "–" + D.lightningLane[1] + " por persona y día.");
    }
  }
  if (state.destinos.has("dlr")) {
    const d = (state.days.dl || 0) + (state.days.ca || 0);
    if (d) { lo += 104 * payers * d; hi += 224 * payers * d; notes.push("California: USD 104–224 por día según demanda; las entradas de varios días bajan el precio diario."); }
  }
  let open = false; // true cuando hay precios "desde" sin máximo publicado
  if (state.destinos.has("uor")) {
    const ud = ["usf", "ioa", "epu"].reduce((s, k) => s + (state.days[k] || 0), 0);
    if (ud) {
      const n = Math.min(ud, 5), hopper = $("#ticketTipo").value === "hopper";
      let perDay = hopper ? D.uorParkToPark[n] : D.uorDesde[n];
      if (!hopper && ud === 1 && state.days.epu) perDay = 139;
      if (!hopper && ud === 2 && state.days.epu) perDay = D.uorDesdeConEpic2;
      const a = perDay * ud * payers; lo += a; hi += a; open = true;
      notes.push("Universal Orlando: " + ud + " día" + (ud > 1 ? "s" : "") + " de parque desde USD " + fmt(perDay) + " por persona y día" + (hopper ? " (park-to-park)" : "") + "; en temporada alta cuesta más.");
      if (state.extras.has("Universal Express (filas rápidas Universal)")) { lo += D.universalExpress[0] * payers * ud; hi += D.universalExpress[1] * payers * ud; notes.push("Universal Express: USD " + D.universalExpress[0] + "–" + D.universalExpress[1] + " por persona y día."); }
    }
    if (state.days.vb) { const a = 80 * payers * state.days.vb; lo += a; hi += a; open = true; notes.push("Volcano Bay: desde USD 80 por día."); }
  }
  if (state.destinos.has("ush") && state.days.ush) {
    lo += D.ushDia[0] * payers * state.days.ush; hi += D.ushDia[1] * payers * state.days.ush;
    notes.push("Universal Hollywood: USD " + D.ushDia[0] + "–" + D.ushDia[1] + " por día según fecha.");
  }
  activeEvents().filter(e => e.extra && state.eventos.has(e.id)).forEach(e => {
    if (e.price) { lo += e.price[0] * payers; hi += e.price[1] * payers; notes.push(e.name + ": USD " + e.price[0] + "–" + e.price[1] + " por persona según la noche."); }
    else notes.push(e.name + ": precio según la noche, lo cotiza el agente.");
  });
  if ($("#ticketTipo").value === "hopper") notes.push("Park Hopper suma un adicional que confirma el agente.");
  if (state.destinos.has("cruise")) notes.push("Crucero: tarifa según barco, cabina e itinerario, la cotiza el agente.");
  if (state.pax.ninos) notes.push("Niños de 3 a 9 calculados a tarifa adulto (pagan algo menos).");
  return { lo, hi, notes, open };
}
const fmtD = s => { if (!s) return "—"; const [y, m, d] = s.split("-"); return d + "/" + m + "/" + y.slice(2); };

/* ---------- Render viaje ---------- */
function render() {
  document.querySelectorAll("#destinos .chip").forEach(b => { b.setAttribute("aria-pressed", state.destinos.has(b.dataset.k)); const c = eventsFor(b.dataset.k).length; b.querySelector(".badge").textContent = c ? c + (c > 1 ? " eventos" : " evento") : ""; });
  document.querySelectorAll("#comprasStep output").forEach(o => o.textContent = state.compras);
  renderEventos();
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
  const wantsPlan = state.extras.has("Plan de comidas");
  $("#planBox").hidden = !wantsPlan;
  if (wantsPlan) {
    const pl = D.planesComida.find(x => x.id === state.plan) || D.planesComida[0], nn = nights(), est = $("#planEst");
    const warn = [];
    if (!state.destinos.has("wdw")) warn.push("Elegiste destinos sin Walt Disney World: el plan no aplica.");
    if (!$("#hotel").value.startsWith("Hotel Disney")) warn.push("Para tener plan de comidas el hotel tiene que ser de Disney.");
    est.textContent = warn.length ? warn.join(" ") : (nn ? "Estimado para tu viaje: ≈ USD " + fmt(pl.price * nn * state.pax.adultos) + " (" + state.pax.adultos + " adulto" + (state.pax.adultos > 1 ? "s" : "") + " × " + nn + " noches). Niños de 3 a 9: precio infantil; en algunas fechas Disney los da gratis." : "");
    est.className = "note" + (warn.length ? " warn" : "");
  }

  const n = nights(), w = walking(), t = tickets(), pax = state.pax;
  $("#rTitulo").textContent = [...state.destinos].map(k => D.resorts[k].short).join(" + ");
  const aps = [...new Set([...state.destinos].map(k => D.resorts[k].airport))];
  $("#rCodigo").textContent = A.aeropuertoSalida + " → " + aps.join(" · ");
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
  const need = w.days ? w.days + 1 : 0;
  $("#rNoches").innerHTML = n ? n + "<small>noches elegidas</small>" : "—";
  const ajustar = $("#btnAjustar");
  if (!w.days) { $("#rNochesNota").textContent = ""; ajustar.hidden = true; }
  else {
    const pdays = w.list.filter(([p]) => !p.perNight).reduce((x, [, d]) => x + d, 0);
    const plan = w.days + " día" + (w.days > 1 ? "s" : "") + " de actividad (" + pdays + " de parques" + (state.compras ? ", " + state.compras + " de compras" : "") + (state.destinos.has("cruise") ? ", crucero" : "") + ") + llegada y salida";
    if (n < need) {
      $("#rNochesNota").textContent = plan + ": te conviene quedarte " + need + " noches. " + (need - n > 1 ? "Te faltan " + (need - n) + " noches." : "Te falta 1 noche.");
      const d = new Date($("#fIda").value + "T12:00"); d.setDate(d.getDate() + need);
      ajustar.textContent = "Ajustar regreso al " + fmtD(iso(d)); ajustar.dataset.to = iso(d); ajustar.hidden = false;
    } else {
      const libres = n - need;
      $("#rNochesNota").textContent = plan + " = " + need + " noches. " + (libres ? "Te quedan " + libres + " día" + (libres > 1 ? "s" : "") + " libre" + (libres > 1 ? "s" : "") + " para descansar." : "Plan justo, sin días libres.");
      ajustar.hidden = true;
    }
  }
  $("#rTicketsLbl").textContent = "Entradas · referencia precios públicos (" + D.actualizado + ")";
  if (t.hi && t.hi > t.lo) $("#rTickets").innerHTML = "USD " + fmt(t.lo) + "–" + fmt(t.hi) + (t.open ? "+" : "") + "<small>total</small>";
  else if (t.hi) $("#rTickets").innerHTML = "desde USD " + fmt(t.lo) + "<small>total</small>";
  else $("#rTickets").textContent = "A cotizar";
  $("#rTicketsNota").textContent = t.notes.join(" ");

  const L = [];
  L.push("Hola! Quiero cotizar un viaje a los parques.", "");
  L.push("Nombre: " + ($("#nombre").value || "(sin completar)"));
  L.push("WhatsApp: " + ($("#wsp").value || "(sin completar)"));
  L.push("Destino: " + [...state.destinos].map(k => D.resorts[k].name).join(" + "));
  L.push("Fechas: " + fmtD($("#fIda").value) + " al " + fmtD($("#fVuelta").value) + (n ? " (" + n + " noches)" : ""));
  L.push("Viajeros: " + pax.adultos + " adultos, " + pax.ninos + " niños (3-9), " + pax.bebes + " bebés");
  if (w.list.length) { L.push("Plan:"); w.list.forEach(([p, d]) => L.push("  - " + p.name + ": " + d + (p.perNight ? " noches" : " día" + (d > 1 ? "s" : "")))); }
  if (state.compras) L.push("Días de compras: " + state.compras);
  const evSel = activeEvents().filter(e => e.extra && state.eventos.has(e.id));
  if (evSel.length) L.push("Eventos: " + evSel.map(e => e.name).join(", "));
  if (w.days && n < need) L.push("Noches recomendadas por la app: " + need);
  if (state.destinos.has("cruise")) L.push("Crucero: " + $("#crNoches").value + " noches desde " + $("#crPuerto").value);
  L.push("Alojamiento: " + $("#hotel").value);
  L.push("Entrada: " + $("#ticketTipo").selectedOptions[0].textContent);
  if (state.extras.size) L.push("Extras: " + [...state.extras].map(x => x === "Plan de comidas" ? "Plan de comidas (" + (D.planesComida.find(p => p.id === state.plan) || D.planesComida[0]).name + ")" : x).join(", "));
  if ($("#coment").value.trim()) L.push("Comentarios: " + $("#coment").value.trim());
  if (t.hi) L.push("", "Referencia de entradas vista en la app: USD " + fmt(t.lo) + "-" + fmt(t.hi));
  const msg = L.join("\n");
  $("#msg").textContent = msg;
  const num = String(A.whatsapp || "").replace(/\D/g, "");
  $("#btnWsp").href = "https://wa.me/" + num + "?text=" + encodeURIComponent(msg);
  save();
}
$("#btnAjustar").onclick = () => { $("#fVuelta").value = $("#btnAjustar").dataset.to; render(); };
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
    d.querySelector(".k3").textContent = p.t[1] ? (p.t[0] === p.t[1] ? "USD " + p.t[0] : "USD " + p.t[0] + "–" + p.t[1]) : p.t[0] ? "desde USD " + p.t[0] : (p.perNight ? "A cotizar" : "Libre");
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

Object.entries(D.resorts).filter(([, r]) => r.center).map(([k, r]) => [k, r.name]).forEach(([k, v]) => {
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
const fromHash = () => { const h = location.hash.slice(1); if (["viaje", "parques", "mapa"].includes(h)) showTab(h); };
fromHash(); window.addEventListener("hashchange", fromHash);
})();
