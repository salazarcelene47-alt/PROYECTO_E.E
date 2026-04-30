/* ============================================================
   PAGINA E.E SADEP - JavaScript puro + localStorage
   ============================================================ */

let userRole = null;
let currentSlide = 0;

/* ===== CARRUSEL LOGIN ===== */
const slides = document.querySelectorAll('#carousel img');
const totalSlides = slides.length;

function updateCarousel(){
  const carousel = document.getElementById('carousel');
  if (!carousel) return;
  carousel.style.transform = 'rotateY(' + (currentSlide * -120) + 'deg)';
}
function nextSlide(){ currentSlide = (currentSlide + 1) % totalSlides; updateCarousel(); }
function prevSlide(){ currentSlide = (currentSlide - 1 + totalSlides) % totalSlides; updateCarousel(); }

let autoCarouselInterval = setInterval(nextSlide, 4000);

/* ===== VALIDACIONES LOGIN ===== */
function validarCorreo(email) {
  const regex = /^[^\s@]+@gmail\.com$/;
  return regex.test(email);
}
function validarContrasena(password) {
  if (password.length < 7) return { valida: false, mensaje: "La contraseña debe tener al menos 7 caracteres" };
  if (!/[a-zA-Z]/.test(password)) return { valida: false, mensaje: "La contraseña debe contener al menos una letra" };
  return { valida: true, mensaje: "" };
}
function limpiarErrores() {
  ["errorEmail","errorPassword"].forEach(id => {
    const e = document.getElementById(id);
    if (e) { e.textContent = ""; e.classList.remove("show"); }
  });
  ["email","password"].forEach(id => {
    const e = document.getElementById(id);
    if (e) e.classList.remove("input-error");
  });
}

function validarYEntrar(event) {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const rol = document.getElementById("rol").value;
  const errorEmail = document.getElementById("errorEmail");
  const errorPassword = document.getElementById("errorPassword");

  limpiarErrores();
  let hayErrores = false;

  if (rol === "inicio") { alert("Seleccione un tipo de usuario"); return; }
  if (!email) {
    errorEmail.textContent = "El correo es obligatorio";
    errorEmail.classList.add("show");
    document.getElementById("email").classList.add("input-error");
    hayErrores = true;
  } else if (!validarCorreo(email)) {
    errorEmail.textContent = "El correo debe ser de tipo @gmail.com";
    errorEmail.classList.add("show");
    document.getElementById("email").classList.add("input-error");
    hayErrores = true;
  }
  if (!password) {
    errorPassword.textContent = "La contraseña es obligatoria";
    errorPassword.classList.add("show");
    document.getElementById("password").classList.add("input-error");
    hayErrores = true;
  } else {
    const v = validarContrasena(password);
    if (!v.valida) {
      errorPassword.textContent = v.mensaje;
      errorPassword.classList.add("show");
      document.getElementById("password").classList.add("input-error");
      hayErrores = true;
    }
  }
  if (hayErrores) return;

  userRole = rol;
  localStorage.setItem("tipoUsuario", rol);
  localStorage.setItem("correoUsuario", email);

  entrarAlPortal(rol);
}

function entrarAlPortal(rol) {
  document.getElementById("login-section").style.display = "none";
  document.getElementById("header-nav").style.display = "none";
  document.getElementById("portal").style.display = "block";
  clearInterval(autoCarouselInterval);

  document.getElementById("content-egresados").style.display   = (rol === "egresados")   ? "block" : "none";
  document.getElementById("content-estudiantes").style.display = (rol === "estudiantes") ? "block" : "none";
  document.getElementById("content-admin").style.display       = (rol === "admin")       ? "block" : "none";

  volverAlPortal();
  montarMuroEnSeccionActiva();
  renderComentarios();
}

document.addEventListener("DOMContentLoaded", function() {
  const inputEmail = document.getElementById("email");
  const inputPassword = document.getElementById("password");

  inputEmail.addEventListener("input", function() {
    if (this.value.trim()) { document.getElementById("errorEmail").classList.remove("show"); this.classList.remove("input-error"); }
  });
  inputPassword.addEventListener("input", function() {
    if (this.value) { document.getElementById("errorPassword").classList.remove("show"); this.classList.remove("input-error"); }
  });

  const rolGuardado = localStorage.getItem("tipoUsuario");
  if (rolGuardado && ["egresados","estudiantes","admin"].includes(rolGuardado)) {
    userRole = rolGuardado;
    entrarAlPortal(rolGuardado);
  }
});

/* ===== AYUDA ===== */
function mostrarAyuda(){
  alert(
    "AYUDA\n\n" +
    "ACCESO:\n" +
    "- Selecciona tu tipo de usuario\n" +
    "- Ingresa tu correo @gmail.com y tu contraseña (mínimo 7 caracteres con al menos una letra)\n\n" +
    "TIPOS DE USUARIO:\n" +
    "ESTUDIANTE: Acceso a recursos académicos\n" +
    "EGRESADO: Área de egresados\n" +
    "ADMIN: Administración del portal (puede moderar el muro)"
  );
}

/* ===== LOGOUT ===== */
function logout(){
  userRole = null;
  localStorage.removeItem("tipoUsuario");
  localStorage.removeItem("correoUsuario");

  clearInterval(autoCarouselInterval);
  document.getElementById("portal").style.display = "none";
  document.getElementById("content-egresados").style.display = "none";
  document.getElementById("content-estudiantes").style.display = "none";
  document.getElementById("content-admin").style.display = "none";
  document.getElementById("login-section").style.display = "flex";
  document.getElementById("header-nav").style.display = "block";

  document.getElementById("rol").value = "inicio";
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";

  ["muro-egresados","muro-estudiantes","muro-admin"].forEach(id => {
    const c = document.getElementById(id);
    if (c) c.dataset.mounted = "";
  });

  currentSlide = 0;
  updateCarousel();
  autoCarouselInterval = setInterval(nextSlide, 4000);
  limpiarErrores();
}

function irAInicio(){
  if (confirm("¿Cerrar sesión y volver al inicio?")) logout();
}

/* ============================================================
   ===== PERFIL DE USUARIO (nombre + icono por correo) =====
   ============================================================ */
const ICONOS_DISPONIBLES = ["👤","🎓","👨‍🎓","👩‍🎓","🧑‍💼","👨‍🏫","👩‍🏫","🧑‍💻","🎯","⭐","🚀","💡","📚","🏆","🌟","🦊","🐱","🐯","🦄","🌈"];

function perfilKey(correo){ return "perfil_" + (correo || "").toLowerCase(); }

function obtenerPerfil(correo){
  try {
    const raw = localStorage.getItem(perfilKey(correo));
    return raw ? JSON.parse(raw) : { nombre: "", icono: "" };
  } catch (e) { return { nombre: "", icono: "" }; }
}
function obtenerPerfilActual(){
  return obtenerPerfil(localStorage.getItem("correoUsuario") || "");
}

function montarPerfil(){
  const correo = localStorage.getItem("correoUsuario") || "";
  const rol = localStorage.getItem("tipoUsuario") || userRole || "";
  const perfil = obtenerPerfil(correo);

  document.getElementById("perfilCorreo").textContent = correo || "—";
  document.getElementById("perfilRol").textContent = ROLE_LABEL[rol] || "—";
  document.getElementById("perfilNombre").value = perfil.nombre || (correo ? correo.split("@")[0] : "");

  const avatarGrande = document.getElementById("perfilAvatarGrande");
  avatarGrande.textContent = perfil.icono || inicialesDe(rol, correo);
  avatarGrande.dataset.tempIcon = perfil.icono || "";

  const picker = document.getElementById("iconPicker");
  picker.innerHTML = "";
  ICONOS_DISPONIBLES.forEach(icon => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "icon-option" + (perfil.icono === icon ? " selected" : "");
    btn.textContent = icon;
    btn.onclick = function(){ seleccionarIcono(icon); };
    picker.appendChild(btn);
  });
}

function seleccionarIcono(icon){
  document.querySelectorAll(".icon-option").forEach(b => {
    b.classList.toggle("selected", b.textContent === icon);
  });
  const av = document.getElementById("perfilAvatarGrande");
  av.textContent = icon;
  av.dataset.tempIcon = icon;
}

function guardarPerfil(){
  const correo = localStorage.getItem("correoUsuario") || "";
  if (!correo) { alert("No hay sesión activa"); return; }

  const nombre = document.getElementById("perfilNombre").value.trim();
  const icono = document.getElementById("perfilAvatarGrande").dataset.tempIcon || "";

  localStorage.setItem(perfilKey(correo), JSON.stringify({ nombre: nombre, icono: icono }));
  refrescarAvatarMuro();
  alert("Perfil actualizado correctamente");
  volverAlPortal();
}

/* ============================================================
   ===== NAVEGACIÓN ENTRE VISTAS =====
   ============================================================ */
function mostrarPerfil(){
  document.getElementById("vista-portal-principal").style.display = "none";
  document.getElementById("vista-conocenos").style.display = "none";
  document.getElementById("vista-perfil").style.display = "block";
  montarPerfil();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function mostrarConocenos(){
  document.getElementById("vista-portal-principal").style.display = "none";
  document.getElementById("vista-perfil").style.display = "none";
  document.getElementById("vista-conocenos").style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function volverAlPortal(){
  document.getElementById("vista-perfil").style.display = "none";
  document.getElementById("vista-conocenos").style.display = "none";
  document.getElementById("vista-portal-principal").style.display = "block";
}

/* ============================================================
   ===== SISTEMA DE COMENTARIOS =====
   ============================================================ */
const STORAGE_KEY = "comentarios";
const MAX_LEN = 500;

const ROLE_LABEL = {
  egresados: "Egresado",
  estudiantes: "Estudiante",
  admin: "Administrador"
};

function inicialesDe(rol, correo){
  if (correo && correo.includes("@")) {
    const nick = correo.split("@")[0];
    return (nick[0] + (nick[1] || "")).toUpperCase();
  }
  return (ROLE_LABEL[rol] || "U").substring(0,2).toUpperCase();
}

function avatarParaComentario(c){
  if (c.icono && c.icono.length) return c.icono;
  return inicialesDe(c.autor, c.correo);
}
function nombreParaComentario(c){
  if (c.nombre && c.nombre.length) return c.nombre;
  if (c.correo && c.correo.includes("@")) return c.correo.split("@")[0];
  return ROLE_LABEL[c.autor] || "Usuario";
}

function escapeHtml(str){
  return String(str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

function tiempoRelativo(iso){
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60)        return "hace unos segundos";
  if (diff < 3600)      return "hace " + Math.floor(diff/60) + " min";
  if (diff < 86400)     return "hace " + Math.floor(diff/3600) + " h";
  if (diff < 86400*7)   return "hace " + Math.floor(diff/86400) + " d";
  return d.toLocaleDateString("es-CO", { day:"2-digit", month:"short", year:"numeric" });
}

function obtenerComentarios(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch (e) { return []; }
}

function guardarComentario(texto){
  const limpio = String(texto || "").trim();
  if (!limpio) { alert("Escribe algo antes de publicar"); return false; }
  if (limpio.length > MAX_LEN) { alert("Máx " + MAX_LEN + " caracteres"); return false; }

  const tipoUsuario = localStorage.getItem("tipoUsuario") || userRole || "estudiantes";
  const correoUsuario = localStorage.getItem("correoUsuario") || "";
  const perfil = obtenerPerfilActual();

  let idNuevo;
  if (typeof crypto !== "undefined" && crypto.randomUUID) idNuevo = crypto.randomUUID();
  else idNuevo = Date.now() + "-" + Math.random().toString(36).slice(2,9);

  const nuevo = {
    id: idNuevo, texto: limpio, autor: tipoUsuario, correo: correoUsuario,
    nombre: perfil.nombre || "", icono: perfil.icono || "",
    fecha: new Date().toISOString(), likes: 0, likedBy: []
  };

  const comentarios = obtenerComentarios();
  comentarios.push(nuevo);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comentarios));
  return true;
}

function darLike(id){
  const comentarios = obtenerComentarios();
  const idx = comentarios.findIndex(c => c.id === id);
  if (idx === -1) return;

  const correoUsuario = localStorage.getItem("correoUsuario") || (userRole || "anon");
  const c = comentarios[idx];
  c.likedBy = Array.isArray(c.likedBy) ? c.likedBy : [];

  const yaLeDi = c.likedBy.includes(correoUsuario);
  if (yaLeDi) {
    c.likes = Math.max(0, (c.likes || 0) - 1);
    c.likedBy = c.likedBy.filter(u => u !== correoUsuario);
  } else {
    c.likes = (c.likes || 0) + 1;
    c.likedBy.push(correoUsuario);
  }
  comentarios[idx] = c;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comentarios));

  document.querySelectorAll('.like-btn[data-id="' + id + '"]').forEach(btn => {
    btn.classList.add("pop");
    btn.classList.toggle("liked", !yaLeDi);
    const span = btn.querySelector(".like-count");
    if (span) span.textContent = c.likes;
    setTimeout(() => btn.classList.remove("pop"), 360);
  });
}

/* ===== ELIMINAR COMENTARIO =====
   - Autor: borra su propio comentario
   - Admin: modera (borra cualquiera)
*/
function eliminarComentario(id){
  const correoActual = localStorage.getItem("correoUsuario") || "";
  const rolActual = localStorage.getItem("tipoUsuario") || userRole || "";

  const comentarios = obtenerComentarios();
  const idx = comentarios.findIndex(c => c.id === id);
  if (idx === -1) return;

  const c = comentarios[idx];
  const esPropio = c.correo && c.correo === correoActual;
  const esAdmin = rolActual === "admin";

  if (!esPropio && !esAdmin) {
    alert("No tienes permiso para eliminar este comentario");
    return;
  }

  const msg = esAdmin && !esPropio
    ? "¿Eliminar este comentario como administrador?"
    : "¿Seguro que quieres eliminar tu comentario?";
  if (!confirm(msg)) return;

  comentarios.splice(idx, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comentarios));
  renderComentarios();
}

/* ===== MURO ===== */
function montarMuroEnSeccionActiva(){
  const ids = ["muro-egresados", "muro-estudiantes", "muro-admin"];
  ids.forEach(id => {
    const cont = document.getElementById(id);
    if (!cont) return;

    const seccion = cont.closest(".portal-content-section");
    if (!seccion || seccion.style.display === "none") { cont.innerHTML = ""; return; }
    if (cont.dataset.mounted === "true") return;

    const rolActivo = localStorage.getItem("tipoUsuario") || userRole || "estudiantes";
    const correo = localStorage.getItem("correoUsuario") || "";
    const perfil = obtenerPerfil(correo);
    const avatar = perfil.icono || inicialesDe(rolActivo, correo);

    const subtitulo = (rolActivo === "admin")
      ? "Como administrador puedes moderar (eliminar) cualquier comentario."
      : "Conecta con egresados, estudiantes y administradores. Todos ven todos los comentarios.";

    cont.innerHTML =
      '<div class="muro-header">' +
        '<div class="muro-titulo"><div>' +
          '<h3>Muro Académico</h3>' +
          '<p>' + escapeHtml(subtitulo) + '</p>' +
        '</div></div>' +
        '<span class="muro-pill"><span class="dot"></span> En vivo</span>' +
      '</div>' +
      '<div class="muro-form">' +
        '<div class="form-row">' +
          '<div class="muro-avatar" id="muroAvatar-' + id + '">' + escapeHtml(avatar) + '</div>' +
          '<textarea id="muroInput-' + id + '" placeholder="¿Qué quieres compartir con la comunidad SADEP?" maxlength="' + MAX_LEN + '" oninput="actualizarContador(\'' + id + '\')"></textarea>' +
        '</div>' +
        '<div class="muro-form-actions">' +
          '<span class="muro-counter" id="muroCounter-' + id + '">0 / ' + MAX_LEN + '</span>' +
          '<button class="btn-publicar" onclick="onPublicarComentario(\'' + id + '\')">' +
            '<span>Publicar</span><span aria-hidden="true">→</span>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="muro-lista" id="muroLista-' + id + '"></div>';

    cont.dataset.mounted = "true";
  });
}

function refrescarAvatarMuro(){
  const correo = localStorage.getItem("correoUsuario") || "";
  const rol = localStorage.getItem("tipoUsuario") || userRole || "";
  const perfil = obtenerPerfil(correo);
  const avatar = perfil.icono || inicialesDe(rol, correo);

  ["muroAvatar-muro-egresados","muroAvatar-muro-estudiantes","muroAvatar-muro-admin"]
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = avatar;
    });
}

function actualizarContador(contId){
  const ta = document.getElementById("muroInput-" + contId);
  const c  = document.getElementById("muroCounter-" + contId);
  if (!ta || !c) return;
  const len = ta.value.length;
  c.textContent = len + " / " + MAX_LEN;
  c.classList.toggle("alert", len > MAX_LEN - 30);
}

function onPublicarComentario(contId){
  const ta = document.getElementById("muroInput-" + contId);
  if (!ta) return;
  const ok = guardarComentario(ta.value);
  if (!ok) return;
  ta.value = "";
  actualizarContador(contId);
  renderComentarios();
}

/* ===== RENDER ===== */
function renderComentarios(){
  const comentarios = obtenerComentarios()
    .slice()
    .sort((a,b) => new Date(b.fecha) - new Date(a.fecha));

  const correoActual = localStorage.getItem("correoUsuario") || "";
  const rolActual = localStorage.getItem("tipoUsuario") || userRole || "";

  const ids = ["muroLista-muro-egresados", "muroLista-muro-estudiantes", "muroLista-muro-admin"];
  ids.forEach(listaId => {
    const lista = document.getElementById(listaId);
    if (!lista) return;
    lista.innerHTML = "";

    if (comentarios.length === 0) {
      lista.innerHTML =
        '<div class="muro-empty">' +
          '<span class="icon">💭</span>' +
          '<p><strong>Aún no hay publicaciones</strong></p>' +
          '<p>Sé el primero en escribir algo en el muro.</p>' +
        '</div>';
      return;
    }

    let html = "";
    comentarios.forEach(c => {
      const yaLeDi = Array.isArray(c.likedBy) && c.likedBy.includes(correoActual);
      const rolKey = c.autor && ROLE_LABEL[c.autor] ? c.autor : "estudiantes";
      const avatar = avatarParaComentario(c);
      const nombre = nombreParaComentario(c);

      const esPropio = c.correo && c.correo === correoActual;
      const esAdmin = rolActual === "admin";
      const puedeBorrar = esPropio || esAdmin;
      const claseAdmin = (esAdmin && !esPropio) ? " admin" : "";
      const labelBorrar = (esAdmin && !esPropio) ? "Moderar" : "Eliminar";

      const botonBorrar = puedeBorrar
        ? '<button type="button" class="btn-borrar' + claseAdmin + '" onclick="eliminarComentario(\'' + c.id + '\')">' +
            '<span>🗑️</span><span>' + labelBorrar + '</span>' +
          '</button>'
        : '';

      html +=
        '<article class="comentario-card" data-id="' + c.id + '">' +
          '<div class="comentario-head">' +
            '<div class="comentario-avatar ' + rolKey + '">' + escapeHtml(avatar) + '</div>' +
            '<div class="comentario-meta">' +
              '<div class="comentario-autor">' +
                '<span>' + escapeHtml(nombre) + '</span>' +
                '<span class="role-badge ' + rolKey + '">' + escapeHtml(ROLE_LABEL[rolKey]) + '</span>' +
              '</div>' +
              '<div class="comentario-fecha">' + escapeHtml(tiempoRelativo(c.fecha)) + '</div>' +
            '</div>' +
          '</div>' +
          '<p class="comentario-texto">' + escapeHtml(c.texto) + '</p>' +
          '<div class="comentario-acciones">' +
            '<button type="button" class="like-btn ' + (yaLeDi ? "liked" : "") + '" data-id="' + c.id + '" onclick="darLike(\'' + c.id + '\')" aria-label="Me gusta">' +
              '<span class="heart">' + (yaLeDi ? "❤️" : "🤍") + '</span>' +
              '<span class="like-count">' + Number(c.likes || 0) + '</span>' +
            '</button>' +
            botonBorrar +
          '</div>' +
        '</article>';
    });
    lista.innerHTML = html;
  });
}
