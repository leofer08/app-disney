// ===============================================
//  DATOS DE PARQUES Y PRECIOS
//  Precios: rangos públicos 2026 en USD, antes de impuestos.
//  Revisar y actualizar una vez por temporada.
// ===============================================
window.DATA = {
  actualizado: "Octubre 2026",
  pasosPorKm: 1320, // ~2.200 pasos por milla

  resorts: {
    wdw:    { name: "Walt Disney World", short: "Orlando",    airport: "MCO", center: [28.3852, -81.5639], zoom: 13 },
    dlr:    { name: "Disneyland Resort", short: "California", airport: "LAX", center: [33.8090, -117.9200], zoom: 16 },
    cruise: { name: "Crucero Disney",    short: "Crucero",    airport: "MCO" }
  },

  // km: rango en un día completo. est=true: estimación propia (sin medición publicada)
  // t: entrada 1 día adulto [mín, máx] en USD
  parks: [
    { id:"mk", r:"wdw", name:"Magic Kingdom", kind:"Parque temático", km:[12.9,19.3], est:false, t:[139,199],
      lat:28.4177, lng:-81.5812, rad:550,
      walk:"Diseño radial: Main Street concentra toda la entrada y salida de gente.",
      tips:["El tren del parque te ahorra cruzar de punta a punta caminando.","Llegá 45 minutos antes de la apertura: las primeras horas rinden el doble.","Para los fuegos, ubicate en Main Street con tiempo y salí 10 minutos antes del final para evitar la multitud."]},
    { id:"ep", r:"wdw", name:"EPCOT", kind:"Parque temático", km:[11.3,17.7], est:false, t:[129,194],
      lat:28.3747, lng:-81.5494, rad:750,
      walk:"Es el parque con más senderos: solo la vuelta al lago de World Showcase son unos 2 km.",
      tips:["Si llegás en Skyliner entrás por International Gateway, a mitad del recorrido.","Los barcos que cruzan el lago cortan buena parte de la caminata.","Ideal de tarde-noche, recorriendo los pabellones de países."]},
    { id:"hs", r:"wdw", name:"Hollywood Studios", kind:"Parque temático", km:[8.0,11.3], est:false, t:[139,199],
      lat:28.3575, lng:-81.5583, rad:450,
      walk:"El más compacto de Walt Disney World: el que menos se camina.",
      tips:["Conectado por Skyliner con EPCOT y varios hoteles.","Muchos shows tienen horario fijo: armá el día alrededor de ellos.","Buen parque para el primer día, cuando todavía hay que acostumbrar las piernas."]},
    { id:"ak", r:"wdw", name:"Animal Kingdom", kind:"Parque temático", km:[11.3,16.1], est:false, t:[119,179],
      lat:28.3553, lng:-81.5901, rad:750,
      walk:"Senderos largos y sinuosos, el más extendido de los cuatro.",
      tips:["El safari y la zona de Pandora quedan lejos de la entrada: arrancá por ahí.","Suele cerrar más temprano que los otros parques.","El safari a primera hora tiene animales más activos."]},
    { id:"tl", r:"wdw", name:"Typhoon Lagoon", kind:"Parque acuático", km:[4.8,8.0], est:true, t:[74,74], child:68,
      lat:28.3654, lng:-81.5285, rad:300, water:true,
      walk:"Se camina poco, pero descalzo o en ojotas y con escaleras a los toboganes.",
      tips:["Entrada 1 día: USD 74 adulto, 68 niño (3 a 9).","Llevá protector y calzado de agua.","Abre por temporada: el agente confirma fechas."]},
    { id:"bb", r:"wdw", name:"Blizzard Beach", kind:"Parque acuático", km:[4.8,8.0], est:true, t:[74,74], child:68,
      lat:28.3527, lng:-81.5754, rad:300, water:true,
      walk:"Hay una aerosilla hasta la cima: usala para no subir a pie.",
      tips:["Entrada 1 día: USD 74 adulto, 68 niño (3 a 9).","Abre por temporada; se alterna con Typhoon Lagoon."]},
    { id:"ds", r:"wdw", name:"Disney Springs", kind:"Compras y comida", km:[4.8,8.9], est:true, t:[0,0],
      lat:28.3707, lng:-81.5193, rad:400, shop:true,
      walk:"Paseo de compras y restaurantes, entrada libre.",
      tips:["Ideal para la noche de llegada o un día de descanso.","Hay buses gratis desde los hoteles Disney."]},
    { id:"dl", r:"dlr", name:"Disneyland Park", kind:"Parque temático", km:[9.7,14.5], est:false, t:[104,224],
      lat:33.8121, lng:-117.9190, rad:330,
      walk:"El parque Disney más compacto y eficiente para caminar.",
      tips:["Queda enfrente de California Adventure: se cruza en 2 minutos.","Precio por día según demanda: los días más baratos rinden mucho.","Con Park Hopper podés hacer los dos parques el mismo día."]},
    { id:"ca", r:"dlr", name:"California Adventure", kind:"Parque temático", km:[9.7,12.9], est:true, t:[104,224],
      lat:33.8061, lng:-117.9209, rad:300,
      walk:"Más chico que Disneyland Park, con un circuito alrededor de una laguna central.",
      tips:["Comparte la plaza de entrada con Disneyland Park.","Las atracciones más buscadas conviene hacerlas temprano."]},
    { id:"dt", r:"dlr", name:"Downtown Disney", kind:"Compras y comida", km:[3.2,6.4], est:true, t:[0,0],
      lat:33.8090, lng:-117.9236, rad:150, shop:true,
      walk:"Paseo peatonal entre los parques y los hoteles.",
      tips:["Entrada libre, abierto hasta tarde."]},
    { id:"cr", r:"cruise", name:"Día en el barco", kind:"Crucero · día de navegación", km:[4.8,8.0], est:true, t:[0,0], perNight:true,
      walk:"Se camina menos que en un parque, pero suma: cubiertas, escaleras y shows.",
      tips:["Cabinas y tarifa dependen del barco y el itinerario: lo cotiza el agente.","Combina muy bien con unos días de parques en Orlando antes de embarcar."]}
  ],

  // Entradas Walt Disney World de varios días: total por persona [mín, máx]
  wdwMulti: {1:[119,199],2:[256,386],3:[384,567],4:[492,724],5:[535,816],6:[564,871],7:[581,907],8:[624,940],9:[639,948],10:[660,970]},
  lightningLane: [18,39], // Multi Pass por persona y día
  impuestoFlorida: 6.5,

  hoteles: ["Hotel Disney categoría Value","Hotel Disney categoría Moderate","Hotel Disney categoría Deluxe","Hotel fuera de Disney","Casa / alquiler temporario","Ya tengo alojamiento"],
  extras: ["Vuelo desde Buenos Aires","Traslados aeropuerto","Asistencia al viajero","Lightning Lane (filas rápidas)","Plan de comidas","Alquiler de auto"],
  puertosCrucero: ["Port Canaveral (Orlando)","Fort Lauderdale","Miami","Galveston","Me da igual"]
};
