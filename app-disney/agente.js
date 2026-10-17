// Panel del agente: login, lista de pedidos en vivo, estados, seguimiento y notas.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updatePassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, query, orderBy, limit, onSnapshot, doc, updateDoc, addDoc, setDoc, getDoc, getDocs, where, documentId, serverTimestamp, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp(window.FIREBASE);
const auth = getAuth(app);
const db = getFirestore(app);
const $ = s => document.querySelector(s);
const A = window.AGENCIA || {};
$("#agNombre").textContent = A.nombre || "Agencia";
$("#agNombreL").textContent = A.nombre || "Agencia";

const ESTADOS = [
  { id: "nuevo", name: "Nuevo" },
  { id: "contactado", name: "Contactado" },
  { id: "cotizado", name: "Cotizado" },
  { id: "vendido", name: "Vendido" },
  { id: "perdido", name: "Perdido" }
];
const stName = id => (ESTADOS.find(e => e.id === id) || ESTADOS[0]).name;
const stVar = id => "var(--st-" + (ESTADOS.some(e => e.id === id) ? id : "nuevo") + ")";

let pedidos = [], sel = null, filtro = "todos", unsub = null, unsubAg = null, yo = null, agentes = [];
// Super admin fijo (también está en las reglas de Firestore)
const SUPER = "leofer8@gmail.com";

/* ---------- Utilidades ---------- */
const fmt = n => Number(n || 0).toLocaleString("es-AR");
const hoyISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const addDias = n => { const d = new Date(); d.setDate(d.getDate() + n); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const fDia = s => { if (!s) return "—"; const [y, m, d] = s.split("-"); return d + "/" + m + "/" + y.slice(2); };
const tsDate = t => t && t.toDate ? t.toDate() : (t ? new Date(t) : null);
function hace(d) {
  if (!d) return "recién";
  const min = Math.round((Date.now() - d.getTime()) / 60000);
  if (min < 1) return "recién"; if (min < 60) return "hace " + min + " min";
  const h = Math.round(min / 60); if (h < 24) return "hace " + h + " h";
  const dd = Math.round(h / 24); return "hace " + dd + " día" + (dd > 1 ? "s" : "");
}
const horasDesde = d => d ? (Date.now() - d.getTime()) / 3600000 : 0;
function waNum(raw) {
  let d = String(raw || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("54")) return d;
  if (d.startsWith("0")) d = d.slice(1);
  if (d.length === 10 || d.length === 11) return "549" + d.replace(/^15/, "");
  return d;
}
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const cerrado = p => p.estado === "vendido" || p.estado === "perdido";

/* ---------- Login ---------- */
$("#fLogin").addEventListener("submit", async e => {
  e.preventDefault(); $("#lMsg").textContent = "Ingresando…"; $("#lBtn").disabled = true;
  try { await signInWithEmailAndPassword(auth, $("#lEmail").value.trim(), $("#lPass").value); $("#lMsg").textContent = ""; }
  catch (err) { $("#lMsg").textContent = err.code === "auth/too-many-requests" ? "Demasiados intentos. Esperá unos minutos." : "Email o contraseña incorrectos."; }
  $("#lBtn").disabled = false;
});
$("#lReset").onclick = async () => {
  const em = $("#lEmail").value.trim();
  if (!em) { $("#lMsg").textContent = "Escribí tu email arriba y volvé a tocar."; return; }
  try { await sendPasswordResetEmail(auth, em); } catch (e) {}
  $("#lMsg").textContent = "Si el email está registrado, te llega un correo para cambiar la contraseña.";
};
$("#btnSalir").onclick = () => signOut(auth);

function vista(v) { ["vLogin", "vClave", "vSinAcceso", "vPanel"].forEach(id => $("#" + id).hidden = id !== v); }
function detener() { if (unsub) { unsub(); unsub = null; } if (unsubAg) { unsubAg(); unsubAg = null; } }

onAuthStateChanged(auth, async user => {
  detener();
  if (!user) { pedidos = []; sel = null; yo = null; vista("vLogin"); return; }
  const email = (user.email || "").toLowerCase();
  const esSuper = email === SUPER;
  let perfil = null;
  try { const d = await getDoc(doc(db, "agentes", email)); perfil = d.exists() ? d.data() : null; } catch (e) { perfil = null; }
  if (esSuper && !perfil) {
    perfil = { email, nombre: "Leo", rol: "admin", activo: true, cambiarClave: false };
    try { await setDoc(doc(db, "agentes", email), { ...perfil, creado: serverTimestamp() }); } catch (e) {}
  }
  if (!esSuper && (!perfil || perfil.activo === false)) { vista("vSinAcceso"); return; }
  yo = { email, esSuper, admin: esSuper || perfil.rol === "admin", ...perfil };
  if (!esSuper && perfil.cambiarClave) { $("#cEmail").value = email; vista("vClave"); $("#cNueva").focus(); return; }
  abrirPanel();
});

function abrirPanel() {
  vista("vPanel");
  try { localStorage.setItem("noContar", "1"); } catch (e) {}
  $("#who").textContent = yo.email + (yo.esSuper ? " · super admin" : yo.admin ? " · admin" : "");
  $("#btnAgentes").hidden = !yo.admin;
  updateDoc(doc(db, "agentes", yo.email), { ultimoIngreso: serverTimestamp() }).catch(() => {});
  const q = query(collection(db, "pedidos"), orderBy("creado", "desc"), limit(500));
  unsub = onSnapshot(q, snap => {
    pedidos = snap.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: "estimate" }) }));
    renderAll();
  }, err => { $("#lista").innerHTML = ""; $("#lista").appendChild(el("div", "empty", "No se pudieron leer los pedidos: " + err.message)); });
}

/* ---------- Cambio de clave obligatorio ---------- */
$("#fClave").addEventListener("submit", async e => {
  e.preventDefault();
  const n = $("#cNueva").value, r = $("#cRepite").value;
  if (n.length < 8) { $("#cMsg").textContent = "La contraseña tiene que tener al menos 8 caracteres."; return; }
  if (n !== r) { $("#cMsg").textContent = "Las dos contraseñas no coinciden."; return; }
  $("#cBtn").disabled = true; $("#cMsg").textContent = "Guardando…";
  try {
    await updatePassword(auth.currentUser, n);
    await updateDoc(doc(db, "agentes", yo.email), { cambiarClave: false });
    yo.cambiarClave = false; $("#fClave").reset(); $("#cMsg").textContent = "";
    abrirPanel();
  } catch (err) {
    $("#cMsg").textContent = err.code === "auth/requires-recent-login" ? "Por seguridad, salí y volvé a entrar con la contraseña temporal, y cambiala enseguida." : err.code === "auth/weak-password" ? "Esa contraseña es muy débil. Probá con otra más larga." : "No se pudo cambiar la contraseña: " + err.message;
  }
  $("#cBtn").disabled = false;
});
$("#cSalir").onclick = () => signOut(auth);
$("#saSalir").onclick = () => signOut(auth);

/* ---------- Agentes (solo admin) ---------- */
$("#btnAgentes").onclick = () => {
  $("#mAgentes").hidden = false;
  if (!unsubAg) unsubAg = onSnapshot(collection(db, "agentes"), snap => { agentes = snap.docs.map(d => ({ id: d.id, ...d.data() })); renderAgentes(); },
    err => { $("#agLista").innerHTML = ""; $("#agLista").appendChild(el("p", "note", "No se pudieron leer los agentes: " + err.message)); });
};
$("#agCerrar").onclick = () => { $("#mAgentes").hidden = true; };
function renderAgentes() {
  const box = $("#agLista"); box.innerHTML = "";
  agentes.sort((a, b) => (a.id === SUPER ? -1 : b.id === SUPER ? 1 : a.id.localeCompare(b.id))).forEach(a => {
    const r = el("div", "agrow" + (a.activo === false ? " off" : ""));
    const t = el("div", "agtx");
    t.append(el("b", null, (a.nombre || a.id.split("@")[0]) + (a.id === SUPER ? " · super admin" : "")), el("small", null, a.id));
    const tags = el("div", "row");
    tags.appendChild(el("span", "tag", a.rol === "admin" ? "Admin" : "Agente"));
    if (a.activo === false) tags.appendChild(el("span", "tag warn", "Desactivado"));
    if (a.cambiarClave) tags.appendChild(el("span", "tag due", "Debe cambiar la clave"));
    if (a.ultimoIngreso && a.ultimoIngreso.toDate) tags.appendChild(el("span", "tag", "Último ingreso " + hace(a.ultimoIngreso.toDate())));
    t.appendChild(tags);
    r.appendChild(t);
    if (a.id !== SUPER && a.id !== yo.email) {
      const acc = el("div", "row");
      const b1 = el("button", "btn ghost sm", a.activo === false ? "Reactivar" : "Desactivar"); b1.type = "button";
      b1.onclick = () => updateDoc(doc(db, "agentes", a.id), { activo: a.activo === false });
      const b2 = el("button", "btn ghost sm", "Pedir cambio de clave"); b2.type = "button"; b2.disabled = !!a.cambiarClave;
      b2.onclick = () => updateDoc(doc(db, "agentes", a.id), { cambiarClave: true });
      const b3 = el("button", "btn ghost sm", a.rol === "admin" ? "Pasar a agente" : "Hacer admin"); b3.type = "button";
      b3.onclick = () => updateDoc(doc(db, "agentes", a.id), { rol: a.rol === "admin" ? "agente" : "admin" });
      acc.append(b1, b2, b3); r.appendChild(acc);
    }
    box.appendChild(r);
  });
}
$("#fAgente").addEventListener("submit", async e => {
  e.preventDefault();
  const email = $("#aEmail").value.trim().toLowerCase();
  if (!email) return;
  try {
    await setDoc(doc(db, "agentes", email), { email, nombre: $("#aNombre").value.trim(), rol: $("#aRol").value, activo: true, cambiarClave: true, creado: serverTimestamp(), creadoPor: yo.email });
    $("#fAgente").reset(); $("#aMsg").textContent = "Listo: " + email + " ya puede entrar. Al primer ingreso le pide cambiar la contraseña.";
  } catch (err) { $("#aMsg").textContent = "No se pudo dar de alta: " + err.message; }
});

/* ---------- Estadísticas de visitas ---------- */
let stDias = 30;
const diaAR = d => d.toLocaleDateString("sv-SE", { timeZone: "America/Argentina/Buenos_Aires" });
function ultimosDias(n) { const out = []; const d = new Date(); for (let i = n - 1; i >= 0; i--) { const x = new Date(d); x.setDate(d.getDate() - i); out.push(diaAR(x)); } return out; }
const pct = (a, b) => b ? Math.round(a / b * 100) + "%" : "–";
function barras(box, filas) {
  box.innerHTML = "";
  const max = Math.max(1, ...filas.map(f => f[1]));
  const tot = filas.reduce((s, f) => s + f[1], 0);
  filas.forEach(([nom, n]) => {
    const r = el("div", "stbar"); const tr = el("div", "tr"); const i = el("i"); i.style.width = (n / max * 100) + "%"; tr.appendChild(i);
    r.append(el("span", null, nom), tr, el("span", "n", tot ? n + "" : "0")); r.title = nom + ": " + n + (tot ? " (" + pct(n, tot) + ")" : ""); box.appendChild(r);
  });
}
async function cargarStats() {
  document.querySelectorAll("#stRango .chip").forEach(b => b.setAttribute("aria-pressed", +b.dataset.d === stDias));
  const dias = ultimosDias(stDias);
  let datos = {};
  try {
    const snap = await getDocs(query(collection(db, "stats"), where(documentId(), ">=", dias[0])));
    snap.forEach(d => { datos[d.id] = d.data(); });
    $("#sNota").textContent = "Se cuenta una visita por sesión. No se guardan datos personales. Las visitas de agentes que entraron al panel desde ese navegador no se cuentan.";
  } catch (err) { $("#sNota").textContent = "No se pudieron leer las visitas: " + err.message; }
  const suma = k => dias.reduce((s, d) => s + ((datos[d] || {})[k] || 0), 0);
  const vis = suma("visitas"), uni = suma("unicos"), wsp = suma("wsp");
  const ped = pedidos.filter(p => { const c = tsDate(p.creado); return c && diaAR(c) >= dias[0]; });
  const pedApp = ped.filter(p => p.origen === "app").length;
  $("#sVis").textContent = fmt(vis); $("#sVisSub").textContent = "promedio " + fmt(Math.round(vis / stDias * 10) / 10) + " por día";
  $("#sUni").textContent = fmt(uni);
  $("#sWsp").textContent = fmt(wsp); $("#sWspSub").textContent = pct(wsp, vis) + " de las visitas";
  $("#sPed").textContent = fmt(pedApp); $("#sPedSub").textContent = ped.length > pedApp ? "+ " + (ped.length - pedApp) + " cargados a mano" : "desde la app";
  const ch = $("#sChart"); ch.innerHTML = "";
  const max = Math.max(1, ...dias.map(d => (datos[d] || {}).visitas || 0));
  const hoy = diaAR(new Date());
  dias.forEach(d => { const n = (datos[d] || {}).visitas || 0; const i = el("i", d === hoy ? "hoy" : null); i.style.height = Math.max(n ? 4 : 1, n / max * 100) + "%"; i.title = fDia(d) + ": " + n + " visita" + (n === 1 ? "" : "s"); ch.appendChild(i); });
  $("#sDesde").textContent = fDia(dias[0]); $("#sHasta").textContent = "hoy";
  barras($("#sFuentes"), [["Google", suma("f_google")], ["Instagram", suma("f_instagram")], ["Facebook", suma("f_facebook")], ["WhatsApp", suma("f_whatsapp")], ["Directo / sin dato", suma("f_directo")], ["Otros sitios", suma("f_otro")]]);
  barras($("#sDisp"), [["Celular", suma("d_movil")], ["Computadora", suma("d_compu")]]);
  barras($("#sTabs"), [["Parques", suma("t_parques")], ["Antes de viajar", suma("t_guia")], ["Quién soy", suma("t_yo")], ["Copiaron pedido", suma("copiar")]]);
}
$("#btnStats").onclick = () => { $("#mStats").hidden = false; cargarStats(); };
$("#stCerrar").onclick = () => { $("#mStats").hidden = true; };
document.querySelectorAll("#stRango .chip").forEach(b => b.onclick = () => { stDias = +b.dataset.d; cargarStats(); });

/* ---------- Filtros ---------- */
const FILTROS = [{ id: "todos", name: "Todos" }, { id: "abiertos", name: "Abiertos" }, ...ESTADOS];
FILTROS.forEach(f => {
  const b = el("button", "chip"); b.type = "button"; b.dataset.f = f.id;
  b.append(el("span", null, f.name), el("span", "cnt", ""));
  b.onclick = () => { filtro = f.id; renderAll(); };
  $("#fEstados").appendChild(b);
});
document.querySelectorAll(".kpi").forEach(k => k.onclick = () => { filtro = filtro === k.dataset.f ? "todos" : k.dataset.f; renderAll(); });
$("#fBuscar").addEventListener("input", () => renderLista());

function pasaFiltro(p) {
  const hoy = hoyISO();
  switch (filtro) {
    case "todos": return true;
    case "abiertos": return !cerrado(p);
    case "sincontacto": return p.estado === "nuevo";
    case "hoy": return !cerrado(p) && p.proximo && p.proximo <= hoy;
    default: return p.estado === filtro;
  }
}

/* ---------- Render ---------- */
function renderAll() { renderKpis(); renderLista(); renderDetalle(); }

function renderKpis() {
  const hoy = hoyISO(), mes = hoy.slice(0, 7);
  const nuevos = pedidos.filter(p => p.estado === "nuevo");
  const viejos = nuevos.filter(p => horasDesde(tsDate(p.creado)) > 24).length;
  $("#kNuevos").textContent = nuevos.length;
  $("#kNuevosSub").textContent = viejos ? viejos + " con más de 24 h" : "todos al día";
  document.querySelector('.kpi[data-f="sincontacto"]').classList.toggle("alert", viejos > 0);
  const hoyN = pedidos.filter(p => !cerrado(p) && p.proximo && p.proximo <= hoy).length;
  $("#kHoy").textContent = hoyN;
  document.querySelector('.kpi[data-f="hoy"]').classList.toggle("alert", hoyN > 0);
  const cot = pedidos.filter(p => p.estado === "cotizado");
  $("#kCot").textContent = cot.length;
  const montoCot = cot.reduce((s, p) => s + (Number(p.monto) || 0), 0);
  $("#kCotSub").textContent = montoCot ? "USD " + fmt(montoCot) + " en juego" : "sin montos cargados";
  const ven = pedidos.filter(p => p.estado === "vendido" && (p.cerradoEn || "").slice(0, 7) === mes);
  $("#kVen").textContent = ven.length;
  const montoVen = ven.reduce((s, p) => s + (Number(p.monto) || 0), 0);
  const cerradosMes = pedidos.filter(p => cerrado(p) && (p.cerradoEn || "").slice(0, 7) === mes).length;
  $("#kVenSub").textContent = (montoVen ? "USD " + fmt(montoVen) : "USD 0") + (cerradosMes ? " · " + Math.round(ven.length / cerradosMes * 100) + "% de cierre" : "");
  document.querySelectorAll(".kpi").forEach(k => k.setAttribute("aria-pressed", k.dataset.f === filtro));
  document.querySelectorAll("#fEstados .chip").forEach(b => {
    b.setAttribute("aria-pressed", b.dataset.f === filtro);
    const id = b.dataset.f;
    const c = id === "todos" ? pedidos.length : id === "abiertos" ? pedidos.filter(p => !cerrado(p)).length : pedidos.filter(p => p.estado === id).length;
    b.querySelector(".cnt").textContent = c;
  });
}

function orden(a, b) {
  // Abiertos primero; dentro, nuevos y seguimientos vencidos arriba; después por fecha de seguimiento y de creación.
  const hoy = hoyISO();
  const peso = p => cerrado(p) ? 3 : p.estado === "nuevo" ? 0 : (p.proximo && p.proximo <= hoy) ? 1 : 2;
  const d = peso(a) - peso(b); if (d) return d;
  if (peso(a) === 2 && a.proximo !== b.proximo) return (a.proximo || "9999").localeCompare(b.proximo || "9999");
  if (peso(a) === 0) return (tsDate(a.creado) || 0) - (tsDate(b.creado) || 0);
  return (tsDate(b.creado) || 0) - (tsDate(a.creado) || 0);
}

function renderLista() {
  const box = $("#lista"); box.innerHTML = "";
  const q = $("#fBuscar").value.trim().toLowerCase();
  const list = pedidos.filter(pasaFiltro).filter(p => !q || [p.nombre, p.wsp, p.codigo, (p.destinos || []).join(" ")].join(" ").toLowerCase().includes(q)).sort(orden);
  if (!pedidos.length) { box.appendChild(el("div", "empty", "Todavía no hay pedidos. Cuando un cliente toque “Enviar al agente” en la app, aparece acá al instante.")); return; }
  if (!list.length) { box.appendChild(el("div", "empty", "No hay pedidos con este filtro.")); return; }
  const hoy = hoyISO();
  list.forEach(p => {
    const b = el("button", "item"); b.type = "button"; b.style.setProperty("--st", stVar(p.estado));
    if (sel === p.id) b.setAttribute("aria-current", "true");
    const st = el("span", "st", stName(p.estado)); st.style.setProperty("--st", stVar(p.estado));
    b.append(el("span", "nm", p.nombre || "(sin nombre)"), st);
    const pax = p.pax ? p.pax.adultos + " ad" + (p.pax.ninos ? " · " + p.pax.ninos + " niñ" : "") + (p.pax.bebes ? " · " + p.pax.bebes + " beb" : "") : "";
    b.append(el("span", "meta", [(p.destinos || []).join(" + ") || "Destino a definir", p.fechaIda ? fDia(p.fechaIda) + " → " + fDia(p.fechaVuelta) : "", pax].filter(Boolean).join(" · ")));
    const fl = el("span", "flags");
    const c = tsDate(p.creado);
    fl.appendChild(el("span", "tag", (p.origen === "manual" ? "Manual · " : "") + hace(c)));
    if (p.estado === "nuevo" && horasDesde(c) > 24) fl.appendChild(el("span", "tag warn", "Sin contactar hace " + Math.floor(horasDesde(c) / 24) + " día" + (horasDesde(c) >= 48 ? "s" : "")));
    if (!cerrado(p) && p.proximo) fl.appendChild(el("span", "tag" + (p.proximo <= hoy ? " warn" : " due"), p.proximo < hoy ? "Seguimiento atrasado (" + fDia(p.proximo) + ")" : p.proximo === hoy ? "Seguimiento hoy" : "Seguir el " + fDia(p.proximo)));
    if (p.monto) fl.appendChild(el("span", "tag", "USD " + fmt(p.monto)));
    if (p.codigo) fl.appendChild(el("span", "tag", "#" + p.codigo));
    b.appendChild(fl);
    b.onclick = () => { sel = p.id; renderLista(); renderDetalle(); if (window.innerWidth <= 900) $("#detalle").scrollIntoView({ behavior: "smooth" }); };
    box.appendChild(b);
  });
}

/* ---------- Detalle ---------- */
async function guardar(p, cambios, nota) {
  const extra = { actualizado: serverTimestamp(), actualizadoPor: auth.currentUser.email };
  if (nota) extra.notas = arrayUnion({ texto: nota.texto, sys: !!nota.sys, fecha: new Date().toISOString(), por: auth.currentUser.email });
  try { await updateDoc(doc(db, "pedidos", p.id), { ...cambios, ...extra }); const s = $("#dSaved"); if (s) { s.textContent = "Guardado"; setTimeout(() => { if (s) s.textContent = ""; }, 1800); } }
  catch (e) { const s = $("#dSaved"); if (s) { s.textContent = "No se pudo guardar: " + e.message; s.style.color = "var(--st-nuevo)"; } }
}

function stat(k, v) { const d = el("div", "stat"); d.append(el("div", "k", k), el("div", "v", v)); return d; }

function renderDetalle() {
  const box = $("#detalle");
  const p = pedidos.find(x => x.id === sel);
  if (!p) { box.innerHTML = '<div class="vacio-det"><b>Elegí un pedido</b><p class="note">Acá vas a ver el detalle, cambiar el estado, anotar el seguimiento y escribirle al cliente.</p></div>'; return; }
  // No redibujar mientras el agente escribe en un campo del detalle
  if (box.dataset.id === p.id && box.contains(document.activeElement) && document.activeElement.matches("input,textarea")) return;
  box.dataset.id = p.id; box.innerHTML = "";

  const head = el("div", "dhead");
  const t = el("div"); t.append(el("h2", null, p.nombre || "(sin nombre)"), el("span", "note", (p.codigo ? "Pedido #" + p.codigo + " · " : "") + "recibido " + hace(tsDate(p.creado)) + (p.origen === "manual" ? " · cargado a mano" : "")));
  head.append(t, el("span", "saved", "")); head.lastChild.id = "dSaved";
  box.appendChild(head);

  // Estado
  const pipe = el("div", "pipeline");
  ESTADOS.forEach(e => {
    const b = el("button", null, e.name); b.type = "button"; b.style.setProperty("--st", stVar(e.id));
    b.setAttribute("aria-pressed", p.estado === e.id);
    b.onclick = () => {
      if (p.estado === e.id) return;
      const cambios = { estado: e.id };
      if (e.id === "vendido" || e.id === "perdido") cambios.cerradoEn = hoyISO(); else cambios.cerradoEn = null;
      if (e.id === "contactado" && !p.proximo) cambios.proximo = addDias(2);
      if (e.id === "cotizado") cambios.proximo = addDias(3);
      if (e.id === "vendido" || e.id === "perdido") cambios.proximo = null;
      guardar(p, cambios, { texto: "Estado: " + stName(p.estado) + " → " + e.name, sys: true });
    };
    pipe.appendChild(b);
  });
  box.appendChild(pipe);

  // Acciones
  const acc = el("div", "row");
  const num = waNum(p.wsp);
  const saludo = "Hola " + (p.nombre || "").split(" ")[0] + "! Te escribo de " + (A.nombre || "la agencia") + " por tu consulta del viaje" + (p.codigo ? " (pedido #" + p.codigo + ")" : "") + ".";
  if (num) { const a = el("a", "btn primary wide", "Escribir por WhatsApp"); a.href = "https://wa.me/" + num + "?text=" + encodeURIComponent(saludo); a.target = "_blank"; a.rel = "noopener"; acc.appendChild(a); }
  else acc.appendChild(el("span", "note", "El cliente no dejó WhatsApp."));
  const cp = el("button", "btn ghost wide", "Copiar pedido"); cp.type = "button";
  cp.onclick = async () => { try { await navigator.clipboard.writeText(p.mensaje || ""); cp.textContent = "Copiado"; } catch (e) { cp.textContent = "No se pudo copiar"; } setTimeout(() => cp.textContent = "Copiar pedido", 1500); };
  acc.appendChild(cp);
  box.appendChild(acc);

  // Seguimiento
  const seg = el("div", "dsec"); seg.appendChild(el("h3", null, "Seguimiento"));
  const r1 = el("div", "row");
  const lm = el("label", "f"); lm.htmlFor = "dMonto"; lm.append("Monto cotizado (USD)");
  const im = el("input"); im.id = "dMonto"; im.type = "number"; im.min = "0"; im.step = "1"; im.inputMode = "numeric"; im.value = p.monto || "";
  im.onchange = () => guardar(p, { monto: im.value ? Math.round(Number(im.value)) : null }, im.value ? { texto: "Monto cotizado: USD " + fmt(im.value), sys: true } : null);
  lm.appendChild(im);
  const lp = el("label", "f"); lp.htmlFor = "dProx"; lp.append("Próximo contacto");
  const ip = el("input"); ip.id = "dProx"; ip.type = "date"; ip.value = p.proximo || "";
  ip.onchange = () => guardar(p, { proximo: ip.value || null });
  lp.appendChild(ip);
  r1.append(lm, lp); seg.appendChild(r1);
  const qk = el("div", "quick");
  [["Hoy", 0], ["Mañana", 1], ["En 3 días", 3], ["En 1 semana", 7], ["Sin fecha", null]].forEach(([n, d]) => {
    const b = el("button", null, n); b.type = "button"; b.onclick = () => guardar(p, { proximo: d == null ? null : addDias(d) }); qk.appendChild(b);
  });
  seg.appendChild(qk);
  if (p.estado === "perdido") {
    const lmot = el("label", "f"); lmot.htmlFor = "dMotivo"; lmot.append("Motivo de pérdida");
    const sm = el("select"); sm.id = "dMotivo";
    ["", "Precio", "Eligió otra agencia", "Cambió de fechas / posterga", "No respondió más", "Otro"].forEach(o => sm.add(new Option(o || "Elegí un motivo", o)));
    sm.value = p.motivo || ""; sm.onchange = () => guardar(p, { motivo: sm.value || null }, sm.value ? { texto: "Motivo de pérdida: " + sm.value, sys: true } : null);
    lmot.appendChild(sm); seg.appendChild(lmot);
  }
  box.appendChild(seg);

  // Viaje
  const via = el("div", "dsec"); via.appendChild(el("h3", null, "Viaje"));
  const g = el("div", "dgrid");
  g.append(
    stat("Destino", (p.destinos || []).join(" + ") || "—"),
    stat("Fechas", p.fechaIda ? fDia(p.fechaIda) + " → " + fDia(p.fechaVuelta) + (p.noches ? " (" + p.noches + " n)" : "") : "—"),
    stat("Viajeros", p.pax ? p.pax.adultos + " adultos, " + p.pax.ninos + " niños, " + p.pax.bebes + " bebés" : "—"),
    stat("WhatsApp", p.wsp || "—"),
    stat("Hotel", p.hotel || "—"),
    stat("Entrada", p.entrada || "—"),
    stat("Plan", (p.plan || []).map(x => x.parque + " " + x.dias).join(", ") + (p.compras ? (p.plan && p.plan.length ? ", " : "") + "compras " + p.compras : "") || "—"),
    stat("Eventos", (p.eventos || []).join(", ") || "—"),
    stat("Extras", (p.extras || []).join(", ") + (p.planComida ? " · " + p.planComida : "") || "—"),
    stat("Ref. entradas", p.refEntradas && p.refEntradas.hi ? "USD " + fmt(p.refEntradas.lo) + "–" + fmt(p.refEntradas.hi) + (p.refEntradas.abierto ? "+" : "") : "—")
  );
  via.appendChild(g);
  if (p.comentarios) { const c = el("div", "nota"); c.append(el("small", null, "Comentario del cliente"), document.createTextNode(p.comentarios)); via.appendChild(c); }
  box.appendChild(via);

  // Notas
  const ns = el("div", "dsec"); ns.appendChild(el("h3", null, "Notas"));
  const fn = el("form", "row");
  const ta = el("textarea"); ta.id = "dNota"; ta.rows = 2; ta.placeholder = "Ej: le pasé 2 opciones de hotel, espera respuesta del marido"; ta.maxLength = 2000; ta.style.flex = "1 1 220px";
  const bn = el("button", "btn ghost", "Agregar nota"); bn.type = "submit";
  fn.append(ta, bn);
  fn.onsubmit = e => { e.preventDefault(); const v = ta.value.trim(); if (!v) return; ta.value = ""; ta.blur(); guardar(p, {}, { texto: v }); };
  ns.appendChild(fn);
  const lista = el("div", "notas");
  (p.notas || []).slice().reverse().forEach(n => {
    const d = el("div", "nota" + (n.sys ? " sys" : ""));
    const dt = n.fecha ? new Date(n.fecha) : null;
    d.append(el("small", null, (dt ? dt.toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "") + (n.por ? " · " + n.por.split("@")[0] : "")), document.createTextNode(n.texto));
    lista.appendChild(d);
  });
  if (!(p.notas || []).length) lista.appendChild(el("p", "note", "Sin notas todavía."));
  ns.appendChild(lista);
  box.appendChild(ns);

  // Mensaje original
  if (p.mensaje) {
    const det = el("details", "park"); const sum = el("summary"); sum.append(el("span", "t", "Mensaje original del cliente")); det.appendChild(sum);
    const pre = el("pre", "msg", p.mensaje); const wrap = el("div", "park-body"); wrap.appendChild(pre); det.appendChild(wrap); box.appendChild(det);
  }
}

/* ---------- Pedido manual ---------- */
$("#btnNuevo").onclick = () => { $("#mNuevo").hidden = false; $("#nNombre").focus(); };
$("#nCancel").onclick = () => { $("#mNuevo").hidden = true; };
$("#fNuevo").addEventListener("submit", async e => {
  e.preventDefault();
  const codigo = Math.random().toString(36).slice(2, 8).toUpperCase();
  const nota = $("#nNota").value.trim();
  const ref = await addDoc(collection(db, "pedidos"), {
    codigo, origen: "manual", estado: "nuevo", creado: serverTimestamp(),
    nombre: $("#nNombre").value.trim(), wsp: $("#nWsp").value.trim(),
    destinos: $("#nDest").value.trim() ? [$("#nDest").value.trim()] : [],
    fechaIda: $("#nIda").value, fechaVuelta: $("#nVuelta").value,
    mensaje: nota, notas: nota ? [{ texto: nota, sys: false, fecha: new Date().toISOString(), por: auth.currentUser.email }] : []
  });
  $("#fNuevo").reset(); $("#mNuevo").hidden = true; sel = ref.id; renderAll();
});

// Refrescar los "hace X min" cada minuto
setInterval(() => { if (pedidos.length) { renderKpis(); renderLista(); } }, 60000);
