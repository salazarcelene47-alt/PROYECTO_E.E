/* VARIABLES GLOBALES */
let userRole = null;
let currentSlide = 0;

/* CARRUSEL LOGIN */
const slides = document.querySelectorAll('#carousel img');
const totalSlides = slides.length;

function updateCarousel(){
  document.getElementById('carousel').style.transform =
    `rotateY(${currentSlide * -120}deg)`;
}

function nextSlide(){
  currentSlide = (currentSlide + 1) % totalSlides;
  updateCarousel();
}

function prevSlide(){
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateCarousel();
}

let autoCarouselInterval = setInterval(nextSlide, 4000);

/* LOGIN */
function entrarPortal(){
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const rol = document.getElementById("rol").value;

  if(rol === "inicio"){
    alert("⚠️ Seleccione un tipo de usuario");
    return;
  }

  if(!email || !password){
    alert("⚠️ Complete todos los campos");
    return;
  }

  userRole = rol;
  
  document.getElementById("login-section").style.display = "none";
  document.getElementById("header-nav").style.display = "none";
  document.getElementById("portal").style.display = "block";
  
  clearInterval(autoCarouselInterval);
  
  // Mostrar contenido según rol
  if(rol === "egresados"){
    document.getElementById("content-egresados").style.display = "block";
  } else if(rol === "estudiantes"){
    document.getElementById("content-estudiantes").style.display = "block";
  } else if(rol === "admin"){
    document.getElementById("content-admin").style.display = "block";
  }
}

/* PUBLICAR POST (ESTUDIANTES) */
function publicarPost(){
  const input = document.getElementById("postInput");
  const postsList = document.getElementById("postsList");
  
  if(!input.value.trim()){
    alert("⚠️ Escriba una pregunta primero");
    return;
  }

  if(postsList.innerHTML.includes("Sin publicaciones")){
    postsList.innerHTML = "";
  }

  const newPost = document.createElement("div");
  newPost.style.cssText = "background: rgba(255,255,255,0.1); padding: 10px; border-radius: 10px; margin: 10px 0;";
  newPost.innerHTML = `
    <p><strong>Tu pregunta:</strong> "${input.value}"</p>
    <p style="font-size: 12px; color: #aaa;">Hace unos momentos</p>
    <button onclick="this.parentElement.remove()" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Eliminar</button>
  `;
  
  postsList.appendChild(newPost);
  input.value = "";
  alert("✅ Pregunta publicada correctamente");
}

/* MOSTRAR AYUDA */
function mostrarAyuda(){
  alert(`
 AYUDA 


 Pagina principal ("loguin")

 ACCESO:
- Selecciona tu tipo de usuario
- Ingresa tus contraseña y correo institucional en caso de ser estudiante y si es egresado o administrador su correo personal
- Asi podras iniciar sesión correctamente  

 TIPOS DE USUARIO:
 ESTUDIANTE: Acceso a recursos académicos
 EGRESADO: Área de egresados
 ADMIN: Administración del portal

  `);
}

/* LOGOUT */
function logout(){
  userRole = null;
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
  
  currentSlide = 0;
  updateCarousel();
  autoCarouselInterval = setInterval(nextSlide, 4000);
  
  alert("✅ Sesión cerrada correctamente");
}

/* IR AL INICIO */
function irAlInicio(){
  logout();
}