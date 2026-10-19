// Plano para marcar el punto: parcelario del Catastro sobre callejero (OpenStreetMap) u ortofoto (PNOA, IGN).
// Al hacer clic se identifica la parcela catastral, se dibuja su contorno y se envía su referencia con el formulario.
(function () {
  const CATASTRO = "https://ovc.catastro.meh.es";
  const mapa = L.map("mapa", { zoomControl: true }).setView([40.2, -3.6], 6);

  const plano = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 20, maxNativeZoom: 19, className: "gris", attribution: "© colaboradores de OpenStreetMap"
  }).addTo(mapa);
  const callejero = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 20, maxNativeZoom: 19, attribution: "© colaboradores de OpenStreetMap"
  });
  const ortofoto = L.tileLayer.wms("https://www.ign.es/wms-inspire/pnoa-ma", {
    layers: "OI.OrthoimageCoverage", format: "image/jpeg", maxZoom: 20,
    attribution: "PNOA cedido por © Instituto Geográfico Nacional"
  });
  const parcelas = L.tileLayer.wms(CATASTRO + "/Cartografia/WMS/ServidorWMS.aspx", {
    layers: "Catastro", format: "image/png", transparent: true, minZoom: 15, maxZoom: 20, tileSize: 512, zIndex: 5,
    attribution: "Parcelario © Dirección General del Catastro"
  }).addTo(mapa);
  L.control.layers(
    { "Plano catastral": plano, "Callejero": callejero, "Foto aérea": ortofoto },
    { "Parcelas del Catastro": parcelas },
    { position: "topright" }
  ).addTo(mapa);

  const icono = L.divIcon({ className: "", html: '<div style="width:22px;height:22px;border-radius:50%;background:#737D61;border:4px solid #fff;box-shadow:0 0 0 2px #737D61"></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
  let punto = null, contorno = null, consulta = 0;
  const lat = document.getElementById("lat"), lon = document.getElementById("lon"), texto = document.getElementById("punto-texto");
  const caja = document.getElementById("parcela"), rc = document.getElementById("rc"), rcTexto = document.getElementById("rc-texto");
  const direccion = document.getElementById("direccion"), error = document.getElementById("error");
  const fmt = n => n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function marcar(latlng, zoom) {
    if (punto) punto.setLatLng(latlng); else punto = L.marker(latlng, { icon: icono, draggable: true, zIndexOffset: 1000 }).addTo(mapa);
    punto.off("dragend").on("dragend", e => marcar(e.target.getLatLng()));
    lat.value = latlng.lat.toFixed(6);
    lon.value = latlng.lng.toFixed(6);
    texto.textContent = "Punto marcado. Puedes arrastrarlo para afinar.";
    error.textContent = "";
    if (zoom) mapa.setView(latlng, zoom);
    identifica(latlng);
  }
  mapa.on("click", e => marcar(e.latlng, Math.max(mapa.getZoom(), 18)));

  // parcela catastral del punto: referencia, dirección, superficie y contorno
  async function identifica(latlng) {
    const n = ++consulta;
    rc.value = ""; rcTexto.value = "";
    if (contorno) { mapa.removeLayer(contorno); contorno = null; }
    caja.classList.remove("oculto");
    caja.textContent = "Buscando la parcela en el Catastro…";
    try {
      const url = CATASTRO + "/OVCServWeb/OVCWcfCallejero/COVCCoordenadas.svc/json/Consulta_RCCOOR?SRS=EPSG:4326&CoorX=" + latlng.lng.toFixed(6) + "&CoorY=" + latlng.lat.toFixed(6);
      const d = await fetch(url).then(r => r.json());
      if (n !== consulta) return;
      const c = d.Consulta_RCCOORResult?.coordenadas?.coord?.[0];
      if (!c) {
        caja.textContent = "Ese punto no cae dentro de ninguna parcela del Catastro (puede ser la calle o una zona con catastro foral). Si es correcto, puedes enviarlo igualmente.";
        return;
      }
      const ref = c.pc.pc1 + c.pc.pc2, dir = (c.ldt || "").trim();
      rc.value = ref;
      caja.innerHTML = "Parcela catastral <b></b><br><span></span>";
      caja.querySelector("b").textContent = ref;
      caja.querySelector("span").textContent = dir;
      rcTexto.value = ref + " · " + dir;
      if (direccion && !direccion.value) direccion.value = dir;
      dibuja(ref, n);
    } catch (e) {
      if (n === consulta) caja.textContent = "No se pudo consultar el Catastro ahora. Tu punto queda marcado igualmente.";
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
        s.textContent = " · Superficie de parcela: " + fmt(parseFloat(area.textContent)) + " m²";
        caja.appendChild(s);
        rcTexto.value += " · " + fmt(parseFloat(area.textContent)) + " m²";
      }
    } catch (e) { /* el contorno es una ayuda visual; la referencia ya está */ }
  }

  // buscador de direcciones (Nominatim, OpenStreetMap)
  const buscar = document.getElementById("buscar"), boton = document.getElementById("buscar-boton");
  async function busca() {
    const q = buscar.value.trim();
    if (!q) return;
    boton.disabled = true;
    try {
      const r = await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=es&q=" + encodeURIComponent(q));
      const d = await r.json();
      if (d.length) { mapa.setView([+d[0].lat, +d[0].lon], 18); texto.textContent = "Ahora haz clic exactamente dentro de tu parcela."; }
      else texto.textContent = "No encontramos esa dirección. Prueba con otra o mueve el plano.";
    } catch (e) { texto.textContent = "No se pudo buscar ahora. Mueve el plano a mano."; }
    boton.disabled = false;
  }
  boton.addEventListener("click", busca);
  buscar.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); busca(); } });

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
      error.textContent = "Marca primero tu punto en el plano.";
      document.getElementById("mapa").scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
})();
