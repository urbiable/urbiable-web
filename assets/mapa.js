// Plano para marcar el punto: callejero de OpenStreetMap y ortofoto PNOA del IGN (toda España).
(function () {
  const mapa = L.map("mapa", { zoomControl: true }).setView([40.2, -3.6], 6);
  const callejero = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: "© colaboradores de OpenStreetMap"
  }).addTo(mapa);
  const ortofoto = L.tileLayer.wms("https://www.ign.es/wms-inspire/pnoa-ma", {
    layers: "OI.OrthoimageCoverage", format: "image/jpeg", maxZoom: 20,
    attribution: "PNOA cedido por © Instituto Geográfico Nacional"
  });
  L.control.layers({ "Plano": callejero, "Foto aérea": ortofoto }, null, { position: "topright" }).addTo(mapa);

  const icono = L.divIcon({ className: "", html: '<div style="width:22px;height:22px;border-radius:50%;background:#737D61;border:4px solid #fff;box-shadow:0 0 0 2px #737D61"></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
  let punto = null;
  const lat = document.getElementById("lat"), lon = document.getElementById("lon"), texto = document.getElementById("punto-texto");

  function marcar(latlng, zoom) {
    if (punto) punto.setLatLng(latlng); else punto = L.marker(latlng, { icon: icono, draggable: true }).addTo(mapa);
    punto.off("dragend").on("dragend", e => marcar(e.target.getLatLng()));
    lat.value = latlng.lat.toFixed(6);
    lon.value = latlng.lng.toFixed(6);
    texto.textContent = "Punto marcado. Puedes arrastrarlo para afinar.";
    error.textContent = "";
    if (zoom) mapa.setView(latlng, zoom);
  }
  mapa.on("click", e => marcar(e.latlng, Math.max(mapa.getZoom(), 18)));

  // buscador de direcciones (Nominatim, OpenStreetMap)
  const buscar = document.getElementById("buscar"), boton = document.getElementById("buscar-boton");
  async function busca() {
    const q = buscar.value.trim();
    if (!q) return;
    boton.disabled = true;
    try {
      const r = await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=es&q=" + encodeURIComponent(q));
      const d = await r.json();
      if (d.length) { mapa.setView([+d[0].lat, +d[0].lon], 18); texto.textContent = "Ahora haz clic exactamente sobre tu solar o inmueble."; }
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
  const error = document.getElementById("error");
  document.getElementById("form").addEventListener("submit", e => {
    if (!lat.value) {
      e.preventDefault();
      error.textContent = "Marca primero tu punto en el plano.";
      document.getElementById("mapa").scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
})();
