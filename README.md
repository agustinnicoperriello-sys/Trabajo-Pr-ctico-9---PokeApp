# PokeApp — Trabajo Práctico 9

Aplicación educativa hecha con HTML, CSS y JavaScript, sin frameworks. Permite consultar Pokémon, registrarse, iniciar sesión, cargar Pokémon como administrador y jugar una batalla por decisiones.

## Cómo abrirla

1. Abrí esta carpeta con Visual Studio Code.
2. Usá la extensión Live Server y elegí **Open with Live Server** sobre `index.html`.
3. Usá siempre la misma dirección y puerto para conservar los datos del navegador. La configuración incluida propone el puerto 5501.

No abras `index.html` directamente con doble clic: los módulos JavaScript necesitan un servidor HTTP. El servidor es local y no publica el proyecto en Internet.

## Cuentas de demostración

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Administrador | 1234 | 1234 |
| Administrador | 5678 | 5678 |
| Usuario común | 2468 | 2468 |
| Usuario común | 1357 | 1357 |
| Usuario común | 4321 | 4321 |

Son cuentas de práctica, no uses contraseñas personales. Los usuarios registrados desde la pantalla de registro son usuarios comunes.

## Cómo se relacionan los archivos

- `index.html`: estructura general, menú, buscador y contenedor `#app`.
- `css/style.css`: presentación de tarjetas, formularios, detalle y batalla.
- `js/app.js`: muestra las pantallas, escucha los eventos y captura los formularios.
- `js/db/pokemones.js`: los diez Pokémon iniciales y sus características.
- `js/db/usuarios.js`: las cuentas iniciales de demostración.
- `js/persistencia.js`: lee y guarda usuarios y Pokémon con JSON y localStorage.
- `js/db/game.js`: crea la batalla, calcula el daño y aplica ataques y pociones.
- `assets/`: imágenes, avatares y sonidos.
- `js/script.js`: ejercicio anterior; no está conectado a la aplicación.

## Explicación para la presentación

**Datos:** un Pokémon es un objeto. Sus propiedades representan su número, nombre, tipos, descripción y demás características. Los Pokémon se agrupan en un array. La Pokédex y el detalle leen esos mismos objetos.

**Eventos y DOM:** `addEventListener()` permite reaccionar a un clic o al envío de un formulario. JavaScript cambia el contenido de `#app` para mostrar otra pantalla sin abrir otro archivo HTML.

**Carga:** el administrador completa el formulario. La aplicación captura los valores, convierte los campos numéricos con `valueAsNumber`, construye un objeto y comprueba que el número no esté repetido antes de incorporarlo a la lista.

**Persistencia:** localStorage guarda texto. `JSON.stringify()` convierte la lista de objetos en texto JSON y `JSON.parse()` la recupera. Los datos quedan en ese navegador y en esa dirección, no se comparten entre computadoras. Si el navegador rechaza el guardado, la app conserva temporalmente los cambios en memoria y avisa que pueden perderse al recargar o cerrar.

**Permisos:** al iniciar sesión se identifica al usuario. Si tiene `admin: true`, puede entrar a la carga. También se revisa ese permiso antes de procesar el formulario. Es una demostración de roles en el navegador; no es autenticación de producción con un servidor.

**Módulos:** `export` permite compartir funciones o datos desde un archivo. `import` permite utilizarlos desde otro. Así la lógica de la batalla y la persistencia quedan separadas de las pantallas.

**Batalla:** se crean copias de los dos Pokémon para no cambiar sus estadísticas en la Pokédex. La velocidad determina el orden de ataque. Atacar reduce la vida; usar una poción recupera hasta 20 HP y permite que el rival ataque. Hay dos pociones. Cuando un combatiente llega a cero, la batalla termina y se muestra el resultado.

## Correcciones realizadas

1. Cuando falla una escritura de localStorage, las lecturas usan la versión actual guardada en memoria y no una versión anterior.
2. El registro y la carga avisan si el guardado es temporal.
3. Entrar a Pokédex desde el menú limpia el buscador. Volver desde un detalle conserva el filtro de esa consulta.
4. El sonido usa un elemento HTML `<audio controls>`: el usuario puede reproducir y pausar desde los controles del navegador. Un evento `error` informa si falla el archivo. El código de la aplicación no utiliza async/await, promesas, then/catch ni llamadas a play().

## Prueba de entrega en navegador

Estas pruebas deben hacerse en la misma dirección y puerto. Usá datos de prueba.

- Recorrer Inicio, Pokédex, detalle, Usuario, registro y Batalla; volver al inicio con el logo.
- Buscar por nombre y tipo; abrir un detalle y regresar. Entrar nuevamente a Pokédex desde el menú para ver toda la lista.
- Registrar un usuario, intentar duplicarlo, probar una contraseña incorrecta e iniciar sesión correctamente.
- Confirmar que el usuario común no ve la carga. Cerrar sesión y entrar como administrador.
- Cargar un Pokémon con número nuevo, descripción, todos los números, imagen y sonido. Para probar los recursos existentes se pueden usar `./assets/img/Bulbasaur.png` y `./assets/sound/bulbasaur.mp3`.
- Probar que un número repetido se rechaza. Si se activa evolución o shiny, comprobar que se solicita su información asociada. Una prueba visual de shiny necesita una imagen shiny real.
- Ver el alta en la Pokédex y en su detalle; cerrar la pestaña, volver a abrir la misma dirección y confirmar que sigue allí. Comprobar también el login del usuario registrado.
- En batalla, atacar, usar una poción después de perder vida, llegar al resultado final y comenzar otra batalla. Confirmar que la Pokédex no perdió HP.
- Escuchar sonidos y revisar que las imágenes carguen.

## GitHub: lo que queda para entregar

El PDF exige un repositorio con código, recursos, versión funcional e historial de avances. El enlace del pie de página reconoce el proyecto base; no identifica un repositorio propio del alumno.

Si ya existe un repositorio del trabajo, hay que subir estas correcciones allí conservando su historial. Si no existe, hay que crear uno y subir la carpeta completa. Los commits nuevos deben describir cambios reales; no se puede reconstruir un historial progresivo anterior que no se guardó.

El nombre y la visibilidad del repositorio deben decidirse con el dueño de la cuenta. Esta corrección no publica ni crea un repositorio en GitHub.

## Alcance de la verificación

Se comprueban automáticamente la sintaxis de los módulos y escenarios de persistencia y batalla. La navegación visual, la reproducción real de audio y el cierre/reapertura en un navegador necesitan la prueba práctica anterior. No se consideran requisitos faltantes una API externa, multijugador, los 151 Pokémon o mantener la sesión iniciada: el PDF no los exige.
