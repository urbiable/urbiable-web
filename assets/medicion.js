/* Medición de URBIABLE con PostHog (UE, sin cookies: persistencia en memoria).
   Lo que se mide: visitas, origen, scroll, secciones vistas, vídeo de presentación, uso del plano y embudo del pedido
   (los eventos del plano y del formulario se lanzan desde mapa.js con window.urbiableEvento).
   Las grabaciones ocultan todo lo que se escribe y la caja de la parcela. */
!function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}p||((p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",p.onerror=function(){p=null},(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r));var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags on onFeatureFlags onSessionId identify setPersonProperties group resetGroups reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

(function () {
  var local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var idioma = (document.documentElement.lang || "es").slice(0, 2);
  posthog.init("phc_tXn6giRWpuAayJz2LLMnPm2mFm24HYMkbbXRWAKzkhjo", {
    api_host: "https://eu.i.posthog.com",
    defaults: "2026-05-30",
    persistence: "memory",              // sin cookies ni almacenamiento en el navegador
    person_profiles: "identified_only",
    respect_dnt: true,                  // si el navegador pide «No rastrear», no se mide (lo dice la privacidad)
    capture_pageview: true,
    capture_pageleave: true,            // incluye hasta dónde ha bajado cada visita
    session_recording: { maskAllInputs: true, maskTextSelector: "#parcela, .parcela, #punto-texto" },
    loaded: function (ph) { ph.register({ idioma_web: idioma, web: "urbiable.com" }); if (local) ph.opt_out_capturing(); }
  });

  // función común para mapa.js; «inmediato» para eventos justo antes de cambiar de página
  window.urbiableEvento = function (nombre, props, inmediato) {
    try { posthog.capture(nombre, props || {}, inmediato ? { send_instantly: true, transport: "sendBeacon" } : undefined); } catch (_) {}
  };

  document.addEventListener("DOMContentLoaded", function () {
    // secciones vistas (una vez cada una)
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { window.urbiableEvento("seccion_vista", { seccion: e.target.id }); obs.unobserve(e.target); }
        });
      }, { threshold: 0.35 });
      document.querySelectorAll("main section[id]").forEach(function (s) { obs.observe(s); });
    }
    // vídeo de presentación
    var v = document.querySelector(".portada-video video");
    if (v) {
      v.addEventListener("play", function () { window.urbiableEvento("video_presentacion_play"); }, { once: true });
      v.addEventListener("ended", function () { window.urbiableEvento("video_presentacion_completo"); }, { once: true });
    }
    // primer campo del formulario tocado
    var f = document.getElementById("form");
    var empezado = false;
    if (f) f.addEventListener("focusin", function (e) {
      if (!empezado && e.target.matches("input:not([type=hidden]):not(#buscar), select, textarea")) {
        empezado = true;
        window.urbiableEvento("formulario_empezado", { campo: e.target.name || e.target.id });
      }
    });
  });
})();
