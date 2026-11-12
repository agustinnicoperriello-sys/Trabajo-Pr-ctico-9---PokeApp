import { crearBatalla, atacar, usarPocion } from "./db/game.js";
import {
  advertenciaPersistencia,
  leerPokemones,
  guardarPokemones,
  leerUsuarios,
  guardarUsuarios,
} from "./persistencia.js";

// ==========================================
// ELEMENTO PRINCIPAL DE LA APLICACIÓN
// ==========================================

const app = document.querySelector("#app");
let usuarioActual = null;
let combate = null;
let historialBatalla = [];
let audioActual = null;
const normalizar = texto => String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const escapar = texto => String(texto ?? "").replace(/[&<>"']/g, caracter => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[caracter]);
function mensaje(formulario, texto, error = true) {
  let elemento = formulario.querySelector(".form-message");
  if (!elemento) {
    elemento = document.createElement("p");
    elemento.className = "form-message";
    elemento.setAttribute("role", "status");
    formulario.append(elemento);
  }
  const advertencia = !error ? advertenciaPersistencia() : "";
  elemento.classList.toggle("error-message", error || Boolean(advertencia));
  elemento.textContent = [texto, advertencia].filter(Boolean).join(" ");
}
function recursoSeguro(valor) {
  const url = new URL(valor, document.baseURI);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Usá una ruta local o una URL http/https para los archivos.");
  return url.href;
}


// ==========================================
// 1. LANDING
// ==========================================

// Estructura básica de la pantalla
const landing = `
  <section class="landing">
    <h1>Bienvenido a PokeApp</h1>
    <p>Explorá el mundo Pokémon.</p>
    <p>Consultá las características de cada Pokémon, creá tu usuario y participá en una batalla por decisiones.</p>
    <p>En cada turno podés atacar o usar una poción para recuperar vida.</p>
  </section>
`;

// Función para cargar los elementos dinámicos
function cargarLanding() {
  console.log("Landing cargado");
}

// Evento del logo
const logo = document.querySelector(".header-logo img");

function mostrarInicio() {
  app.innerHTML = landing;
  cargarLanding();
}

logo.closest("a").addEventListener("click", function (event) {
  event.preventDefault();
  mostrarInicio();
});

document.querySelector("#link-inicio").addEventListener("click", function (event) {
  event.preventDefault();
  mostrarInicio();
});

// ==========================================
// 2. POKÉDEX
// ==========================================

// Estructura básica de la pantalla
const pokedex = `
  <section class="pokedex-section">
    <h1>Pokédex</h1>

    <div id="pokedex-gallery" class="pokedex-gallery"></div>
  </section>
`;

// Función para cargar los elementos dinámicos
function cargarPokedex(consulta = "") {
  const lista = leerPokemones().filter(p => normalizar([p.nombre, p.id, ...p.tipo].join(" ")).includes(normalizar(consulta.trim())));
  const galeria = document.querySelector("#pokedex-gallery");
  galeria.innerHTML = lista.length ? lista.map(p => `
    <article class="pokemon-card">
      <div class="pokemon-image"><img src="${escapar(p.imagen)}" alt="${escapar(p.nombre)}" loading="lazy"></div>
      <div class="pokemon-info">
        <span class="pokemon-id">N.º ${p.id}</span><h2>${escapar(p.nombre)}</h2>
        <div class="pokemon-types">${p.tipo.map(t => `<span class="type type-${escapar(normalizar(t))}">${escapar(t)}</span>`).join("")}</div>
        <p class="pokemon-rareza">${escapar(p.rareza)}</p>
        <button class="btn-detalle" data-id="${p.id}">Ver detalles</button>
      </div>
    </article>`).join("") : "<p>No se encontraron Pokémon. Probá con otro nombre, número o tipo.</p>";
}
// Evento del botón Pokédex
const botonPokedex = document.querySelector("#link-pokedex");

botonPokedex.addEventListener("click", function (event) {
  event.preventDefault();

  document.querySelector("#busqueda").value = "";
  app.innerHTML = pokedex;

  cargarPokedex();
});

// ==========================================
// 3. INICIAR SESIÓN
// ==========================================

// Estructura básica de la pantalla
const login = `
  <section class="login-section">
          <h1>Iniciar sesión</h1>

          <form id="form-login">
            <label for="username"> Usuario </label>

            <input type="text" id="username" required />

            <label for="password"> Contraseña </label>

            <input type="password" id="password" required />
            <button type="submit">Ingresar</button>
          </form>
          <p class="auth-links">¿No tenés una cuenta? <a href="#registro" id="link-registro">Registrarse</a></p>
        </section>
`;

// Función para cargar los elementos dinámicos
function cargarLogin() {
  document.querySelector("#link-registro").addEventListener("click", function (event) {
    event.preventDefault();
    app.innerHTML = registro;
    cargarRegistro();
  });
}

// Evento del botón Iniciar sesión
const botonLogin = document.querySelector("#link-login");

botonLogin.addEventListener("click", function (event) {
  event.preventDefault();

  if (usuarioActual) {
    mostrarPerfil();
    return;
  }
  app.innerHTML = login;
  cargarLogin();

  const formularioLogin = document.querySelector("#form-login");

  formularioLogin.addEventListener("submit", function (event) {
    event.preventDefault();
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    let encontrado = false;
    const usuarios = leerUsuarios();
    for (let usuario of usuarios) {
      if (usuario.username === username && usuario.password === password) {
        encontrado = true;
        usuarioActual = usuario;
        botonLogin.textContent = "Mi perfil";
        document.querySelector("#link-carga").hidden = !usuario.admin;
        mostrarPerfil();
        break;
      } else {
        encontrado = false;
      }
    }
    if (!encontrado) {
      mensaje(formularioLogin, "Usuario o contraseña incorrectos");
    }
  });
});

// ==========================================
// 4. REGISTRO
// ==========================================

// Estructura básica de la pantalla
const registro = `
  <section class="registro-section">

    <h1>Registrarse</h1>

    <form id="form-registro">

      <label for="nombre">
        Nombre
      </label>

      <input 
        type="text" 
        id="nombre"
      />

      <label for="email">
        Email
      </label>

      <input 
        type="email" 
        id="email"
      />

      <label for="nuevo-username">
        Usuario
      </label>

      <input 
        type="text" 
        id="nuevo-username"
      />

      <label for="nueva-password">
        Contraseña
      </label>

      <input 
        type="password" 
        id="nueva-password"
      />

      <button type="submit">
        Registrarse
      </button>

    </form>
    <p class="auth-links">¿Ya tenés una cuenta? <a href="#login" id="volver-login">Iniciar sesión</a></p>

  </section>
`;

// Función para cargar los elementos dinámicos
function cargarRegistro() {
  document.querySelector("#volver-login").addEventListener("click", function (event) {
    event.preventDefault();
    botonLogin.click();
  });
  const formulario = document.querySelector("#form-registro");
  formulario.querySelectorAll("input").forEach(input => input.required = true);
  formulario.querySelector("#nueva-password").minLength = 4;
  formulario.addEventListener("submit", event => {
    event.preventDefault();
    try {
      guardarUsuarios({
        nombre: formulario.querySelector("#nombre").value.trim(),
        email: formulario.querySelector("#email").value.trim(),
        username: formulario.querySelector("#nuevo-username").value.trim(),
        password: formulario.querySelector("#nueva-password").value,
        avatar: "./assets/avatar/default.png"
      });
      formulario.reset();
      mensaje(formulario, "Registro completado. Ya podés iniciar sesión.", false);
    } catch (error) { mensaje(formulario, error.message); }
  });
}



// ==========================================
// 5. BATALLA
// ==========================================

// Estructura básica de la pantalla
const batalla = `
  <section class="batalla-section">

    <h1>Batalla Pokémon</h1>

    <p>
      Elegí tu Pokémon para comenzar.
    </p>

    <button id="btn-comenzar-batalla">
      Comenzar batalla
    </button>

  </section>
`;

// Función para cargar los elementos dinámicos
function cargarBatalla() {
  combate = null;
  const lista = leerPokemones();
  const selector = document.createElement("select");
  selector.id = "pokemon-jugador";
  selector.setAttribute("aria-label", "Elegí tu Pokémon");
  lista.forEach(p => selector.add(new Option(p.nombre, p.id)));
  const comenzar = document.querySelector("#btn-comenzar-batalla");
  comenzar.before(selector);
  comenzar.disabled = lista.length < 2;
  comenzar.addEventListener("click", () => {
    const jugador = lista.find(p => p.id === Number(selector.value));
    const rivales = lista.filter(p => p.id !== jugador.id);
    const rival = rivales[Math.floor(Math.random() * rivales.length)];
    combate = crearBatalla(jugador, rival);
    historialBatalla = [];
    pintarBatalla();
  });
}
function pintarBatalla(mensajes = []) {
  const section = document.querySelector(".batalla-section");
  // El DOM cambia después de cada decisión; el objeto combate mantiene el estado.
  section.innerHTML = '<h1>Batalla Pokémon</h1><h2 id="estado-turno"></h2><div class="arena"></div><p class="battle-rules">Tenés 2 pociones. Cada una recupera hasta 20 HP y ocupa un turno: después ataca el rival.</p><div class="battle-log" role="status" aria-live="polite"></div><div class="battle-actions"><button id="btn-atacar">Atacar</button><button id="btn-pocion">Usar poción</button><button id="btn-reiniciar">Nueva batalla</button></div><details><summary>Ver historial de la batalla</summary><ol id="historial-batalla"></ol></details>';
  section.querySelector("#estado-turno").textContent = combate.terminada
    ? (combate.ganador === "jugador" ? "¡Ganaste la batalla!" : "Tu Pokémon fue derrotado.")
    : "Turno " + combate.turno + " · ¿Qué querés hacer?";
  section.querySelector(".arena").innerHTML = [combate.jugador, combate.rival].map(p =>
    `<article class="combatiente"><h2>${escapar(p.nombre)}</h2><img src="${escapar(p.imagen)}" alt="${escapar(p.nombre)}"><p>HP: ${p.vida} / ${p.hp}</p><progress aria-label="Vida de ${escapar(p.nombre)}" max="${p.hp}" value="${p.vida}"></progress></article>`
  ).join("");

  section.querySelector(".battle-log").textContent = mensajes.join(" ") || "¡Comienza la batalla! Elegí atacar o recuperar vida.";
  historialBatalla.push(...mensajes);
  for (const texto of historialBatalla) {
    const item = document.createElement("li");
    item.textContent = texto;
    section.querySelector("#historial-batalla").append(item);
  }

  // addEventListener conecta cada botón con una función JavaScript.
  const botonAtacar = section.querySelector("#btn-atacar");
  botonAtacar.disabled = combate.terminada;
  botonAtacar.addEventListener("click", () => pintarBatalla(atacar(combate)));

  const botonPocion = section.querySelector("#btn-pocion");
  botonPocion.textContent = "Usar poción (" + combate.pociones + ")";
  botonPocion.disabled = combate.terminada || combate.pociones === 0 || combate.jugador.vida === combate.jugador.hp;
  botonPocion.addEventListener("click", () => pintarBatalla(usarPocion(combate)));

  section.querySelector("#btn-reiniciar").addEventListener("click", () => {
    app.innerHTML = batalla;
    cargarBatalla();
  });
}

// Evento del botón Batalla
const botonBatalla = document.querySelector("#link-juego");

botonBatalla.addEventListener("click", function (event) {
  event.preventDefault();

  app.innerHTML = batalla;

  cargarBatalla();
});
// ==========================================
// 6. PERFIL USUARIO ESTANDAR
// ==========================================
function cargarPerfilEstandar() {
  console.log("Perfil de usuario estándar cargado");
}

const perfilEstandar = `
<section class="user-profile" id="user-profile">
          <h2>Perfil de usuario</h2>
          <div class="user-profile-info">
            <div>
              <img
                src="./assets/avatar/default.png"
                alt="Avatar de usuario"
                class="user-profile-avatar"
              />
            </div>
            <div>
              <p>
                Nombre de usuario:
                <span class="user-profile-username">Usuario</span>
              </p>
              <p>
                Email:
                <span class="user-profile-email">usuario@example.com</span>
              </p>
            </div>
          </div>
        </section>`;

// ==========================================
// CARGA DE POKÉMON: VISTA EXCLUSIVA DEL ADMINISTRADOR
// ==========================================
function cargarFormularioPokemon() {
  const formulario = document.querySelector("#form-nuevo-pokemon");
  formulario.querySelectorAll('input[type="number"]').forEach(input => input.min = "0");
  formulario.querySelector("#pokemon-number").min = "1";
  formulario.querySelector("#pokemon-hp").min = "1";
  formulario.querySelector("#pokemon-generation").min = "1";
  formulario.querySelector("#pokemon-has-evolution-no").checked = true;
  formulario.addEventListener("submit", event => {
    event.preventDefault();
    if (!usuarioActual?.admin) return;
    const texto = id => formulario.querySelector("#pokemon-" + id).value.trim();
    const numero = id => formulario.querySelector("#pokemon-" + id).valueAsNumber;
    try {
      const evoluciona = formulario.querySelector('input[name="pokemon-has-evolution"]:checked').value === "true";
      const shiny = formulario.querySelector("#pokemon-shiny").checked;
      if (evoluciona && !texto("evolution")) throw new Error("Indicá el nombre de la evolución.");
      if (shiny && !texto("shiny-image")) throw new Error("Indicá la imagen shiny.");
      const nuevo = {
        id: numero("number"),
        nombre: texto("name"),
        tipo: texto("type").split(",").map(t => t.trim()).filter(Boolean),
        descripcion: texto("description"),
        altura: numero("height"),
        peso: numero("weight"),
        generacion: numero("generation"),
        hp: numero("hp"),
        ataque: numero("attack"),
        velocidad: numero("speed"),
        defensa: numero("defense"),
        habilidad: formulario.querySelector("#pokemon-ability").selectedOptions[0].textContent.trim(),
        tieneEvolucion: evoluciona,
        evolucion: evoluciona ? texto("evolution") : null,
        nivelEvolucion: evoluciona && texto("evolution-level") ? numero("evolution-level") : null,
        rareza: texto("rarity"),
        imagen: recursoSeguro(texto("image")),
        sonido: recursoSeguro(texto("sound")),
        shiny: shiny,
        imagenShiny: shiny ? recursoSeguro(texto("shiny-image")) : null,
      };
      guardarPokemones(nuevo);
      formulario.reset();
      formulario.querySelector("#pokemon-has-evolution-no").checked = true;
      mensaje(formulario, "Pokémon agregado. Ya aparece en la Pokédex.", false);
    } catch (error) { mensaje(formulario, error.message); }
  });
}

const cargaPokemon = `
        <section class="new-pokemon" id="new-pokemon">
          <h1>Carga de Pokémon</h1>
          <form id="form-nuevo-pokemon">
            <label for="pokemon-number"> Numero en el Pokedex: </label>
            <input type="number" id="pokemon-number" required />

            <label for="pokemon-name">Nombre:</label>
            <input type="text" id="pokemon-name" required />

            <label for="pokemon-description">Descripción:</label>
            <textarea id="pokemon-description" rows="4" required></textarea>

            <label for="pokemon-type">Tipo (separá con comas si tiene dos):</label>
            <input type="text" id="pokemon-type" required />

            <label for="pokemon-height">Altura (m):</label>
            <input type="number" id="pokemon-height" step="0.1" required />

            <label for="pokemon-weight">Peso (kg):</label>
            <input type="number" id="pokemon-weight" step="0.1" required />

            <label for="pokemon-generation">Generación:</label>
            <input type="number" id="pokemon-generation" required />

            <label for="pokemon-hp">HP:</label>
            <input type="number" id="pokemon-hp" required />
            <label for="pokemon-attack">Ataque:</label>
            <input type="number" id="pokemon-attack" required />
            <label for="pokemon-speed">Velocidad:</label>
            <input type="number" id="pokemon-speed" required />
            <label for="pokemon-defense">Defensa:</label>
            <input type="number" id="pokemon-defense" required />

            <label for="pokemon-ability">Habilidad:</label>
            <select id="pokemon-ability" required>
             <option value="" disabled selected>Seleccioná una habilidad</option>
              
              <option value="Adaptability">Adaptable</option>
              <option value="Battle Armor">Armadura batalla</option>
              <option value="Blaze">Mar llamas</option>
              <option value="Chlorophyll">Clorofila</option>
              <option value="Clear Body">Cuerpo puro</option>
              <option value="Color Change">Cambio color</option>
              <option value="Compound Eyes">Ojo compuesto</option>
              <option value="Cute Charm">Gran encanto</option>
              <option value="Early Bird"> madrugar</option>
              <option value="Effect Spore">Efecto espora</option>
              <option value="Flame Body">Cuerpo llama</option>
              <option value="Flash Fire">Absorbe fuego</option>
              <option value="Guts">Agallas</option>
              <option value="Huge Power">Potencia</option>
              <option value="Hustle">Entusiasmo</option>
              <option value="Hyper Cutter"> Corte fuerte</option>
              <option value="Illuminate"> iluminacion</option>
              <option value="Immunity">Inmunidad</option>
              <option value="Inner Focus">Foco interno</option>
              <option value="Intimidate">Intimidación</option>
              <option value="Keen Eye">Vista lince</option>
              <option value="Levitate">Levitación</option>
              <option value="Lightning Rod">Pararrayos</option>
              <option value="Limber">Flexibilidad</option>
              <option value="Liquid Ooze">Lodo líquido</option>
              <option value="Magic Guard">Muro mágico</option>
              <option value="Natural Cure">Cura natural</option>
              <option value="Oblivious">Despiste</option>
              <option value="Overgrow">Espesura</option>
              <option value="Own Tempo">Ritmo propio</option>
              <option value="Pickup">Recogida</option>
              <option value="Poison Point">Punto tóxico</option>
              <option value="Pressure">Presión</option>
              <option value="Run Away">Fuga</option>
              <option value="Serene Grace"> dicha</option>
              <option value="Shed Skin">Mudar</option>
              <option value="Shield Dust">Polvo escudo</option>
              <option value="Soundproof">Insonorizar</option>
              <option value="Static">Electricidad estática</option>
              <option value="Stench">Hedor</option>
              <option value="Sturdy">Robustez</option>
              <option value="Swarm">Enjambre</option>
              <option value="Swift Swim">Nado veloz</option>
              <option value="Synchronize"> sincronía</option>
              <option value="Thick Fat">Sebo</option>
              <option value="Torrent">Torrente</option>
              <option value="Trace">Rastro</option>
              <option value="Volt Absorb">Absorbe electricidad</option>
              <option value="Water Absorb">Absorbe agua</option>
              <option value="Wonder Guard">Superguarda</option>
            </select>

            <fieldset>
              <legend>¿Tiene evolución?</legend>
              <label for="pokemon-has-evolution-yes">
                <input type="radio" id="pokemon-has-evolution-yes" name="pokemon-has-evolution" value="true" required />
                Sí
              </label>
              <label for="pokemon-has-evolution-no">
                <input type="radio" id="pokemon-has-evolution-no" name="pokemon-has-evolution" value="false" required />
                No
              </label>
            </fieldset>

            <label for="pokemon-evolution">Evolución:</label>
            <input type="text" id="pokemon-evolution" />

            <label for="pokemon-evolution-level">Nivel de evolución:</label>
            <input type="number" id="pokemon-evolution-level" />

            <label for="pokemon-rarity">Rareza:</label>
            <select id="pokemon-rarity" required>
              <option value="" disabled selected>Seleccioná una rareza</option>
              <option value="Común">Común</option>
              <option value="Poco común">Poco común</option>
              <option value="Raro">Raro</option>
              <option value="Legendario">Legendario</option>
              <option value="Mítico">Mítico</option>
              <option value="Singular">Singular</option>
            </select>

            <label for="pokemon-image">Imagen (URL):</label>
            <input type="text" id="pokemon-image" required />

            <label for="pokemon-sound">Sonido (URL):</label>
            <input type="text" id="pokemon-sound" required />

            <label for="pokemon-shiny">¿Es shiny?</label>
            <input type="checkbox" id="pokemon-shiny" />

            <label for="pokemon-shiny-image">Imagen shiny (URL):</label>
            <input type="text" id="pokemon-shiny-image" />

            <button type="submit">Agregar Pokémon</button>
          </form>
        </section>`;


function mostrarPerfil() {
  app.innerHTML = perfilEstandar;
  app.querySelector(".user-profile-username").textContent = usuarioActual.username;
  app.querySelector(".user-profile-email").textContent = usuarioActual.email;
  app.querySelector(".user-profile-avatar").src = usuarioActual.avatar;
  const salir = document.createElement("button");
  salir.textContent = "Cerrar sesión";
  salir.addEventListener("click", () => {
    usuarioActual = null;
    botonLogin.textContent = "Usuario";
    document.querySelector("#link-carga").hidden = true;
    app.innerHTML = landing;
  });
  app.querySelector(".user-profile").append(salir);
}
function mostrarCargaPokemon() {
  if (!usuarioActual || !usuarioActual.admin) {
    return;
  }

  app.innerHTML = cargaPokemon;
  cargarFormularioPokemon();
}

document.querySelector("#link-carga").addEventListener("click", function (event) {
  event.preventDefault();
  mostrarCargaPokemon();
});
document.querySelector("#form-busqueda").addEventListener("submit", event => {
  event.preventDefault();
  app.innerHTML = pokedex;
  cargarPokedex(document.querySelector("#busqueda").value);
});
app.addEventListener("click", event => {
  const boton = event.target.closest(".btn-detalle");
  if (!boton) return;
  const pokemon = leerPokemones().find(p => p.id === Number(boton.dataset.id));
  if (!pokemon) return;
  app.innerHTML = `
    <section class="detalle panel">
      <button id="volver-pokedex">← Volver a la Pokédex</button>
      <h1>${escapar(pokemon.nombre)} · N.º ${pokemon.id}</h1>
      <img class="detalle-imagen" src="${escapar(pokemon.imagen)}" alt="${escapar(pokemon.nombre)}">
      <p class="pokemon-descripcion">${escapar(pokemon.descripcion)}</p>
      <p>Tipo: ${escapar(pokemon.tipo.join(" / "))}</p>
      <p>Altura: ${pokemon.altura} m · Peso: ${pokemon.peso} kg · Generación: ${pokemon.generacion}</p>
      <p>HP: ${pokemon.hp} · Ataque: ${pokemon.ataque} · Defensa: ${pokemon.defensa} · Velocidad: ${pokemon.velocidad}</p>
      <p>Habilidad: ${escapar(pokemon.habilidad)} · Rareza: ${escapar(pokemon.rareza)}</p>
      <p>Evolución: ${pokemon.tieneEvolucion ? escapar(pokemon.evolucion) + (pokemon.nivelEvolucion ? " (nivel " + pokemon.nivelEvolucion + ")" : "") : "Sin evolución"}</p>
      <p>Variante shiny: ${pokemon.shiny ? "Disponible" : "Sin imagen disponible"}</p>
      ${pokemon.shiny && pokemon.imagenShiny ? `<button id="ver-shiny">Ver shiny</button>` : ""}
      <p id="etiqueta-sonido">Sonido del Pokémon</p>
      <audio id="audio-pokemon" controls preload="none" aria-labelledby="etiqueta-sonido" src="${escapar(pokemon.sonido)}"></audio>
      <p id="estado-audio" role="status"></p>
    </section>`;
  document.querySelector("#volver-pokedex").addEventListener("click", () => {
    audioActual?.pause();
    app.innerHTML = pokedex;
    cargarPokedex(document.querySelector("#busqueda").value);
  });
  const botonShiny = document.querySelector("#ver-shiny");
  if (botonShiny) {
    let mostrandoShiny = false;
    botonShiny.addEventListener("click", () => {
      mostrandoShiny = !mostrandoShiny;
      const imagen = app.querySelector(".detalle-imagen");
      delete imagen.dataset.fallback;
      imagen.src = mostrandoShiny ? pokemon.imagenShiny : pokemon.imagen;
      imagen.alt = pokemon.nombre + (mostrandoShiny ? " shiny" : "");
      botonShiny.textContent = mostrandoShiny ? "Ver imagen normal" : "Ver shiny";
    });
  }
  const audio = document.querySelector("#audio-pokemon");
  const estadoAudio = document.querySelector("#estado-audio");
  audioActual?.pause();
  audioActual = audio;

  // El usuario reproduce y pausa con los controles del navegador.
  // Los eventos permiten informar errores sin utilizar promesas.
  audio.addEventListener("playing", function () {
    estadoAudio.textContent = "";
  });
  audio.addEventListener("error", function () {
    estadoAudio.textContent = "No se pudo reproducir el sonido. Revisá el archivo o intentá nuevamente.";
  });
});
app.addEventListener("error", event => {
  if (event.target.tagName === "IMG" && !event.target.dataset.fallback) {
    event.target.dataset.fallback = "true";
    event.target.src = "./assets/img/logo-pokemon.svg";
  }
}, true);
app.innerHTML = landing;
cargarLanding();
