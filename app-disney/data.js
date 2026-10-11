// ===============================================
//  DATOS DE PARQUES Y PRECIOS
//  Precios: rangos públicos 2026 en USD, antes de impuestos.
//  Revisar y actualizar una vez por temporada.
// ===============================================
window.DATA = {
  actualizado: "Octubre 2026",
  pasosPorKm: 1320, // ~2.200 pasos por milla

  resorts: {
    wdw:    { name: "Walt Disney World", short: "Disney Orlando", airport: "MCO", center: [28.3852, -81.5639], zoom: 13 },
    uor:    { name: "Universal Orlando", short: "Universal",  airport: "MCO", center: [28.4560, -81.4580], zoom: 13 },
    dlr:    { name: "Disneyland Resort", short: "Disneyland", airport: "LAX", center: [33.8090, -117.9200], zoom: 16 },
    ush:    { name: "Universal Hollywood", short: "Universal LA", airport: "LAX", center: [34.1375, -118.3550], zoom: 16 },
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
    { id:"usf", r:"uor", name:"Universal Studios Florida", kind:"Parque temático", km:[9.7,14.5], est:true, t:[119,0],
      lat:28.4752, lng:-81.4685, rad:450,
      walk:"Recorrido en anillo alrededor de una laguna; conectado a Islands of Adventure por CityWalk y el Hogwarts Express.",
      tips:["El Hogwarts Express une los dos parques de Harry Potter, pero necesitás entrada park-to-park.","Las atracciones grandes arman fila desde la apertura: arrancá por ahí.","Universal Express te saltea la fila común en casi todo (se paga aparte)."]},
    { id:"ioa", r:"uor", name:"Islands of Adventure", kind:"Parque temático", km:[9.7,14.5], est:true, t:[119,0],
      lat:28.4710, lng:-81.4718, rad:450,
      walk:"Circuito alrededor de un lago, con islas temáticas una detrás de la otra: si no volvés sobre tus pasos, se camina menos.",
      tips:["Hay muchas atracciones con agua: llevá ropa de recambio o poncho.","Las montañas rusas tienen altura mínima: revisá antes si van chicos.","Combina con Universal Studios en el mismo día con entrada park-to-park."]},
    { id:"epu", r:"uor", name:"Epic Universe", kind:"Parque temático", km:[11.3,16.1], est:true, t:[139,0],
      lat:28.4365, lng:-81.4470, rad:550,
      walk:"Parque más nuevo (2025): una plaza central con portales a cada mundo; las idas y vueltas al centro suman kilómetros.",
      tips:["Queda separado de los otros parques: se llega en bus o auto, no caminando.","Es el más buscado: comprá la entrada con fecha fija y llegá a la apertura.","Ideal dedicarle un día entero."]},
    { id:"vb", r:"uor", name:"Volcano Bay", kind:"Parque acuático", km:[4.8,8.0], est:true, t:[80,0],
      lat:28.4623, lng:-81.4708, rad:250, water:true,
      walk:"Parque acuático con sistema de turnos virtuales: esperás tirado en la playa en vez de hacer fila.",
      tips:["Te dan una pulsera para reservar turno en los toboganes.","Llegá temprano: se llena y a veces cierra el ingreso."]},
    { id:"cw", r:"uor", name:"Universal CityWalk", kind:"Compras y comida", km:[2.4,4.8], est:true, t:[0,0],
      lat:28.4737, lng:-81.4676, rad:150, shop:true,
      walk:"Paseo de restaurantes entre los dos parques originales, entrada libre.",
      tips:["Buen lugar para cenar después del parque.","El estacionamiento se paga."]},
    { id:"ush", r:"ush", name:"Universal Studios Hollywood", kind:"Parque temático", km:[8.0,12.9], est:true, t:[109,159],
      lat:34.1381, lng:-118.3534, rad:400,
      walk:"Está en una colina, en dos niveles unidos por escaleras mecánicas larguísimas: menos km que Orlando pero más subida.",
      tips:["El Studio Tour en tranvía por los estudios reales es lo imperdible.","Se recorre en un día; combina bien con Disneyland, a unos 50 km.","Express te saltea las filas (se paga aparte)."]},
    { id:"cr", r:"cruise", name:"Día en el barco", kind:"Crucero · día de navegación", km:[4.8,8.0], est:true, t:[0,0], perNight:true,
      walk:"Se camina menos que en un parque, pero suma: cubiertas, escaleras y shows.",
      tips:["Cabinas y tarifa dependen del barco y el itinerario: lo cotiza el agente.","Combina muy bien con unos días de parques en Orlando antes de embarcar."]}
  ],

  // Entradas Walt Disney World de varios días: total por persona [mín, máx]
  wdwMulti: {1:[119,199],2:[256,386],3:[384,567],4:[492,724],5:[535,816],6:[564,871],7:[581,907],8:[624,940],9:[639,948],10:[660,970]},
  lightningLane: [18,39], // Multi Pass por persona y día

  // Universal Orlando: precio "desde" por persona y por día según cantidad de días (Universal publica solo mínimos)
  // 1 día: 119 (Epic: 139). 2 días: 117/día (176/día si incluye Epic). 3: 118. 4: 113. 5+: 93
  uorDesde: {1:119, 2:117, 3:118, 4:113, 5:93},
  uorDesdeConEpic2: 176,
  uorParkToPark: {1:174, 2:147, 3:138, 4:113, 5:93},
  universalExpress: [120,320], // por persona y día
  ushDia: [109,159],
  impuestoFlorida: 6.5,

  hoteles: ["Hotel Disney categoría Value","Hotel Disney categoría Moderate","Hotel Disney categoría Deluxe","Hotel de Universal","Hotel fuera de los parques","Casa / alquiler temporario","Ya tengo alojamiento"],
  extras: ["Vuelo desde Buenos Aires","Traslados aeropuerto","Asistencia al viajero","Lightning Lane (filas rápidas Disney)","Universal Express (filas rápidas Universal)","Plan de comidas","Alquiler de auto"],
  puertosCrucero: ["Port Canaveral (Orlando)","Fort Lauderdale","Miami","Galveston","Me da igual"]
};
