let userRole = null;
let currentSlide = 0;

const slides = document.querySelectorAll('#carousel img');
const totalSlides = slides.length;

function updateCarousel(){
  const c = document.getElementById('carousel');
  if (!c) return;
  c.style.transform = 'rotateY(' + (currentSlide * -120) + 'deg)';
}
function nextSlide(){ currentSlide = (currentSlide + 1) % totalSlides; updateCarousel(); }
let autoCarouselInterval = setInterval(nextSlide, 4000);

function validarCorreo(email){ return /^[^\s@]+@gmail\.com$/.test(email); }
function validarContrasena(p){
  if (p.length < 7) return { valida:false, mensaje:"La contraseña debe tener al menos 7 caracteres" };
  if (!/[a-zA-Z]/.test(p)) return { valida:false, mensaje:"La contraseña debe contener al menos una letra" };
  return { valida:true, mensaje:"" };
}
function limpiarErrores(){
  ["errorEmail","errorPassword"].forEach(id=>{ const e=document.getElementById(id); if(e){e.textContent="";e.classList.remove("show");}});
  ["email","password"].forEach(id=>{ const e=document.getElementById(id); if(e) e.classList.remove("input-error");});
}

function validarYEntrar(event){
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const rol = document.getElementById("rol").value;
  const eE = document.getElementById("errorEmail");
  const eP = document.getElementById("errorPassword");
  limpiarErrores();
  let err = false;
  if (rol === "inicio") { alert("Seleccione un tipo de usuario"); return; }
  if (!email) { eE.textContent="El correo es obligatorio"; eE.classList.add("show"); document.getElementById("email").classList.add("input-error"); err=true; }
  else if (!validarCorreo(email)) { eE.textContent="El correo debe ser de tipo @gmail.com"; eE.classList.add("show"); document.getElementById("email").classList.add("input-error"); err=true; }
  if (!password) { eP.textContent="La contraseña es obligatoria"; eP.classList.add("show"); document.getElementById("password").classList.add("input-error"); err=true; }
  else { const v=validarContrasena(password); if(!v.valida){ eP.textContent=v.mensaje; eP.classList.add("show"); document.getElementById("password").classList.add("input-error"); err=true; } }
  if (err) return;
  userRole = rol;
  localStorage.setItem("tipoUsuario", rol);
  localStorage.setItem("correoUsuario", email);
  entrarAlPortal(rol);
}

function entrarAlPortal(rol){
  document.getElementById("login-section").style.display = "none";
  document.getElementById("header-nav").style.display = "none";
  document.getElementById("portal").style.display = "block";
  clearInterval(autoCarouselInterval);
  document.getElementById("content-egresados").style.display   = (rol==="egresados")  ? "block":"none";
  document.getElementById("content-estudiantes").style.display = (rol==="estudiantes")? "block":"none";
  document.getElementById("content-admin").style.display       = (rol==="admin")      ? "block":"none";
  volverAlPortal();
  montarMuroEnSeccionActiva();
  renderComentarios();
}

document.addEventListener("DOMContentLoaded", function(){
  const iE = document.getElementById("email");
  const iP = document.getElementById("password");
  iE.addEventListener("input", function(){ if(this.value.trim()){document.getElementById("errorEmail").classList.remove("show");this.classList.remove("input-error");}});
  iP.addEventListener("input", function(){ if(this.value){document.getElementById("errorPassword").classList.remove("show");this.classList.remove("input-error");}});
  const r = localStorage.getItem("tipoUsuario");
  if (r && ["egresados","estudiantes","admin"].includes(r)) { userRole = r; entrarAlPortal(r); }
});

function mostrarAyuda(){
  alert("AYUDA\n\nACCESO:\n- Selecciona tu tipo de usuario\n- Correo @gmail.com y contraseña con mínimo 7 caracteres y al menos una letra\n\nESTUDIANTE: Acceso a recursos académicos\nEGRESADO: Área de egresados\nADMIN: Administración del portal (puede moderar el muro)");
}

function logout(){
  userRole = null;
  localStorage.removeItem("tipoUsuario");
  localStorage.removeItem("correoUsuario");
  clearInterval(autoCarouselInterval);
  document.getElementById("portal").style.display = "none";
  ["content-egresados","content-estudiantes","content-admin"].forEach(id=>document.getElementById(id).style.display="none");
  document.getElementById("login-section").style.display = "flex";
  document.getElementById("header-nav").style.display = "block";
  document.getElementById("rol").value = "inicio";
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  ["muro-egresados","muro-estudiantes","muro-admin"].forEach(id=>{ const c=document.getElementById(id); if(c) c.dataset.mounted=""; });
  currentSlide = 0; updateCarousel();
  autoCarouselInterval = setInterval(nextSlide, 4000);
  limpiarErrores();
}
function irAInicio(){ if (confirm("¿Cerrar sesión y volver al inicio?")) logout(); }

const ICONOS_DISPONIBLES = ["👤","🎓","👨‍🎓","👩‍🎓","🧑‍💼","👨‍🏫","👩‍🏫","🧑‍💻","🎯","⭐","🚀","💡","📚","🏆","🌟","🦊","🐱","🐯","🦄","🌈"];
function perfilKey(c){ return "perfil_" + (c||"").toLowerCase(); }
function obtenerPerfil(c){ try{ const r=localStorage.getItem(perfilKey(c)); return r?JSON.parse(r):{nombre:"",icono:""}; }catch(e){return {nombre:"",icono:""};} }
function obtenerPerfilActual(){ return obtenerPerfil(localStorage.getItem("correoUsuario")||""); }

function montarPerfil(){
  const correo = localStorage.getItem("correoUsuario") || "";
  const rol = localStorage.getItem("tipoUsuario") || userRole || "";
  const p = obtenerPerfil(correo);
  document.getElementById("perfilCorreo").textContent = correo || "—";
  document.getElementById("perfilRol").textContent = ROLE_LABEL[rol] || "—";
  document.getElementById("perfilNombre").value = p.nombre || (correo ? correo.split("@")[0] : "");
  const av = document.getElementById("perfilAvatarGrande");
  av.textContent = p.icono || inicialesDe(rol, correo);
  av.dataset.tempIcon = p.icono || "";
  const picker = document.getElementById("iconPicker");
  picker.innerHTML = "";
  ICONOS_DISPONIBLES.forEach(icon=>{
    const b = document.createElement("button");
    b.type="button"; b.className="icon-option"+(p.icono===icon?" selected":""); b.textContent=icon;
    b.onclick = function(){ seleccionarIcono(icon); };
    picker.appendChild(b);
  });
}
function seleccionarIcono(icon){
  document.querySelectorAll(".icon-option").forEach(b=>b.classList.toggle("selected", b.textContent===icon));
  const av = document.getElementById("perfilAvatarGrande");
  av.textContent = icon; av.dataset.tempIcon = icon;
}
function guardarPerfil(){
  const correo = localStorage.getItem("correoUsuario") || "";
  if (!correo) { alert("No hay sesión activa"); return; }
  const nombre = document.getElementById("perfilNombre").value.trim();
  const icono  = document.getElementById("perfilAvatarGrande").dataset.tempIcon || "";
  localStorage.setItem(perfilKey(correo), JSON.stringify({nombre, icono}));
  refrescarAvatarMuro();
  renderComentarios();
  alert("Perfil actualizado correctamente");
  volverAlPortal();
}

function mostrarPerfil(){
  document.getElementById("vista-portal-principal").style.display = "none";
  document.getElementById("vista-conocenos").style.display = "none";
  document.getElementById("vista-perfil").style.display = "block";
  montarPerfil();
  window.scrollTo({top:0, behavior:"smooth"});
}
function mostrarConocenos(){
  document.getElementById("vista-portal-principal").style.display = "none";
  document.getElementById("vista-perfil").style.display = "none";
  document.getElementById("vista-conocenos").style.display = "block";
  window.scrollTo({top:0, behavior:"smooth"});
}
function volverAlPortal(){
  document.getElementById("vista-perfil").style.display = "none";
  document.getElementById("vista-conocenos").style.display = "none";
  document.getElementById("vista-portal-principal").style.display = "block";
}
function abrirConocenos(n){ alert("Sección " + n + " — próximamente"); }

const STORAGE_KEY = "comentarios";
const MAX_LEN = 500;
const ROLE_LABEL = { egresados:"Egresado", estudiantes:"Estudiante", admin:"Administrador" };

function inicialesDe(rol, correo){
  if (correo && correo.includes("@")) { const n=correo.split("@")[0]; return (n[0]+(n[1]||"")).toUpperCase(); }
  return (ROLE_LABEL[rol]||"U").substring(0,2).toUpperCase();
}
function avatarParaComentario(c){
  const p = obtenerPerfil(c.correo);
  if (p && p.icono) return p.icono;
  if (c.icono && c.icono.length) return c.icono;
  return inicialesDe(c.autor, c.correo);
}
function nombreParaComentario(c){
  const p = obtenerPerfil(c.correo);
  if (p && p.nombre) return p.nombre;
  if (c.nombre && c.nombre.length) return c.nombre;
  if (c.correo && c.correo.includes("@")) return c.correo.split("@")[0];
  return ROLE_LABEL[c.autor] || "Usuario";
}
function escapeHtml(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"); }
function tiempoRelativo(iso){
  const d = new Date(iso); const diff=(Date.now()-d.getTime())/1000;
  if (diff<60) return "hace unos segundos";
  if (diff<3600) return "hace "+Math.floor(diff/60)+" min";
  if (diff<86400) return "hace "+Math.floor(diff/3600)+" h";
  if (diff<86400*7) return "hace "+Math.floor(diff/86400)+" d";
  return d.toLocaleDateString("es-CO",{day:"2-digit",month:"short",year:"numeric"});
}
function obtenerComentarios(){ try{ const r=localStorage.getItem(STORAGE_KEY); const d=r?JSON.parse(r):[]; return Array.isArray(d)?d:[]; }catch(e){return [];} }

function guardarComentario(texto){
  const t = String(texto||"").trim();
  if (!t) { alert("Escribe algo antes de publicar"); return false; }
  if (t.length > MAX_LEN) { alert("Máx "+MAX_LEN+" caracteres"); return false; }
  const tipo = localStorage.getItem("tipoUsuario") || userRole || "estudiantes";
  const correo = localStorage.getItem("correoUsuario") || "";
  const p = obtenerPerfilActual();
  let id;
  if (typeof crypto!=="undefined" && crypto.randomUUID) id = crypto.randomUUID();
  else id = Date.now()+"-"+Math.random().toString(36).slice(2,9);
  const nuevo = { id, texto:t, autor:tipo, correo, nombre:p.nombre||"", icono:p.icono||"", fecha:new Date().toISOString(), likes:0, likedBy:[] };
  const arr = obtenerComentarios(); arr.push(nuevo);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  return true;
}

function darLike(id){
  const arr = obtenerComentarios();
  const i = arr.findIndex(c=>c.id===id);
  if (i===-1) return;
  const correo = localStorage.getItem("correoUsuario") || (userRole||"anon");
  const c = arr[i]; c.likedBy = Array.isArray(c.likedBy)?c.likedBy:[];
  const ya = c.likedBy.includes(correo);
  if (ya) { c.likes = Math.max(0,(c.likes||0)-1); c.likedBy = c.likedBy.filter(u=>u!==correo); }
  else    { c.likes = (c.likes||0)+1; c.likedBy.push(correo); }
  arr[i] = c; localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  document.querySelectorAll('.like-btn[data-id="'+id+'"]').forEach(b=>{
    b.classList.add("pop"); b.classList.toggle("liked", !ya);
    const s = b.querySelector(".like-count"); if (s) s.textContent = c.likes;
    setTimeout(()=>b.classList.remove("pop"), 360);
  });
}

function eliminarComentario(id){
  const correo = localStorage.getItem("correoUsuario") || "";
  const rol = localStorage.getItem("tipoUsuario") || userRole || "";
  const arr = obtenerComentarios();
  const i = arr.findIndex(c=>c.id===id);
  if (i===-1) return;
  const c = arr[i];
  const propio = c.correo && c.correo===correo;
  const admin = rol==="admin";
  if (!propio && !admin) { alert("No tienes permiso para eliminar este comentario"); return; }
  if (!confirm(admin && !propio ? "¿Eliminar este comentario como administrador?" : "¿Seguro que quieres eliminar tu comentario?")) return;
  arr.splice(i,1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  renderComentarios();
}

function montarMuroEnSeccionActiva(){
  ["muro-egresados","muro-estudiantes","muro-admin"].forEach(id=>{
    const cont = document.getElementById(id);
    if (!cont) return;
    const sec = cont.closest(".portal-content-section");
    if (!sec || sec.style.display==="none") { cont.innerHTML=""; return; }
    if (cont.dataset.mounted==="true") return;
    const rol = localStorage.getItem("tipoUsuario") || userRole || "estudiantes";
    const correo = localStorage.getItem("correoUsuario") || "";
    const p = obtenerPerfil(correo);
    const av = p.icono || inicialesDe(rol, correo);
    const sub = (rol==="admin")
      ? "Como administrador puedes moderar (eliminar) cualquier comentario."
      : "Conecta con egresados, estudiantes y administradores. Todos ven todos los comentarios.";
    cont.innerHTML =
      '<div class="muro-header">'+
        '<div class="muro-titulo"><div><h3>Muro Académico</h3><p>'+escapeHtml(sub)+'</p></div></div>'+
        '<span class="muro-pill"><span class="dot"></span> En vivo</span>'+
      '</div>'+
      '<div class="muro-form">'+
        '<div class="form-row">'+
          '<div class="muro-avatar" id="muroAvatar-'+id+'">'+escapeHtml(av)+'</div>'+
          '<textarea id="muroInput-'+id+'" placeholder="¿Qué quieres compartir con la comunidad SADEP?" maxlength="'+MAX_LEN+'" oninput="actualizarContador(\''+id+'\')"></textarea>'+
        '</div>'+
        '<div class="muro-form-actions">'+
          '<span class="muro-counter" id="muroCounter-'+id+'">0 / '+MAX_LEN+'</span>'+
          '<button class="btn-publicar" onclick="onPublicarComentario(\''+id+'\')"><span>Publicar</span><span aria-hidden="true">→</span></button>'+
        '</div>'+
      '</div>'+
      '<div class="muro-lista" id="muroLista-'+id+'"></div>';
    cont.dataset.mounted = "true";
  });
}

function refrescarAvatarMuro(){
  const correo = localStorage.getItem("correoUsuario") || "";
  const rol = localStorage.getItem("tipoUsuario") || userRole || "";
  const p = obtenerPerfil(correo);
  const av = p.icono || inicialesDe(rol, correo);
  ["muroAvatar-muro-egresados","muroAvatar-muro-estudiantes","muroAvatar-muro-admin"].forEach(id=>{
    const e = document.getElementById(id); if (e) e.textContent = av;
  });
}

function actualizarContador(cid){
  const ta = document.getElementById("muroInput-"+cid);
  const c  = document.getElementById("muroCounter-"+cid);
  if (!ta || !c) return;
  c.textContent = ta.value.length+" / "+MAX_LEN;
  c.classList.toggle("alert", ta.value.length > MAX_LEN-30);
}

function onPublicarComentario(cid){
  const ta = document.getElementById("muroInput-"+cid);
  if (!ta) return;
  if (!guardarComentario(ta.value)) return;
  ta.value = ""; actualizarContador(cid);
  renderComentarios();
}

function renderComentarios(){
  const arr = obtenerComentarios().slice().sort((a,b)=>new Date(b.fecha)-new Date(a.fecha));
  const correo = localStorage.getItem("correoUsuario") || "";
  const rol = localStorage.getItem("tipoUsuario") || userRole || "";
  ["muroLista-muro-egresados","muroLista-muro-estudiantes","muroLista-muro-admin"].forEach(lid=>{
    const lista = document.getElementById(lid);
    if (!lista) return;
    if (arr.length===0) {
      lista.innerHTML = '<div class="muro-empty"><span class="icon">💭</span><p><strong>Aún no hay publicaciones</strong></p><p>Sé el primero en escribir algo en el muro.</p></div>';
      return;
    }
    let html = "";
    arr.forEach(c=>{
      const ya = Array.isArray(c.likedBy) && c.likedBy.includes(correo);
      const rk = c.autor && ROLE_LABEL[c.autor] ? c.autor : "estudiantes";
      const av = avatarParaComentario(c);
      const nb = nombreParaComentario(c);
      const propio = c.correo && c.correo===correo;
      const admin = rol==="admin";
      const puede = propio || admin;
      const cAdm = (admin && !propio) ? " admin" : "";
      const lab = (admin && !propio) ? "Moderar" : "Eliminar";
      const btn = puede ? '<button type="button" class="btn-borrar'+cAdm+'" onclick="eliminarComentario(\''+c.id+'\')"><span>🗑️</span><span>'+lab+'</span></button>' : '';
      html +=
        '<article class="comentario-card" data-id="'+c.id+'">'+
          '<div class="comentario-head">'+
            '<div class="comentario-avatar '+rk+'">'+escapeHtml(av)+'</div>'+
            '<div class="comentario-meta">'+
              '<div class="comentario-autor"><span>'+escapeHtml(nb)+'</span><span class="role-badge '+rk+'">'+escapeHtml(ROLE_LABEL[rk])+'</span></div>'+
              '<div class="comentario-fecha">'+escapeHtml(tiempoRelativo(c.fecha))+'</div>'+
            '</div>'+
          '</div>'+
          '<p class="comentario-texto">'+escapeHtml(c.texto)+'</p>'+
          '<div class="comentario-acciones">'+
            '<button type="button" class="like-btn '+(ya?"liked":"")+'" data-id="'+c.id+'" onclick="darLike(\''+c.id+'\')"><span class="heart">'+(ya?"❤️":"🤍")+'</span><span class="like-count">'+Number(c.likes||0)+'</span></button>'+
            btn+
          '</div>'+
        '</article>';
    });
    lista.innerHTML = html;
  });
}