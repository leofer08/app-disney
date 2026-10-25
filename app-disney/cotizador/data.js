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

  // Días de compras (outlets): km estimados por día
  comprasKm: [6.4, 9.7],

  // Eventos especiales. from/to: fechas (AAAA-MM-DD). aprox:true = fechas estimadas según años anteriores.
  // noches:true = solo algunas noches dentro del rango. extra:true = entrada aparte (se puede sumar al pedido).
  eventos: [
    // Walt Disney World
    { id:"mvmcp26", r:"wdw", name:"Mickey's Very Merry Christmas Party", place:"Magic Kingdom", from:"2026-11-08", to:"2026-12-22", noches:true, extra:true, price:[189,229],
      desc:"Fiesta navideña de noche: desfile, fuegos especiales, nieve en Main Street y personajes con trajes de fiesta." },
    { id:"jolly26", r:"wdw", name:"Disney Jollywood Nights", place:"Hollywood Studios", from:"2026-11-07", to:"2027-01-05", noches:true, extra:true, price:[169,199],
      desc:"Fiesta navideña de noche con shows y música estilo Hollywood clásico." },
    { id:"navwdw26", r:"wdw", name:"Temporada navideña", place:"Todos los parques", from:"2026-11-13", to:"2027-01-06",
      desc:"Decoración, shows y desfiles navideños incluidos con la entrada común." },
    { id:"fothol26", r:"wdw", name:"EPCOT Festival of the Holidays", place:"EPCOT", from:"2026-11-27", to:"2026-12-30",
      desc:"Puestos de comida navideña de distintos países y coros en vivo." },
    { id:"fw26", r:"wdw", name:"EPCOT Food & Wine Festival", place:"EPCOT", from:"2026-08-27", to:"2026-11-21",
      desc:"Decenas de puestos con platos y bebidas de todo el mundo (se pagan aparte, la entrada al festival está incluida)." },
    { id:"arts27", r:"wdw", name:"EPCOT Festival of the Arts", place:"EPCOT", from:"2027-01-15", to:"2027-03-01",
      desc:"Arte, música en vivo y comida de autor en todo World Showcase." },
    { id:"flower27", r:"wdw", name:"EPCOT Flower & Garden Festival", place:"EPCOT", from:"2027-03-10", to:"2027-05-31",
      desc:"Jardines y esculturas de personajes hechas con plantas, más puestos de comida." },
    { id:"mnsshp27", r:"wdw", name:"Mickey's Not-So-Scary Halloween Party", place:"Magic Kingdom", from:"2027-08-13", to:"2027-10-31", aprox:true, noches:true, extra:true, price:[119,229],
      desc:"Fiesta de Halloween para toda la familia: disfraces, caramelos, desfile y fuegos especiales." },
    { id:"fw27", r:"wdw", name:"EPCOT Food & Wine Festival", place:"EPCOT", from:"2027-08-26", to:"2027-11-20", aprox:true,
      desc:"Decenas de puestos con platos y bebidas de todo el mundo." },
    { id:"mvmcp27", r:"wdw", name:"Mickey's Very Merry Christmas Party", place:"Magic Kingdom", from:"2027-11-07", to:"2027-12-21", aprox:true, noches:true, extra:true, price:[189,229],
      desc:"Fiesta navideña de noche: desfile, fuegos especiales y nieve en Main Street." },
    { id:"navwdw27", r:"wdw", name:"Temporada navideña", place:"Todos los parques", from:"2027-11-12", to:"2028-01-06", aprox:true,
      desc:"Decoración, shows y desfiles navideños incluidos con la entrada común." },

    // Universal Orlando
    { id:"hhn26", r:"uor", name:"Halloween Horror Nights", place:"Universal Studios Florida", from:"2026-08-28", to:"2026-11-01", noches:true, extra:true,
      desc:"Casas del terror y zonas de sustos de noche. No recomendado para chicos." },
    { id:"holu26", r:"uor", name:"Holidays at Universal", place:"Universal Studios e Islands of Adventure", from:"2026-11-14", to:"2027-01-03",
      desc:"Desfile navideño, show de luces en Hogwarts y el Grinch, incluidos con la entrada." },
    { id:"mardi27", r:"uor", name:"Universal Mardi Gras", place:"Universal Studios Florida", from:"2027-02-06", to:"2027-04-03", aprox:true,
      desc:"Desfile de carrozas, comida de Nueva Orleans y recitales en vivo, incluidos con la entrada." },
    { id:"hhn27", r:"uor", name:"Halloween Horror Nights", place:"Universal Studios Florida", from:"2027-08-27", to:"2027-11-01", aprox:true, noches:true, extra:true,
      desc:"Casas del terror y zonas de sustos de noche. No recomendado para chicos." },
    { id:"holu27", r:"uor", name:"Holidays at Universal", place:"Universal Studios e Islands of Adventure", from:"2027-11-13", to:"2028-01-03", aprox:true,
      desc:"Desfile navideño y show de luces en Hogwarts, incluidos con la entrada." },

    // Disneyland
    { id:"muertos26", r:"dlr", name:"Celebración de Coco / Día de los Muertos", place:"California Adventure", from:"2026-08-21", to:"2026-11-02",
      desc:"Plaza de la Familia con música, ofrendas y comida mexicana." },
    { id:"holdl26", r:"dlr", name:"Temporada navideña", place:"Disneyland y California Adventure", from:"2026-11-18", to:"2027-01-06", aprox:true,
      desc:"El castillo nevado, desfile navideño y fuegos especiales, incluidos con la entrada." },
    { id:"lny27", r:"dlr", name:"Lunar New Year", place:"California Adventure", from:"2027-01-22", to:"2027-02-21", aprox:true,
      desc:"Celebración del Año Nuevo lunar con desfile, comida asiática y personajes." },
    { id:"fwdl27", r:"dlr", name:"Food & Wine Festival", place:"California Adventure", from:"2027-03-05", to:"2027-04-26", aprox:true,
      desc:"Puestos de comida y vino de California." },
    { id:"hallo27", r:"dlr", name:"Halloween Time", place:"Disneyland y California Adventure", from:"2027-08-20", to:"2027-10-31", aprox:true,
      desc:"Decoración de Halloween y atracciones con versión especial." },
    { id:"oogie27", r:"dlr", name:"Oogie Boogie Bash", place:"California Adventure", from:"2027-08-24", to:"2027-10-31", aprox:true, noches:true, extra:true,
      desc:"Fiesta de Halloween de noche con disfraces, caramelos y desfile de villanos." }
  ],

  // Planes de comidas de Disney (solo con hotel Disney en Walt Disney World). Precio aprox. por adulto y por noche, con impuestos, sin propina.
  planesComida: [
    { id:"qs", name:"Quick-Service Dining Plan", price:60,
      desc:"Por noche de hotel: 2 comidas de servicio rápido (pedís en el mostrador) + 1 snack o bebida. Incluye un vaso recargable para usar en el hotel." },
    { id:"ddp", name:"Disney Dining Plan", price:99,
      desc:"Por noche de hotel: 1 comida de servicio rápido + 1 comida en restaurante con mozo + 1 snack o bebida. Incluye vaso recargable." },
    { id:"dx", name:"Deluxe Dining Plan", price:null, off:true,
      desc:"Era el plan completo: 3 comidas por noche en cualquier restaurante + 2 snacks. Disney no lo ofrece actualmente; si vuelve, te avisamos." }
  ],

  // Pestaña "Antes de viajar"
  apps: [
    { r:["wdw","cruise"], name:"My Disney Experience", para:"Walt Disney World (Orlando)", url:"https://disneyworld.disney.go.com/",
      uso:"Mapa del parque con tu ubicación, tiempos de espera, entradas, Lightning Lane, pedidos de comida y reservas de restaurantes." },
    { r:["dlr"], name:"Disneyland App", para:"Disneyland Resort (California)", url:"https://disneyland.disney.go.com/",
      uso:"Mapa, tiempos de espera, entradas, Lightning Lane y pedidos de comida." },
    { r:["uor"], name:"Universal Orlando Resort", para:"Universal Orlando", url:"https://www.universalorlando.com/",
      uso:"Mapa, tiempos de espera, Virtual Line y turnos de Volcano Bay." },
    { r:["ush"], name:"Universal Studios Hollywood", para:"Universal Hollywood", url:"https://www.universalstudioshollywood.com/",
      uso:"Mapa, tiempos de espera y horarios de shows." },
    { r:["cruise"], name:"Disney Cruise Line Navigator", para:"Crucero Disney", url:"https://disneycruise.disney.go.com/",
      uso:"Programa del barco, chat a bordo y reservas de actividades." }
  ],
  // dias: cuántos días antes de la salida conviene hacerlo (null = sin fecha fija)
  checklist: [
    { id:"pasaporte", dias:180, t:"Pasaporte vigente", d:"Revisá que no venza durante el viaje. Si hay que renovarlo, hacelo con tiempo." },
    { id:"visa", dias:180, t:"Visa de Estados Unidos", d:"Los argentinos necesitan visa de turista (B1/B2). Los turnos de entrevista pueden demorar meses: revisá los plazos en el sitio de la embajada." },
    { id:"restaurantes", dias:60, t:"Reservas de restaurantes Disney", d:"Disney abre las reservas 60 días antes (huéspedes de hoteles Disney pueden reservar para toda la estadía). Los más buscados se agotan el primer día." },
    { id:"asistencia", dias:30, t:"Asistencia al viajero", d:"Contratala antes de salir. En Estados Unidos la atención médica es muy cara." },
    { id:"appsbajadas", dias:14, t:"Bajar las apps oficiales y vincular entradas", d:"Creá la cuenta, cargá las entradas y la reserva de hotel en la app de cada parque." },
    { id:"lightning", dias:7, t:"Lightning Lane / filas rápidas", d:"Con hotel Disney se reserva 7 días antes del check-in; sin hotel Disney, 3 días antes de cada día de parque." },
    { id:"calzado", dias:14, t:"Calzado cómodo y ya usado", d:"Vas a caminar más de 10 km por día. Nada de zapatillas nuevas el primer día de parque." },
    { id:"adaptador", dias:7, t:"Adaptador de enchufe", d:"En Estados Unidos los enchufes son de patas planas (tipo A/B): necesitás adaptador." },
    { id:"datos", dias:3, t:"Internet en el celular", d:"Las apps de los parques necesitan datos todo el día: eSIM, roaming o chip local. Llevá batería externa." },
    { id:"lluvia", dias:3, t:"Poncho y protector solar", d:"En Orlando llueve casi todas las tardes en verano. El poncho del parque sale caro." }
  ],

  hoteles: ["Hotel Disney categoría Value","Hotel Disney categoría Moderate","Hotel Disney categoría Deluxe","Hotel de Universal","Hotel fuera de los parques","Casa / alquiler temporario","Ya tengo alojamiento"],
  extras: ["Vuelo desde Buenos Aires","Traslados aeropuerto","Asistencia al viajero","Lightning Lane (filas rápidas Disney)","Universal Express (filas rápidas Universal)","Plan de comidas (Solo en Disney)","Alquiler de auto"],
  puertosCrucero: ["Port Canaveral (Orlando)","Fort Lauderdale","Miami","Galveston","Me da igual"]
};
