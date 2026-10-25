// Guarda los pedidos de los clientes en Firestore (colección "pedidos")
// y suma contadores anónimos de visitas por día (colección "stats", solo la ven los agentes).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, doc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp(window.FIREBASE);
const db = getFirestore(app);

window.guardarPedido = async (p) => {
  const ref = await addDoc(collection(db, "pedidos"), { ...p, estado: "nuevo", origen: "app", creado: serverTimestamp() });
  return ref.id;
};

/* ---------- Estadísticas anónimas ----------
   Un documento por día (stats/AAAA-MM-DD) con contadores. No se guarda nada que identifique a la persona.
   Cada evento se cuenta una sola vez por sesión. Los agentes que entraron al panel en este navegador no cuentan. */
const CLAVES = ["visitas", "unicos", "wsp", "copiar", "f_google", "f_instagram", "f_facebook", "f_whatsapp", "f_directo", "f_otro", "d_movil", "d_compu", "t_parques", "t_guia", "t_yo"];
const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
const ss = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
const noContar = ls.get("noContar") === "1" || /^(localhost|127\.|\[::1\])/.test(location.hostname) || navigator.webdriver;
const dia = () => new Date().toLocaleDateString("sv-SE", { timeZone: "America/Argentina/Buenos_Aires" });

async function sumar(claves) {
  claves = claves.filter(k => CLAVES.includes(k));
  if (noContar || !claves.length) return;
  const ref = doc(db, "stats", dia());
  const inc = {}; claves.forEach(k => inc[k] = increment(1));
  try { await updateDoc(ref, inc); return; } catch (e) {}
  // El día todavía no existe: se crea con todos los contadores.
  const full = {}; CLAVES.forEach(k => full[k] = claves.includes(k) ? 1 : 0);
  try { await setDoc(ref, full); return; } catch (e) {}
  try { await updateDoc(ref, inc); } catch (e) {}
}

function fuente() {
  const q = new URLSearchParams(location.search);
  const utm = (q.get("utm_source") || q.get("src") || "").toLowerCase();
  let ref = ""; try { ref = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : ""; } catch (e) {}
  if (ref === location.hostname) ref = "";
  const s = utm || ref;
  if (!s) return "f_directo";
  if (/google/.test(s)) return "f_google";
  if (/instagram|^ig$/.test(s)) return "f_instagram";
  if (/facebook|fb\.|^fb$|^meta$/.test(s)) return "f_facebook";
  if (/whatsapp|wa\.me|^wa$/.test(s)) return "f_whatsapp";
  return "f_otro";
}

// Visita: una por sesión. "Únicos": primera visita del día en este navegador.
if (!ss.get("st_visita")) {
  ss.set("st_visita", "1");
  const claves = ["visitas", fuente(), matchMedia("(pointer:coarse)").matches || /Mobi|Android/i.test(navigator.userAgent) ? "d_movil" : "d_compu"];
  if (ls.get("st_dia") !== dia()) { ls.set("st_dia", dia()); claves.push("unicos"); }
  sumar(claves);
}

// Eventos que manda app.js (clic en WhatsApp, copiar, pestañas vistas), una vez por sesión cada uno.
function evento(k) {
  if (ss.get("st_" + k)) return;
  ss.set("st_" + k, "1");
  sumar([k]);
}
window.trackEvento = evento;
(window.__ev || []).forEach(evento);
window.__ev = { push: evento };
