// ===============================================
//  CONFIGURACIÓN DE LA AGENCIA
//  Cambiá estos datos y volvé a subir el archivo.
// ===============================================
window.AGENCIA = {
  // Nombre que aparece arriba de la app
  nombre: "Tu Agencia de Viajes",

  // WhatsApp donde llegan los pedidos.
  // Formato internacional, solo números, sin + ni espacios.
  // Ejemplo Argentina celular: 5491155550000  (54 + 9 + código de área sin 0 + número sin 15)
  // Si queda vacío, el botón abre WhatsApp para que el cliente elija el contacto.
  whatsapp: "",

  // Email de contacto (se muestra como texto, opcional)
  email: "",

  // Aeropuerto de salida por defecto
  aeropuertoSalida: "EZE"
};

// ===============================================
//  QUIÉN SOY (pestaña de presentación del agente)
// ===============================================
window.AGENTE = {
  nombre: "Juan Ignacio",
  // Foto: subí la imagen a la carpeta (ej: foto-agente.jpg) y poné el nombre acá. Vacío = iniciales.
  foto: "",
  frase: "Me formé en las academias de Disney y Universal. Te ayudo a planificar y reservar tu viaje.",
  bio: [
    "¡Hola! Soy Juan Ignacio, un apasionado de los viajes y los parques de diversiones, con un amor especial por Disney.",
    "Viajé muchas veces, en pareja, con amigos y en familia. Cada experiencia me enseñó que hay distintas maneras de disfrutar un mismo destino y que cada viaje tiene su propio ritmo.",
    "Me formé en las academias de Disney y Universal, y hoy te ayudo a planificar y reservar tus viajes a sus parques y tus cruceros Disney. Además, sigo leyendo e investigando sobre su historia, novedades y esos pequeños detalles que pueden hacer especial cada visita.",
    "Lo que más disfruto es conocerte: escuchar qué te entusiasma, cómo te gusta viajar y qué esperás de esa experiencia. Así podemos armar un viaje pensado para vos.",
    "Durante años compartí recomendaciones con quienes estaban por viajar. Hoy, esa misma pasión se convirtió en una forma de acompañarte desde los primeros planes."
  ],
  cierre: "¿Empezamos a imaginar tu próximo viaje?",
  credenciales: ["Formado en la academia de Disney", "Formado en la academia de Universal"],
  servicios: ["Parques Disney", "Parques Universal", "Cruceros Disney"],
  // Redes (dejá vacío lo que no uses). Instagram sin @.
  instagram: "",
  // Testimonios reales de clientes, con su permiso. Ej: { texto: "...", autor: "Familia García", viaje: "Orlando 2025" }
  testimonios: []
};

// ===============================================
//  FIREBASE (base de datos de pedidos)
//  Estos datos son públicos por diseño: la seguridad la dan las reglas de Firestore.
// ===============================================
window.FIREBASE = {
  apiKey: "AIzaSyAdxroGq_tDSWpfVvMBYNPMGMdf8RxAbNM",
  authDomain: "app-disney-5d491.firebaseapp.com",
  projectId: "app-disney-5d491",
  storageBucket: "app-disney-5d491.firebasestorage.app",
  messagingSenderId: "1001925327267",
  appId: "1:1001925327267:web:0762a4680c10b160b3c216"
};
