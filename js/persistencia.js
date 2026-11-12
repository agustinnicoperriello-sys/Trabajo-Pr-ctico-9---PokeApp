import { pokemonesDefecto } from "./db/pokemones.js";
import { usuariosDefecto } from "./db/usuarios.js";

// Aplicación educativa: los datos se guardan solamente en este navegador.
const memoria = new Map();
// Conserva la versión más reciente si el navegador rechaza una escritura.
const pendientes = new Set();
export function advertenciaPersistencia() {
  return pendientes.size
    ? "Atención: el navegador no pudo guardar los cambios de forma permanente. Están disponibles durante esta sesión, pero pueden perderse al cerrar o recargar."
    : "";
}
function guardar(clave, datos) {
  const json = JSON.stringify(datos);
  memoria.set(clave, json);
  try {
    localStorage.setItem(clave, json);
    pendientes.delete(clave);
  } catch {
    pendientes.add(clave);
  }
}
function leer(clave, iniciales) {
  let json;
  try {
    json = pendientes.has(clave) ? memoria.get(clave) : localStorage.getItem(clave);
  } catch {
    json = memoria.get(clave);
  }
  try {
    const datos = JSON.parse(json);
    const valido = item => item && Number.isInteger(item.id) && typeof item.nombre === "string" &&
      (clave === "pokemones"
        ? Array.isArray(item.tipo) && item.tipo.every(tipo => typeof tipo === "string") &&
          ["altura", "peso", "generacion", "hp", "ataque", "defensa", "velocidad"].every(campo => Number.isFinite(item[campo])) &&
          typeof item.imagen === "string" && typeof item.sonido === "string"
        : typeof item.username === "string" && typeof item.password === "string" && typeof item.email === "string");
    if (Array.isArray(datos) && datos.every(valido)) {
      memoria.set(clave, json);
      return datos;
    }
  } catch { /* recuperar valores iniciales ante JSON dañado */ }
  const copia = structuredClone(iniciales);
  guardar(clave, copia);
  return copia;
}
// Completa el campo nuevo sin borrar Pokémon que ya se hayan agregado antes.
export function leerPokemones() {
  const lista = leer("pokemones", pokemonesDefecto);
  let actualizada = false;
  for (const pokemon of lista) {
    if (typeof pokemon.descripcion !== "string" || !pokemon.descripcion.trim()) {
      const original = pokemonesDefecto.find(item => item.id === pokemon.id);
      pokemon.descripcion = original?.descripcion || pokemon.nombre + " es un Pokémon de tipo " + pokemon.tipo.join(" y ") + ".";
      actualizada = true;
    }
  }
  if (actualizada) guardar("pokemones", lista);
  return lista;
}
export function leerUsuarios() {
  const lista = leer("usuarios", usuariosDefecto);
  let actualizada = false;

  // Agrega las cuentas de prueba nuevas sin borrar usuarios ya registrados.
  for (const usuario of usuariosDefecto) {
    const existe = lista.some(item =>
      item.username.toLowerCase() === usuario.username.toLowerCase() ||
      item.email.toLowerCase() === usuario.email.toLowerCase()
    );

    if (!existe) {
      const id = Math.max(0, ...lista.map(item => item.id)) + 1;
      lista.push({ ...usuario, id: id });
      actualizada = true;
    }
  }

  if (actualizada) {
    guardar("usuarios", lista);
  }

  return lista;
}
export function guardarPokemones(pokemon) {
  const lista = leerPokemones();
  if (!Number.isInteger(pokemon.id) || pokemon.id < 1 || !pokemon.nombre.trim() || !pokemon.descripcion?.trim() ||
      !pokemon.tipo.length || !pokemon.imagen || !pokemon.sonido ||
      ["altura", "peso", "generacion", "hp", "ataque", "defensa", "velocidad"].some(
        clave => !Number.isFinite(pokemon[clave]) || pokemon[clave] < 0
      ) || pokemon.hp < 1 || !Number.isInteger(pokemon.generacion) || pokemon.generacion < 1 ||
      ["hp", "ataque", "defensa", "velocidad"].some(clave => !Number.isInteger(pokemon[clave])) ||
      !pokemon.habilidad?.trim() || !pokemon.rareza?.trim() ||
      (pokemon.tieneEvolucion && !pokemon.evolucion?.trim()) ||
      (pokemon.nivelEvolucion !== null && (!Number.isInteger(pokemon.nivelEvolucion) || pokemon.nivelEvolucion < 1)) ||
      (pokemon.shiny && !pokemon.imagenShiny)) {
    throw new Error("Revisá el número, los datos y las estadísticas del Pokémon.");
  }
  if (lista.some(item => item.id === pokemon.id)) throw new Error("Ya existe un Pokémon con ese número.");
  lista.push(pokemon);
  guardar("pokemones", lista);
}
export function guardarUsuarios(usuario) {
  const lista = leerUsuarios();
  if (!usuario.nombre.trim() || !usuario.username.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.email) ||
      usuario.password.length < 4) throw new Error("Completá los datos y usá una contraseña de al menos 4 caracteres.");
  if (lista.some(item => item.username.toLowerCase() === usuario.username.toLowerCase() ||
      item.email.toLowerCase() === usuario.email.toLowerCase())) {
    throw new Error("Ese usuario o email ya está registrado.");
  }
  const nuevo = {
    id: Math.max(0, ...lista.map(item => item.id)) + 1,
    nombre: usuario.nombre,
    email: usuario.email,
    username: usuario.username,
    password: usuario.password,
    avatar: usuario.avatar || "./assets/avatar/default.png",
    admin: false,
  };
  lista.push(nuevo);
  guardar("usuarios", lista);
  return nuevo;
}



