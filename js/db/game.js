// Cada batalla usa copias: perder vida no cambia los datos de la Pokédex.
export function crearBatalla(jugador, rival) {
  return {
    jugador: { ...jugador, vida: jugador.hp },
    rival: { ...rival, vida: rival.hp },
    turno: 1,
    pociones: 2,
    terminada: false,
    ganador: null
  };
}

// Regla sencilla para este trabajo práctico: siempre se hace al menos 1 de daño.
export function calcularDano(atacante, defensor) {
  return Math.max(1, Math.round(atacante.ataque * 0.4 - defensor.defensa * 0.15));
}

function golpear(estado, atacante, defensor, mensajes) {
  const dano = calcularDano(atacante, defensor);
  defensor.vida = Math.max(0, defensor.vida - dano);
  mensajes.push(atacante.nombre + " ataca: " + dano + " puntos de daño.");

  if (defensor.vida === 0) {
    estado.terminada = true;
    estado.ganador = atacante === estado.jugador ? "jugador" : "rival";
    mensajes.push("¡" + atacante.nombre + " ganó la batalla!");
  }
}

// Decisión 1: atacar. El más rápido golpea primero y el otro responde si sigue vivo.
export function atacar(estado) {
  if (estado.terminada) return [];
  const mensajes = [];
  const orden = estado.jugador.velocidad >= estado.rival.velocidad
    ? [[estado.jugador, estado.rival], [estado.rival, estado.jugador]]
    : [[estado.rival, estado.jugador], [estado.jugador, estado.rival]];

  for (const [atacante, defensor] of orden) {
    golpear(estado, atacante, defensor, mensajes);
    if (estado.terminada) break;
  }
  if (!estado.terminada) estado.turno++;
  return mensajes;
}

// Decisión 2: recuperar hasta 20 HP. Usar una poción ocupa el turno: el rival ataca.
export function usarPocion(estado) {
  if (estado.terminada) return [];
  if (estado.pociones === 0) return ["No te quedan pociones. Elegí Atacar."];
  if (estado.jugador.vida === estado.jugador.hp) return ["Tu Pokémon ya tiene toda la vida."];

  const recuperado = Math.min(20, estado.jugador.hp - estado.jugador.vida);
  estado.jugador.vida += recuperado;
  estado.pociones--;
  const mensajes = [estado.jugador.nombre + " usa una poción y recupera " + recuperado + " HP."];
  golpear(estado, estado.rival, estado.jugador, mensajes);
  if (!estado.terminada) estado.turno++;
  return mensajes;
}
