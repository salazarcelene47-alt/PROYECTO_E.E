/* ==============================================
   E.E SADEP — script.js
   ============================================== */

/* ---------- ESTADO GLOBAL ---------- */
var userRole = null;
var currentSlide = 0;
var totalSlides = 3;
var autoCarouselTimer = null;

/* ---------- FRASES INSPIRADORAS POR ROL ---------- */
var FRASES_POR_ROL = {
  egresados: "Si quieres llegar rápido, camina solo. Si quieres llegar lejos, camina acompañado.",
  estudiantes: "Si quieres llegar rápido, camina solo. Si quieres llegar lejos, camina acompañado.",
  admin: "Como administrador, cuidas que todos caminemos juntos hacia el éxito."
};

/* ---------- INICIO ---------- */
document.addEventListener("DOMContentLoaded", function () {
  iniciarCarrusel();
  configurarInputListeners();

  var rolGuardado = localStorage.getItem("tipoUsuario");
  if (rolGuardado && ["egresados", "estudiantes", "admin"].includes(rolGuardado)) {
    userRole = rolGuardado;
    entrarAlPortal(rolGuardado);
  }
});

/* ==============================================
   CARRUSEL
   ============================================== */
function iniciarCarrusel() {
  var imgs = document.querySelectorAll("#carousel img");
  totalSlides = imgs.length || 3;
  actualizarCarrusel();
  autoCarouselTimer = setInterval(siguienteDiapositiva, 4000);
}

function actualizarCarrusel() {
  var c = document.getElementById("carousel");
  if (!c) return;
  c.style.transform = "rotateY(" + currentSlide * -120 + "deg)";
}

function siguienteDiapositiva() {
  currentSlide = (currentSlide + 1) % totalSlides;
  actualizarCarrusel();
}

/* ==============================================
   VALIDACIONES
   ============================================== */
function validarCorreo(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarContrasena(p) {
  if (!p || p.length < 7)
    return { valida: false, mensaje: "La contraseña debe tener al menos 7 caracteres" };
  if (!/[a-zA-Z]/.test(p))
    return { valida: false, mensaje: "La contraseña debe contener al menos una letra" };
  return { valida: true, mensaje: "" };
}

/* ==============================================
   LOGIN
   ============================================== */
function configurarInputListeners() {
  var iE = document.getElementById("email");
  var iP = document.getElementById("password");
  if (iE) {
    iE.addEventListener("input", function () {
      ocultarError("errorEmail");
      this.classList.remove("input-error");
    });
  }
  if (iP) {
    iP.addEventListener("input", function () {
      ocultarError("errorPassword");
      this.classList.remove("input-error");
    });
  }
}

function ocultarError(id) {
  var el = document.getElementById(id);
  if (el) { el.textContent = ""; el.classList.remove("show"); }
}

function mostrarError(id, msg) {
  var el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add("show"); }
}

function limpiarErroresLogin() {
  ocultarError("errorEmail");
  ocultarError("errorPassword");
  var em = document.getElementById("email");
  var pw = document.getElementById("password");
  if (em) em.classList.remove("input-error");
  if (pw) pw.classList.remove("input-error");
}

function validarYEntrar(event) {
  if (event) event.preventDefault();
  limpiarErroresLogin();

  var email    = document.getElementById("email")    ? document.getElementById("email").value.trim()    : "";
  var password = document.getElementById("password") ? document.getElementById("password").value        : "";
  var rol      = document.getElementById("rol")      ? document.getElementById("rol").value             : "inicio";

  if (rol === "inicio") {
    alert("Por favor selecciona un tipo de usuario");
    return;
  }

  var hayError = false;

  if (!email) {
    mostrarError("errorEmail", "El correo es obligatorio");
    if (document.getElementById("email")) document.getElementById("email").classList.add("input-error");
    hayError = true;
  } else if (!validarCorreo(email)) {
    mostrarError("errorEmail", "Ingresa un correo electrónico válido");
    if (document.getElementById("email")) document.getElementById("email").classList.add("input-error");
    hayError = true;
  }

  if (!password) {
    mostrarError("errorPassword", "La contraseña es obligatoria");
    if (document.getElementById("password")) document.getElementById("password").classList.add("input-error");
    hayError = true;
  } else {
    var v = validarContrasena(password);
    if (!v.valida) {
      mostrarError("errorPassword", v.mensaje);
      if (document.getElementById("password")) document.getElementById("password").classList.add("input-error");
      hayError = true;
    }
  }

  if (hayError) return;

  userRole = rol;
  localStorage.setItem("tipoUsuario", rol);
  localStorage.setItem("correoUsuario", email);
  entrarAlPortal(rol);
}

/* ==============================================
   PORTAL
   ============================================== */
function entrarAlPortal(rol) {
  var loginSec = document.getElementById("login-section");
  var header   = document.getElementById("header-nav");
  var portal   = document.getElementById("portal");
  if (loginSec) loginSec.style.display = "none";
  if (header)   header.style.display   = "none";
  if (portal)   portal.style.display   = "block";

  if (autoCarouselTimer) clearInterval(autoCarouselTimer);

  var egresados   = document.getElementById("content-egresados");
  var estudiantes = document.getElementById("content-estudiantes");
  var admin       = document.getElementById("content-admin");
  if (egresados)   egresados.style.display   = (rol === "egresados")   ? "block" : "none";
  if (estudiantes) estudiantes.style.display = (rol === "estudiantes") ? "block" : "none";
  if (admin)       admin.style.display       = (rol === "admin")       ? "block" : "none";

  volverAlPortalPrincipal();
  montarMuroEnSeccionActiva();
  renderizarComentarios();

  if (rol === "admin") setTimeout(cargarRegistros, 400);
}

function irAInicio() {
  if (confirm("¿Cerrar sesión y volver al inicio?")) cerrarSesion();
}

function cerrarSesion() {
  userRole = null;
  localStorage.removeItem("tipoUsuario");
  localStorage.removeItem("correoUsuario");

  var portal = document.getElementById("portal");
  if (portal) portal.style.display = "none";

  ["content-egresados", "content-estudiantes", "content-admin"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  ["muro-egresados", "muro-estudiantes", "muro-admin"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.dataset.mounted = "";
  });

  var loginSec = document.getElementById("login-section");
  var header   = document.getElementById("header-nav");
  if (loginSec) loginSec.style.display = "flex";
  if (header)   header.style.display   = "block";

  var rolEl   = document.getElementById("rol");
  var emailEl = document.getElementById("email");
  var passEl  = document.getElementById("password");
  if (rolEl)   rolEl.value   = "inicio";
  if (emailEl) emailEl.value = "";
  if (passEl)  passEl.value  = "";

  limpiarErroresLogin();
  currentSlide = 0;
  actualizarCarrusel();
  autoCarouselTimer = setInterval(siguienteDiapositiva, 4000);
}

/* ==============================================
   NAVEGACIÓN INTERNA DEL PORTAL
   ============================================== */
function volverAlPortal() {
  volverAlPortalPrincipal();
}

function volverAlPortalPrincipal() {
  var perfil    = document.getElementById("vista-perfil");
  var conocenos = document.getElementById("vista-conocenos");
  var hojaVida  = document.getElementById("vista-hoja-vida");
  var lideres   = document.getElementById("vista-lideres");
  var principal = document.getElementById("vista-portal-principal");
  var iframe    = document.getElementById("cv-iframe");
  if (perfil)    perfil.style.display    = "none";
  if (conocenos) conocenos.style.display = "none";
  if (hojaVida)  hojaVida.style.display  = "none";
  if (lideres)   lideres.style.display   = "none";
  if (iframe)    iframe.src              = "";
  if (principal) principal.style.display = "block";
}

function mostrarPerfil() {
  var principal = document.getElementById("vista-portal-principal");
  var conocenos = document.getElementById("vista-conocenos");
  var hojaVida  = document.getElementById("vista-hoja-vida");
  var lideres   = document.getElementById("vista-lideres");
  var perfil    = document.getElementById("vista-perfil");
  var iframe    = document.getElementById("cv-iframe");
  if (principal) principal.style.display = "none";
  if (conocenos) conocenos.style.display = "none";
  if (hojaVida)  hojaVida.style.display  = "none";
  if (lideres)   lideres.style.display   = "none";
  if (iframe)    iframe.src              = "";
  if (perfil)    perfil.style.display    = "block";
  montarPerfil();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function mostrarConocenos() {
  var principal = document.getElementById("vista-portal-principal");
  var perfil    = document.getElementById("vista-perfil");
  var hojaVida  = document.getElementById("vista-hoja-vida");
  var lideres   = document.getElementById("vista-lideres");
  var conocenos = document.getElementById("vista-conocenos");
  var iframe    = document.getElementById("cv-iframe");
  if (principal) principal.style.display = "none";
  if (perfil)    perfil.style.display    = "none";
  if (hojaVida)  hojaVida.style.display  = "none";
  if (lideres)   lideres.style.display   = "none";
  if (iframe)    iframe.src              = "";
  if (conocenos) conocenos.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function mostrarLideres() {
  var principal = document.getElementById("vista-portal-principal");
  var perfil    = document.getElementById("vista-perfil");
  var conocenos = document.getElementById("vista-conocenos");
  var hojaVida  = document.getElementById("vista-hoja-vida");
  var lideres   = document.getElementById("vista-lideres");
  var iframe    = document.getElementById("cv-iframe");
  if (principal) principal.style.display = "none";
  if (perfil)    perfil.style.display    = "none";
  if (conocenos) conocenos.style.display = "none";
  if (hojaVida)  hojaVida.style.display  = "none";
  if (iframe)    iframe.src              = "";
  if (lideres)   lideres.style.display   = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function abrirConocenos(n) {
  var cvArchivos = {
    1: "hoja_de_vida_cele.html",
    2: "hoja_de_vida_dayana.html",
    3: "hoja_de_vida_maria.html"
  };
  var conocenos = document.getElementById("vista-conocenos");
  var hojaVida  = document.getElementById("vista-hoja-vida");
  var iframe    = document.getElementById("cv-iframe");
  if (conocenos) conocenos.style.display = "none";
  if (hojaVida)  hojaVida.style.display  = "block";
  if (iframe && cvArchivos[n]) iframe.src = cvArchivos[n];
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function volverAConocenos() {
  var hojaVida  = document.getElementById("vista-hoja-vida");
  var conocenos = document.getElementById("vista-conocenos");
  var iframe    = document.getElementById("cv-iframe");
  if (hojaVida)  hojaVida.style.display  = "none";
  if (iframe)    iframe.src              = "";
  if (conocenos) conocenos.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ==============================================
   AYUDA
   ============================================== */
function mostrarAyuda() {
  alert(
    "AYUDA\n\n" +
    "ACCESO:\n" +
    "- Selecciona tu tipo de usuario\n" +
    "- Ingresa tu correo y contraseña (mínimo 7 caracteres con al menos una letra)\n\n" +
    "ESTUDIANTE: Acceso a recursos académicos\n" +
    "EGRESADO: Área de egresados\n" +
    "ADMIN: Administración del portal\n\n" +
    "REGISTRO:\n" +
    "- Usa el botón 'Registro' para enviar una solicitud de ingreso\n" +
    "- Un administrador revisará y aprobará tu solicitud"
  );
}

/* ==============================================
   MODAL DE REGISTRO
   ============================================== */
function abrirRegistro() {
  var modal = document.getElementById("modal-registro");
  if (!modal) return;
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  var exito    = document.getElementById("reg-exito");
  var errorMsg = document.getElementById("reg-error-msg");
  var form     = document.getElementById("form-registro");
  if (exito)    exito.style.display    = "none";
  if (errorMsg) errorMsg.style.display = "none";
  if (form)     { form.style.display   = "block"; form.reset(); }
}

function cerrarRegistro() {
  var modal = document.getElementById("modal-registro");
  if (modal) modal.style.display = "none";
  document.body.style.overflow = "";
}

function cerrarRegistroSiAfuera(event) {
  var modal = document.getElementById("modal-registro");
  if (event.target === modal) cerrarRegistro();
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") cerrarRegistro();
});

function mostrarErrorReg(msg) {
  var el = document.getElementById("reg-error-msg");
  if (el) { el.textContent = msg; el.style.display = "block"; }
}

function enviarRegistro(event) {
  event.preventDefault();

  var nombre     = document.getElementById("reg-nombre")     ? document.getElementById("reg-nombre").value.trim()     : "";
  var correo     = document.getElementById("reg-correo")     ? document.getElementById("reg-correo").value.trim()     : "";
  var password   = document.getElementById("reg-password")   ? document.getElementById("reg-password").value           : "";
  var password2  = document.getElementById("reg-password2")  ? document.getElementById("reg-password2").value          : "";
  var telefono   = document.getElementById("reg-telefono")   ? document.getElementById("reg-telefono").value.trim()   : "";
  var graduacion = document.getElementById("reg-graduacion") ? document.getElementById("reg-graduacion").value.trim() : "";
  var tipo       = document.getElementById("reg-tipo")       ? document.getElementById("reg-tipo").value               : "";

  var errEl     = document.getElementById("reg-error-msg");
  var exitoEl   = document.getElementById("reg-exito");
  var btnEnviar = document.getElementById("btn-reg-enviar");

  if (errEl)   errEl.style.display   = "none";
  if (exitoEl) exitoEl.style.display = "none";

  if (!nombre) { mostrarErrorReg("El nombre completo es obligatorio."); return; }
  if (!correo || !validarCorreo(correo)) { mostrarErrorReg("Ingresa un correo electrónico válido."); return; }

  var vPass = validarContrasena(password);
  if (!vPass.valida) { mostrarErrorReg(vPass.mensaje); return; }
  if (password !== password2) { mostrarErrorReg("Las contraseñas no coinciden."); return; }

  if (btnEnviar) { btnEnviar.disabled = true; btnEnviar.textContent = "Enviando..."; }

  var cuerpo = { nombreCompleto: nombre, correo: correo, password: password };
  if (telefono)   cuerpo.telefono      = telefono;
  if (graduacion) cuerpo.anoGraduacion = graduacion;
  if (tipo)       cuerpo.tipoUsuario   = tipo;

  fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo)
  })
    .then(function (res) {
      return res.json().then(function (data) { return { ok: res.ok, data: data }; });
    })
    .then(function (r) {
      if (r.ok) {
        var form = document.getElementById("form-registro");
        if (form) form.style.display = "none";
        if (exitoEl) {
          exitoEl.textContent = "¡Solicitud enviada! " + (r.data.message || "Un administrador revisará tu registro.");
          exitoEl.style.display = "block";
        }
      } else {
        mostrarErrorReg(r.data.error || "Error al enviar. Intenta de nuevo.");
      }
    })
    .catch(function () {
      mostrarErrorReg("Error de conexión. Verifica tu internet e intenta de nuevo.");
    })
    .finally(function () {
      if (btnEnviar) { btnEnviar.disabled = false; btnEnviar.textContent = "Enviar solicitud"; }
    });
}

/* ==============================================
   ADMIN — GESTIÓN DE REGISTROS
   ============================================== */
var ROL_ETIQUETAS = {
  usuario_solicitante: "Solicitante",
  egresados: "Egresado",
  estudiantes: "Estudiante",
  admin: "Administrador"
};

function cargarRegistros() {
  var lista = document.getElementById("lista-registros");
  if (!lista) return;
  lista.innerHTML = '<div class="reg-cargando">Cargando solicitudes...</div>';

  fetch("/api/admin/users")
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var users = data.users || [];
      if (users.length === 0) {
        lista.innerHTML = '<div class="reg-vacio">No hay solicitudes de registro aún.</div>';
        return;
      }
      lista.innerHTML = users.map(crearTarjetaRegistro).join("");
    })
    .catch(function () {
      lista.innerHTML = '<div class="reg-vacio" style="color:#fca5a5;">Error al cargar. Verifica la conexión con el servidor.</div>';
    });
}

function crearTarjetaRegistro(u) {
  var fecha = new Date(u.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  var extras = [];
  if (u.tipoUsuario)   extras.push('<span class="reg-tipo">Tipo: '       + escapar(u.tipoUsuario)   + '</span>');
  if (u.anoGraduacion) extras.push('<span class="reg-grad">Graduación: ' + escapar(u.anoGraduacion) + '</span>');
  if (u.telefono)      extras.push('<span class="reg-tel">Tel: '         + escapar(u.telefono)      + '</span>');

  var statusLabel = u.status ? (u.status.charAt(0).toUpperCase() + u.status.slice(1)) : "";
  var rolLabel    = ROL_ETIQUETAS[u.rol] || u.rol || "";

  var botones = "";
  if (u.status !== "aceptado")
    botones += '<button class="btn-aceptar"  onclick="actualizarUsuario(' + u.id + ', \'aceptado\', null)">✓ Aceptar</button>';
  if (u.status !== "rechazado")
    botones += '<button class="btn-rechazar" onclick="actualizarUsuario(' + u.id + ', \'rechazado\', null)">✕ Rechazar</button>';
  botones +=
    '<select class="rol-selector" id="rolsel-' + u.id + '" onchange="cambiarRol(' + u.id + ')">' +
      '<option value="">Cambiar rol...</option>' +
      '<option value="usuario_solicitante">Solicitante</option>' +
      '<option value="egresados">Egresado</option>' +
      '<option value="estudiantes">Estudiante</option>' +
      '<option value="admin">Administrador</option>' +
    '</select>';

  return (
    '<div class="reg-card" id="regcard-' + u.id + '">' +
      '<div class="reg-card-head">' +
        '<div class="reg-card-info">' +
          '<h4>' + escapar(u.nombreCompleto) + '</h4>' +
          '<div class="reg-correo">' + escapar(u.correo) + '</div>' +
          '<div class="reg-detalles">' +
            '<span class="reg-badge ' + u.status + '">' + statusLabel + '</span>' +
            '<span class="reg-badge" style="background:rgba(76,111,255,0.2);border:1px solid rgba(76,111,255,0.4);color:#a5b4fc;">' + escapar(rolLabel) + '</span>' +
          '</div>' +
          (extras.length ? '<div class="reg-detalles" style="margin-top:4px;">' + extras.join("") + '</div>' : '') +
          '<div class="reg-fecha">Registrado: ' + fecha + '</div>' +
        '</div>' +
        '<div class="reg-card-acciones">' + botones + '</div>' +
      '</div>' +
    '</div>'
  );
}

function cambiarRol(id) {
  var sel = document.getElementById("rolsel-" + id);
  if (!sel || !sel.value) return;
  actualizarUsuario(id, null, sel.value);
}

function actualizarUsuario(id, status, rol) {
  var cuerpo = {};
  if (status) cuerpo.status = status;
  if (rol)    cuerpo.rol    = rol;

  fetch("/api/admin/users/" + id + "/status", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo)
  })
    .then(function (res) {
      return res.json().then(function (data) { return { ok: res.ok, data: data }; });
    })
    .then(function (r) {
      if (r.ok) {
        var card = document.getElementById("regcard-" + id);
        if (card) card.outerHTML = crearTarjetaRegistro(r.data);
      } else {
        alert(r.data.error || "Error al actualizar");
      }
    })
    .catch(function () { alert("Error de conexión al actualizar"); });
}

/* ==============================================
   PERFIL
   ============================================== */
var ICONOS = ["👤","🎓","👨‍🎓","👩‍🎓","🧑‍💼","👨‍🏫","👩‍🏫","🧑‍💻","🎯","⭐","🚀","💡","📚","🏆","🌟","🦊","🐱","🐯","🦄","🌈"];
var ETIQUETA_ROL = { egresados: "Egresado", estudiantes: "Estudiante", admin: "Administrador" };

function clavePerfilDe(correo) { return "perfil_" + (correo || "").toLowerCase(); }

function obtenerPerfil(correo) {
  try {
    var raw = localStorage.getItem(clavePerfilDe(correo));
    return raw ? JSON.parse(raw) : { nombre: "", icono: "" };
  } catch (e) { return { nombre: "", icono: "" }; }
}

function obtenerPerfilActual() {
  return obtenerPerfil(localStorage.getItem("correoUsuario") || "");
}

function inicialesDe(rol, correo) {
  if (correo && correo.includes("@")) {
    var n = correo.split("@")[0];
    return (n[0] + (n[1] || "")).toUpperCase();
  }
  return ((ETIQUETA_ROL[rol] || "U")).substring(0, 2).toUpperCase();
}

function montarPerfil() {
  var correo  = localStorage.getItem("correoUsuario") || "";
  var rol     = localStorage.getItem("tipoUsuario") || userRole || "";
  var p       = obtenerPerfil(correo);

  var elCorreo = document.getElementById("perfilCorreo");
  var elRol    = document.getElementById("perfilRol");
  var elNombre = document.getElementById("perfilNombre");
  var elAvatar = document.getElementById("perfilAvatarGrande");
  var elPicker = document.getElementById("iconPicker");

  if (elCorreo) elCorreo.textContent = correo || "—";
  if (elRol)    elRol.textContent    = ETIQUETA_ROL[rol] || "—";
  if (elNombre) elNombre.value       = p.nombre || (correo ? correo.split("@")[0] : "");

  if (elAvatar) {
    elAvatar.textContent     = p.icono || inicialesDe(rol, correo);
    elAvatar.dataset.tmpIcon = p.icono || "";
  }

  if (elPicker) {
    elPicker.innerHTML = "";
    ICONOS.forEach(function (icon) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "icon-option" + (p.icono === icon ? " selected" : "");
      btn.textContent = icon;
      btn.onclick = function () { elegirIcono(icon); };
      elPicker.appendChild(btn);
    });
  }
}

function elegirIcono(icon) {
  document.querySelectorAll(".icon-option").forEach(function (b) {
    b.classList.toggle("selected", b.textContent === icon);
  });
  var av = document.getElementById("perfilAvatarGrande");
  if (av) { av.textContent = icon; av.dataset.tmpIcon = icon; }
}

function guardarPerfil() {
  var correo  = localStorage.getItem("correoUsuario") || "";
  if (!correo) { alert("No hay sesión activa"); return; }

  var elNombre = document.getElementById("perfilNombre");
  var elAvatar = document.getElementById("perfilAvatarGrande");
  var nombre   = elNombre ? elNombre.value.trim() : "";
  var icono    = elAvatar ? (elAvatar.dataset.tmpIcon || "") : "";

  localStorage.setItem(clavePerfilDe(correo), JSON.stringify({ nombre: nombre, icono: icono }));
  actualizarAvatarEnMuro();
  renderizarComentarios();
  alert("Perfil actualizado correctamente");
  volverAlPortalPrincipal();
}

function actualizarAvatarEnMuro() {
  var correo = localStorage.getItem("correoUsuario") || "";
  var rol    = localStorage.getItem("tipoUsuario") || userRole || "";
  var p      = obtenerPerfil(correo);
  var av     = p.icono || inicialesDe(rol, correo);
  ["muroAvatar-muro-egresados", "muroAvatar-muro-estudiantes", "muroAvatar-muro-admin"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = av;
  });
}

/* ==============================================
   MURO DE COMENTARIOS
   ============================================== */
var CLAVE_COMENTARIOS = "comentarios_sadep";
var MAX_CARACTERES    = 500;

function obtenerComentarios() {
  try {
    var raw = localStorage.getItem(CLAVE_COMENTARIOS);
    var arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}

function guardarComentarios(arr) {
  localStorage.setItem(CLAVE_COMENTARIOS, JSON.stringify(arr));
}

function montarMuroEnSeccionActiva() {
  ["muro-egresados", "muro-estudiantes", "muro-admin"].forEach(function (id) {
    var cont = document.getElementById(id);
    if (!cont) return;
    var sec = cont.closest(".portal-content-section");
    if (!sec || sec.style.display === "none") return;
    if (cont.dataset.mounted === "true") return;
    construirMuro(cont, id);
    cont.dataset.mounted = "true";
  });
}

function construirMuro(cont, id) {
  var rol    = localStorage.getItem("tipoUsuario") || userRole || "estudiantes";
  var correo = localStorage.getItem("correoUsuario") || "";
  var p      = obtenerPerfil(correo);
  var av     = p.icono || inicialesDe(rol, correo);
  
  /* Obtener la frase inspiradora según el rol */
  var frase = FRASES_POR_ROL[rol] || FRASES_POR_ROL.estudiantes;
  
  /* Nombres personalizados por rol */
  var nombreSeccion = ETIQUETA_ROL[rol] || "Comunidad";

  cont.innerHTML =
    '<div class="muro-header">' +
      '<div class="muro-titulo">' +
        '<h3>' + escapar(nombreSeccion) + '</h3>' +
        '<p>' + escapar(frase) + '</p>' +
      '</div>' +
    '</div>' +
    '<div class="muro-form">' +
      '<div class="form-row">' +
        '<div class="muro-avatar" id="muroAvatar-' + id + '">' + escapar(av) + '</div>' +
        '<textarea id="muroInput-' + id + '" maxlength="' + MAX_CARACTERES + '" placeholder="¿Qué quieres compartir con la comunidad SADEP?" oninput="actualizarContador(\'' + id + '\')"></textarea>' +
      '</div>' +
      '<div class="muro-form-actions">' +
        '<span class="muro-counter" id="muroCounter-' + id + '">0 / ' + MAX_CARACTERES + '</span>' +
        '<button class="btn-publicar" onclick="publicarComentario(\'' + id + '\')">Publicar →</button>' +
      '</div>' +
    '</div>' +
    '<div class="muro-lista" id="muroLista-' + id + '"></div>';
}

function actualizarContador(id) {
  var ta = document.getElementById("muroInput-" + id);
  var c  = document.getElementById("muroCounter-" + id);
  if (!ta || !c) return;
  c.textContent = ta.value.length + " / " + MAX_CARACTERES;
  c.classList.toggle("alert", ta.value.length > MAX_CARACTERES - 30);
}

function publicarComentario(id) {
  var ta    = document.getElementById("muroInput-" + id);
  if (!ta)  return;
  var texto = ta.value.trim();
  if (!texto) { alert("Escribe algo antes de publicar"); return; }
  if (texto.length > MAX_CARACTERES) { alert("Máximo " + MAX_CARACTERES + " caracteres"); return; }

  var rol    = localStorage.getItem("tipoUsuario") || userRole || "estudiantes";
  var correo = localStorage.getItem("correoUsuario") || "";
  var p      = obtenerPerfilActual();
  var nuevoId = (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : Date.now() + "-" + Math.random().toString(36).slice(2, 9);

  var nuevo = {
    id: nuevoId,
    texto: texto,
    autor: rol,
    correo: correo,
    nombre: p.nombre || "",
    icono: p.icono || "",
    fecha: new Date().toISOString(),
    likes: 0,
    likedBy: []
  };

  var arr = obtenerComentarios();
  arr.push(nuevo);
  guardarComentarios(arr);
  ta.value = "";
  actualizarContador(id);
  renderizarComentarios();
}

function darLike(commentId) {
  var arr    = obtenerComentarios();
  var idx    = arr.findIndex(function (c) { return c.id === commentId; });
  if (idx === -1) return;
  var correo = localStorage.getItem("correoUsuario") || userRole || "anon";
  var c      = arr[idx];
  c.likedBy  = Array.isArray(c.likedBy) ? c.likedBy : [];
  var yaLiked = c.likedBy.indexOf(correo) !== -1;

  if (yaLiked) {
    c.likes   = Math.max(0, (c.likes || 0) - 1);
    c.likedBy = c.likedBy.filter(function (u) { return u !== correo; });
  } else {
    c.likes = (c.likes || 0) + 1;
    c.likedBy.push(correo);
  }

  arr[idx] = c;
  guardarComentarios(arr);

  document.querySelectorAll('.like-btn[data-id="' + commentId + '"]').forEach(function (btn) {
    btn.classList.toggle("liked", !yaLiked);
    btn.classList.add("pop");
    var contEl  = btn.querySelector(".like-count");
    var heartEl = btn.querySelector(".heart");
    if (contEl)  contEl.textContent  = c.likes;
    if (heartEl) heartEl.textContent = !yaLiked ? "❤️" : "🤍";
    setTimeout(function () { btn.classList.remove("pop"); }, 360);
  });
}

function eliminarComentario(commentId) {
  var correo  = localStorage.getItem("correoUsuario") || "";
  var rol     = localStorage.getItem("tipoUsuario") || userRole || "";
  var arr     = obtenerComentarios();
  var idx     = arr.findIndex(function (c) { return c.id === commentId; });
  if (idx === -1) return;

  var c       = arr[idx];
  var esPropio = c.correo && c.correo === correo;
  var esAdmin  = rol === "admin";
  if (!esPropio && !esAdmin) { alert("No tienes permiso para eliminar este comentario"); return; }

  var msg = (esAdmin && !esPropio)
    ? "¿Eliminar este comentario como administrador?"
    : "¿Seguro que quieres eliminar tu comentario?";
  if (!confirm(msg)) return;

  arr.splice(idx, 1);
  guardarComentarios(arr);
  renderizarComentarios();
}

function avatarDeComentario(c) {
  var p = obtenerPerfil(c.correo);
  if (p && p.icono) return p.icono;
  if (c.icono) return c.icono;
  return inicialesDe(c.autor, c.correo);
}

function nombreDeComentario(c) {
  var p = obtenerPerfil(c.correo);
  if (p && p.nombre) return p.nombre;
  if (c.nombre) return c.nombre;
  if (c.correo && c.correo.includes("@")) return c.correo.split("@")[0];
  return ETIQUETA_ROL[c.autor] || "Usuario";
}

function tiempoRelativo(iso) {
  var diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)     return "hace unos segundos";
  if (diff < 3600)   return "hace " + Math.floor(diff / 60) + " min";
  if (diff < 86400)  return "hace " + Math.floor(diff / 3600) + " h";
  if (diff < 604800) return "hace " + Math.floor(diff / 86400) + " d";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function renderizarComentarios() {
  var arr    = obtenerComentarios().slice().sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });
  var correo = localStorage.getItem("correoUsuario") || "";
  var rol    = localStorage.getItem("tipoUsuario") || userRole || "";

  ["muroLista-muro-egresados", "muroLista-muro-estudiantes", "muroLista-muro-admin"].forEach(function (lid) {
    var lista = document.getElementById(lid);
    if (!lista) return;

    if (arr.length === 0) {
      lista.innerHTML =
        '<div class="muro-empty">' +
          '<span class="icon">💭</span>' +
          '<p><strong>Aún no hay publicaciones</strong></p>' +
          '<p>Sé el primero en escribir algo en la comunidad.</p>' +
        '</div>';
      return;
    }

    var html = "";
    arr.forEach(function (c) {
      var yaLiked  = Array.isArray(c.likedBy) && c.likedBy.indexOf(correo) !== -1;
      var rolKey   = ETIQUETA_ROL[c.autor] ? c.autor : "estudiantes";
      var av       = avatarDeComentario(c);
      var nb       = nombreDeComentario(c);
      var esPropio = c.correo && c.correo === correo;
      var esAdmin  = rol === "admin";
      var puedeElim = esPropio || esAdmin;
      var claseMod  = (esAdmin && !esPropio) ? " admin" : "";
      var labelMod  = (esAdmin && !esPropio) ? "Moderar" : "Eliminar";

      var btnElim = puedeElim
        ? '<button type="button" class="btn-borrar' + claseMod + '" onclick="eliminarComentario(\'' + c.id + '\')">🗑️ ' + labelMod + '</button>'
        : "";

      html +=
        '<article class="comentario-card" data-id="' + c.id + '">' +
          '<div class="comentario-head">' +
            '<div class="comentario-avatar">' + escapar(av) + '</div>' +
            '<div class="comentario-meta">' +
              '<div class="comentario-autor">' +
                '<span>' + escapar(nb) + '</span>' +
                '<span class="role-badge">' + escapar(ETIQUETA_ROL[rolKey] || "Usuario") + '</span>' +
              '</div>' +
              '<div class="comentario-fecha">' + tiempoRelativo(c.fecha) + '</div>' +
            '</div>' +
          '</div>' +
          '<p class="comentario-texto">' + escapar(c.texto) + '</p>' +
          '<div class="comentario-acciones">' +
            '<button type="button" class="like-btn ' + (yaLiked ? "liked" : "") + '" data-id="' + c.id + '" onclick="darLike(\'' + c.id + '\')">' +
              '<span class="heart">' + (yaLiked ? "❤️" : "🤍") + '</span>' +
              '<span class="like-count">' + Number(c.likes || 0) + '</span>' +
            '</button>' +
            btnElim +
          '</div>' +
        '</article>';
    });
    lista.innerHTML = html;
  });
}

/* ==============================================
   UTILIDADES
   ============================================== */
function escapar(s) {
  return String(s || "")
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#039;");
}
