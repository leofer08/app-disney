// Guarda los pedidos de los clientes en Firestore (colección "pedidos").
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp(window.FIREBASE);
const db = getFirestore(app);

window.guardarPedido = async (p) => {
  const ref = await addDoc(collection(db, "pedidos"), { ...p, estado: "nuevo", origen: "app", creado: serverTimestamp() });
  return ref.id;
};
