// Plano para marcar el punto: parcelario del Catastro sobre callejero (OpenStreetMap) u ortofoto (PNOA, IGN).
// Al hacer clic se identifica la parcela catastral, se dibuja su contorno y se envía su referencia con el formulario.
(function () {
  const CATASTRO = "https://ovc.catastro.meh.es";

  // textos en el idioma de la página (es, ca, en)
  const IDIOMA = (document.documentElement.lang || "es").slice(0, 2);
  const TEXTOS = {
    es: {
      osm: "© colaboradores de OpenStreetMap", pnoa: "PNOA cedido por © Instituto Geográfico Nacional", cat: "Parcelario © Dirección General del Catastro",
      plano: "Plano catastral", callejero: "Callejero", foto: "Foto aérea", parcelas: "Parcelas del Catastro",
      marcado: "Punto marcado. Puedes arrastrarlo para afinar.", buscandoParcela: "Buscando la parcela en el Catastro…",
      fuera: "Ese punto no cae dentro de ninguna parcela del Catastro (puede ser la calle o una zona con catastro foral). Si es correcto, puedes enviarlo igualmente.",
      parcela: "Parcela catastral", sinCatastro: "No se pudo consultar el Catastro ahora. Tu punto queda marcado igualmente.",
      superficie: "Superficie de parcela", porRC: "Esta es la parcela de esa referencia catastral.",
      porDireccion: "Te marcamos la parcela que el Catastro asigna a esa dirección. Comprueba que es la tuya; si no, haz clic sobre la correcta.",
      clic: "Ahora haz clic exactamente dentro de tu parcela.", numero: "Añade el número o haz clic exactamente dentro de tu parcela.",
      zona: "Acerca el plano a tu calle o añade la dirección completa.",
      noEncontrada: "No encontramos esa dirección. Prueba con otra, con la referencia catastral o mueve el plano.",
      sinBuscar: "No se pudo buscar ahora. Mueve el plano a mano.", buscando: "Buscando…", sinPunto: "Marca primero tu punto en el plano."
    },
    ca: {
      osm: "© col·laboradors d'OpenStreetMap", pnoa: "PNOA cedit per © Institut Geogràfic Nacional", cat: "Parcel·lari © Direcció General del Cadastre",
      plano: "Plànol cadastral", callejero: "Carrerer", foto: "Foto aèria", parcelas: "Parcel·les del Cadastre",
      marcado: "Punt marcat. Pots arrossegar-lo per afinar.", buscandoParcela: "Buscant la parcel·la al Cadastre…",
      fuera: "Aquest punt no cau dins de cap parcel·la del Cadastre (pot ser el carrer o una zona amb cadastre foral). Si és correcte, pots enviar-lo igualment.",
      parcela: "Parcel·la cadastral", sinCatastro: "No s'ha pogut consultar el Cadastre ara. El teu punt queda marcat igualment.",
      superficie: "Superfície de parcel·la", porRC: "Aquesta és la parcel·la d'aquesta referència cadastral.",
      porDireccion: "T'hem marcat la parcel·la que el Cadastre assigna a aquesta adreça. Comprova que és la teva; si no, fes clic sobre la correcta.",
      clic: "Ara fes clic exactament dins de la teva parcel·la.", numero: "Afegeix el número o fes clic exactament dins de la teva parcel·la.",
      zona: "Apropa el plànol al teu carrer o afegeix l'adreça completa.",
      noEncontrada: "No trobem aquesta adreça. Prova'n una altra, amb la referència cadastral o mou el plànol.",
      sinBuscar: "Ara no s'ha pogut buscar. Mou el plànol a mà.", buscando: "Buscant…", sinPunto: "Marca primer el teu punt al plànol."
    },
    en: {
      osm: "© OpenStreetMap contributors", pnoa: "PNOA courtesy of © Instituto Geográfico Nacional", cat: "Parcels © Spanish Directorate General for Cadastre",
      plano: "Cadastral map", callejero: "Street map", foto: "Aerial photo", parcelas: "Cadastre parcels",
      marcado: "Point marked. You can drag it to fine-tune.", buscandoParcela: "Looking up the parcel in the Cadastre…",
      fuera: "That point is not inside any Cadastre parcel (it may be the street or an area with a regional cadastre). If it is correct, you can still send it.",
      parcela: "Cadastral parcel", sinCatastro: "The Cadastre could not be reached right now. Your point is still marked.",
      superficie: "Plot area", porRC: "This is the parcel for that cadastral reference.",
      porDireccion: "We have marked the parcel the Cadastre assigns to that address. Check it is yours; if not, click on the right one.",
      clic: "Now click exactly inside your parcel.", numero: "Add the street number or click exactly inside your parcel.",
      zona: "Zoom in to your street or add the full address.",
      noEncontrada: "We could not find that address. Try another one, the cadastral reference, or move the map.",
      sinBuscar: "Search is not available right now. Move the map by hand.", buscando: "Searching…", sinPunto: "First mark your point on the map."
    }
  };
  const T = TEXTOS[IDIOMA] || TEXTOS.es;
  const mapa = L.map("mapa", { zoomControl: true }).setView([40.2, -3.6], 6);

  const plano = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 20, maxNativeZoom: 19, className: "gris", attribution: T.osm
  }).addTo(mapa);
  const callejero = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 20, maxNativeZoom: 19, attribution: T.osm
  });
  const ortofoto = L.tileLayer.wms("https://www.ign.es/wms-inspire/pnoa-ma", {
    layers: "OI.OrthoimageCoverage", format: "image/jpeg", maxZoom: 20,
    attribution: T.pnoa
  });
  const parcelas = L.tileLayer.wms(CATASTRO + "/Cartografia/WMS/ServidorWMS.aspx", {
    layers: "Catastro", format: "image/png", transparent: true, minZoom: 15, maxZoom: 20, tileSize: 512, zIndex: 5,
    attribution: T.cat
  }).addTo(mapa);
  L.control.layers(
    { [T.plano]: plano, [T.callejero]: callejero, [T.foto]: ortofoto },
    { [T.parcelas]: parcelas },
    { position: "topright" }
  ).addTo(mapa);

  const icono = L.divIcon({ className: "", html: '<div style="width:22px;height:22px;border-radius:50%;background:#737D61;border:4px solid #fff;box-shadow:0 0 0 2px #737D61"></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
  let punto = null, contorno = null, consulta = 0;
  const lat = document.getElementById("lat"), lon = document.getElementById("lon"), texto = document.getElementById("punto-texto");
  const caja = document.getElementById("parcela"), rc = document.getElementById("rc"), rcTexto = document.getElementById("rc-texto");
  const direccion = document.getElementById("direccion"), error = document.getElementById("error");
  const fmtEs = n => n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmt = n => n.toLocaleString(IDIOMA === "en" ? "en-GB" : "es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function marcar(latlng, zoom, conocida) {
    if (punto) punto.setLatLng(latlng); else punto = L.marker(latlng, { icon: icono, draggable: true, zIndexOffset: 1000 }).addTo(mapa);
    punto.off("dragend").on("dragend", e => marcar(e.target.getLatLng()));
    lat.value = latlng.lat.toFixed(6);
    lon.value = latlng.lng.toFixed(6);
    texto.textContent = T.marcado;
    error.textContent = "";
    if (zoom) mapa.setView(latlng, zoom);
    identifica(latlng, conocida);
  }
  mapa.on("click", e => marcar(e.latlng, Math.max(mapa.getZoom(), 18)));

  // parcela catastral del punto: referencia, dirección, superficie y contorno
  async function identifica(latlng, conocida) {
    const n = ++consulta;
    rc.value = ""; rcTexto.value = "";
    if (contorno) { mapa.removeLayer(contorno); contorno = null; }
    caja.classList.remove("oculto");
    caja.textContent = T.buscandoParcela;
    try {
      let c = conocida;
      if (!c) {
        const url = CATASTRO + "/OVCServWeb/OVCWcfCallejero/COVCCoordenadas.svc/json/Consulta_RCCOOR?SRS=EPSG:4326&CoorX=" + latlng.lng.toFixed(6) + "&CoorY=" + latlng.lat.toFixed(6);
        const d = await fetch(url).then(r => r.json());
        if (n !== consulta) return;
        c = d.Consulta_RCCOORResult?.coordenadas?.coord?.[0];
      }
      if (!c) {
        caja.textContent = T.fuera;
        return;
      }
      const ref = c.pc.pc1 + c.pc.pc2, dir = (c.ldt || "").trim();
      rc.value = ref;
      caja.innerHTML = T.parcela + " <b></b><br><span></span>";
      caja.querySelector("b").textContent = ref;
      caja.querySelector("span").textContent = dir;
      rcTexto.value = ref + " · " + dir;
      if (direccion && !direccion.value) direccion.value = dir;
      dibuja(ref, n);
    } catch (e) {
      if (n === consulta) caja.textContent = T.sinCatastro;
    }
  }

  async function dibuja(ref, n) {
    try {
      const xml = await fetch(CATASTRO + "/INSPIRE/wfsCP.aspx?service=wfs&version=2&request=getfeature&STOREDQUERIE_ID=GetParcel&srsname=EPSG:4326&refcat=" + ref).then(r => r.text());
      if (n !== consulta) return;
      const doc = new DOMParser().parseFromString(xml, "text/xml");
      const anillos = [...doc.getElementsByTagNameNS("*", "posList")].map(p => {
        const v = p.textContent.trim().split(/\s+/).map(Number), pts = [];
        for (let i = 0; i + 1 < v.length; i += 2) pts.push([v[i], v[i + 1]]);
        return pts;
      }).filter(a => a.length > 2);
      if (anillos.length) {
        contorno = L.polygon(anillos, { color: "#666D46", weight: 3, fillColor: "#96A085", fillOpacity: 0.35, interactive: false }).addTo(mapa);
      }
      const area = doc.getElementsByTagNameNS("*", "areaValue")[0];
      if (area && caja.querySelector("span")) {
        const s = document.createElement("span");
        s.textContent = " · " + T.superficie + ": " + fmt(parseFloat(area.textContent)) + " m²";
        caja.appendChild(s);
        rcTexto.value += " · " + fmtEs(parseFloat(area.textContent)) + " m²";
      }
    } catch (e) { /* el contorno es una ayuda visual; la referencia ya está */ }
  }

  // buscador: CartoCiudad (IGN) entiende la dirección escrita y el callejero del Catastro da la parcela exacta.
  // También admite una referencia catastral. Si todo falla, recurre a OpenStreetMap.
  const CALLEJERO = CATASTRO + "/OVCServWeb/OVCWcfCallejero/COVCCallejero.svc/json/";
  const SIGLAS = { "CALLE": "CL", "CARRER": "CL", "AVENIDA": "AV", "AVINGUDA": "AV", "CARRETERA": "CR", "PLAZA": "PZ", "PLAÇA": "PZ",
    "PASEO": "PS", "PASSEIG": "PS", "GRAN VIA": "GV", "RAMBLA": "RB", "RONDA": "RD", "CAMINO": "CM", "CAMI": "CM", "TRAVESIA": "TR",
    "TRAVESSERA": "TR", "PASAJE": "PJ", "PASSATGE": "PJ", "GLORIETA": "GL", "URBANIZACION": "UR", "POLIGONO": "PG", "BARRIO": "BO",
    "CUESTA": "CU", "BULEVAR": "BV", "ALAMEDA": "AL", "PARQUE": "PQ", "SENDA": "SD", "VIA": "VI", "RIERA": "RR", "LUGAR": "LG" };
  const VACIAS = new Set(["DE", "DEL", "LA", "LAS", "LOS", "EL", "ELS", "LES", "L", "D", "DA", "DO", "DAS", "DOS", "I", "Y", "A"]);
  const norm = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
  const palabras = s => norm(s).replace(/'/g, " ").split(" ").filter(w => w && !VACIAS.has(w));
  const parecido = (a, b) => { const A = palabras(a), B = new Set(palabras(b)); return A.filter(w => B.has(w)).length / Math.max(A.length, B.size, 1); };
  const larga = s => palabras(s).sort((x, y) => y.length - x.length)[0] || norm(s);
  const json = url => fetch(url).then(r => r.json());
  let provincias = null;

  async function parcelaPorDireccion(c) {
    if (!provincias) {
      const p = await json(CALLEJERO + "ObtenerProvincias");
      provincias = Object.fromEntries((p.consulta_provincieroResult?.provinciero?.prov || []).map(x => [x.cpine, x.np]));
    }
    const prov = provincias[c.provinceCode];
    if (!prov) return null;
    const m = await json(CALLEJERO + "ObtenerMunicipios?Provincia=" + encodeURIComponent(prov) + "&Municipio=" + encodeURIComponent(larga(c.muni)));
    const munis = m.consulta_municipieroResult?.municipiero?.muni || [];
    const muni = munis.sort((x, y) => parecido(c.muni, y.nm) - parecido(c.muni, x.nm))[0]?.nm;
    if (!muni) return null;
    const tipo = norm(c.tip_via), sigla = SIGLAS[tipo] || "";
    const nombre = norm((c.address || "").split(",")[0]).replace(/\s+\d+\w*$/, "").replace(new RegExp("^" + tipo + " "), "");
    const v = await json(CALLEJERO + "ObtenerCallejero?Provincia=" + encodeURIComponent(prov) + "&Municipio=" + encodeURIComponent(muni) + "&TipoVia=" + sigla + "&NomVia=" + encodeURIComponent(larga(nombre)));
    const calles = (v.consulta_callejeroResult?.callejero?.calle || []).filter(x => parecido(nombre, x.dir.nv) > 0);
    const calle = calles.sort((x, y) => parecido(nombre, y.dir.nv) - parecido(nombre, x.dir.nv))[0];
    if (!calle) return null;
    const d = await json(CALLEJERO + "Consulta_DNPLOC?Provincia=" + encodeURIComponent(prov) + "&Municipio=" + encodeURIComponent(muni) + "&Sigla=" + calle.dir.tv + "&Calle=" + encodeURIComponent(calle.dir.nv) + "&Numero=" + c.portalNumber);
    const r = d.consulta_dnplocResult;
    if (!r || r.control?.cuerr) return null;
    const pc = JSON.stringify(r).match(/"pc1":"(\w{7})","pc2":"(\w{7})"/);
    return pc ? pc[1] + pc[2] : null;
  }

  async function coordenadasParcela(ref) {
    const d = await json(CATASTRO + "/OVCServWeb/OVCWcfCallejero/COVCCoordenadas.svc/json/Consulta_CPMRC?SRS=EPSG:4326&RefCat=" + ref);
    return d.Consulta_CPMRCResult?.coordenadas?.coord?.[0] || null;
  }

  function colocaParcela(c, aviso) {
    marcar(L.latLng(+c.geo.ycen, +c.geo.xcen), 19, c);
    texto.textContent = aviso;
  }

  // ir a una sugerencia de CartoCiudad: portal → parcela exacta; calle, municipio o código postal → encuadre
  const GEOCODER = "https://www.cartociudad.es/geocoder/api/geocoder/";
  async function irA(c) {
    if (c.portalNumber && !c.noNumber) {
      const ref = await parcelaPorDireccion(c).catch(() => null) || c.refCatastral;
      const p = ref && await coordenadasParcela(ref).catch(() => null);
      if (p) { colocaParcela(p, T.porDireccion); return true; }
      if (c.lat && c.lng) { mapa.setView([c.lat, c.lng], 19); texto.textContent = T.clic; return true; }
    }
    const f = await json(GEOCODER + "find?q=" + encodeURIComponent(c.address)).catch(() => null);
    const g = f && f.geom ? f.geom.match(/-?\d+(\.\d+)?\s+-?\d+(\.\d+)?/g) : null;
    if (g && g.length > 1) {
      const pts = g.map(x => x.trim().split(/\s+/).map(Number)).map(([x, y]) => [y, x]);
      mapa.fitBounds(L.latLngBounds(pts), { maxZoom: /callejero|calle|vial/i.test(c.type) ? 18 : 16, padding: [20, 20] });
    } else if (f && f.lat && f.lng) {
      mapa.setView([f.lat, f.lng], /codpost/i.test(c.type) ? 15 : 17);
    } else return false;
    texto.textContent = /municipio|poblacion|codpost|provincia/i.test(c.type) ? T.zona : T.numero;
    return true;
  }

  const buscar = document.getElementById("buscar"), boton = document.getElementById("buscar-boton");
  async function busca(elegida) {
    const q = buscar.value.trim();
    if (!q && !elegida) return;
    cierraLista();
    boton.disabled = true;
    texto.textContent = T.buscando;
    try {
      const posibleRC = q.replace(/\s/g, "").toUpperCase();
      if (!elegida && /^[0-9A-Z]{14}([0-9A-Z]{6})?$/.test(posibleRC) && /\d{5}/.test(posibleRC)) {
        const c = await coordenadasParcela(posibleRC.slice(0, 14));
        if (c) { colocaParcela(c, T.porRC); return; }
      }
      const c = elegida || (await json(GEOCODER + "candidates?limit=1&q=" + encodeURIComponent(q)).catch(() => []))[0];
      if (c && await irA(c)) return;
      const d = await json("https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=es&q=" + encodeURIComponent(q));
      const zona = d.length && /city|town|village|municipality|county|state|province|suburb|hamlet/.test(d[0].addresstype || d[0].type);
      if (d.length) { mapa.setView([+d[0].lat, +d[0].lon], zona ? 15 : 18); texto.textContent = zona ? T.zona : T.clic; }
      else texto.textContent = T.noEncontrada;
    } catch (e) { texto.textContent = T.sinBuscar; }
    finally { boton.disabled = false; }
  }
  boton.addEventListener("click", () => busca());

  // sugerencias mientras se escribe (CartoCiudad: portales, calles, municipios, poblaciones y códigos postales de toda España)
  const TIPOS = {
    es: { portal: "Dirección", callejero: "Calle", Municipio: "Municipio", poblacion: "Población", Codpost: "Código postal", provincia: "Provincia", carretera: "Carretera", toponimo: "Lugar", rc: "Referencia catastral" },
    ca: { portal: "Adreça", callejero: "Carrer", Municipio: "Municipi", poblacion: "Població", Codpost: "Codi postal", provincia: "Província", carretera: "Carretera", toponimo: "Lloc", rc: "Referència cadastral" },
    en: { portal: "Address", callejero: "Street", Municipio: "Municipality", poblacion: "Town", Codpost: "Postcode", provincia: "Province", carretera: "Road", toponimo: "Place", rc: "Cadastral reference" }
  }[IDIOMA] || {};
  const MINUS = new Set(["de", "del", "la", "las", "los", "el", "els", "les", "i", "y", "d", "l", "a", "en"]);
  const bonito = t => (t || "").toLowerCase().replace(/[^\s,()/'"-]+/g, (w, i) => (i > 0 && MINUS.has(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1));
  const lista = document.createElement("ul");
  lista.className = "sugerencias oculto"; lista.setAttribute("role", "listbox"); lista.id = "sugerencias";
  buscar.parentNode.style.position = "relative";
  buscar.parentNode.appendChild(lista);
  buscar.setAttribute("role", "combobox"); buscar.setAttribute("aria-autocomplete", "list");
  buscar.setAttribute("aria-controls", "sugerencias"); buscar.setAttribute("aria-expanded", "false");
  let opciones = [], activa = -1, peticion = 0, espera = null;

  function cierraLista() { lista.classList.add("oculto"); buscar.setAttribute("aria-expanded", "false"); activa = -1; }
  function pinta() {
    lista.innerHTML = "";
    opciones.forEach((o, i) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option"); li.id = "sug-" + i;
      if (i === activa) { li.setAttribute("aria-selected", "true"); buscar.setAttribute("aria-activedescendant", li.id); }
      const b = document.createElement("b"); b.textContent = o.titulo;
      const sp = document.createElement("span"); sp.textContent = o.detalle;
      li.append(b, sp);
      li.addEventListener("mousedown", e => { e.preventDefault(); elige(i); });
      lista.appendChild(li);
    });
    lista.classList.toggle("oculto", !opciones.length);
    buscar.setAttribute("aria-expanded", opciones.length ? "true" : "false");
  }
  function elige(i) {
    const o = opciones[i]; if (!o) return;
    buscar.value = o.titulo + (o.lugar ? ", " + o.lugar : "");
    cierraLista();
    busca(o.c);
  }
  async function sugiere() {
    const q = buscar.value.trim(), n = ++peticion;
    if (q.length < 3) { opciones = []; pinta(); return; }
    const rcq = q.replace(/\s/g, "").toUpperCase();
    if (/^[0-9A-Z]{14}([0-9A-Z]{6})?$/.test(rcq) && /\d{5}/.test(rcq)) {
      opciones = [{ titulo: rcq, detalle: TIPOS.rc, lugar: "", c: null }]; activa = 0; pinta(); return;
    }
    const cc = await json(GEOCODER + "candidates?limit=8&q=" + encodeURIComponent(q)).catch(() => []);
    if (n !== peticion) return;
    opciones = (cc || []).map(c => {
      const calle = bonito((c.address || "").split(",")[0]);
      const muni = c.muni || "", lugar = c.poblacion && c.poblacion !== muni ? c.poblacion + " (" + muni + ")" : muni;
      const esZona = /municipio|poblacion|provincia/i.test(c.type), esCP = /codpost/i.test(c.type);
      const titulo = esCP ? c.address : esZona ? (c.poblacion || muni || c.address) : calle;
      const partes = [TIPOS[c.type] || c.type];
      if (c.postalCode && !esCP) partes.push(c.postalCode);
      if (!esZona && lugar) partes.push(lugar);
      if (c.province && c.province !== muni) partes.push(c.province);
      return { titulo, detalle: partes.join(" · "), lugar: esZona || esCP ? "" : lugar, c, clave: esZona ? titulo + "|" + c.province : c.id };
    }).filter((o, i, todas) => todas.findIndex(x => x.clave === o.clave) === i);
    activa = -1; pinta();
  }
  buscar.addEventListener("input", () => { clearTimeout(espera); espera = setTimeout(sugiere, 220); });
  buscar.addEventListener("keydown", e => {
    const abierta = !lista.classList.contains("oculto") && opciones.length;
    if (e.key === "ArrowDown" && abierta) { e.preventDefault(); activa = (activa + 1) % opciones.length; pinta(); }
    else if (e.key === "ArrowUp" && abierta) { e.preventDefault(); activa = (activa - 1 + opciones.length) % opciones.length; pinta(); }
    else if (e.key === "Escape") { cierraLista(); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (abierta && activa >= 0 && opciones[activa].c) elige(activa);
      else if (abierta && opciones[0] && opciones[0].c && opciones.length === 1) elige(0);
      else busca();
    }
  });
  buscar.addEventListener("blur", () => setTimeout(cierraLista, 150));
  buscar.addEventListener("focus", () => { if (opciones.length && buscar.value.trim().length >= 3) pinta(); });

  // entrega por Instagram: pide el usuario
  const insta = document.getElementById("instagram");
  document.querySelectorAll("input[name=entrega]").forEach(r => r.addEventListener("change", () => {
    const si = r.value === "instagram" && r.checked;
    insta.classList.toggle("oculto", !si);
    insta.required = si;
  }));

  // validación: hace falta el punto
  document.getElementById("form").addEventListener("submit", e => {
    if (!lat.value) {
      e.preventDefault();
      error.textContent = T.sinPunto;
      document.getElementById("mapa").scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
})();
