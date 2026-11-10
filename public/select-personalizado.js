// Cambia la apariencia de cada <select> del formulario por un menú propio.
// El <select> original se queda dentro del formulario (oculto), así FormData,
// required y la edición siguen funcionando igual que antes.

// Función para cerrar el menú que esté abierto (solo puede haber uno a la vez).
let cerrarMenuAbierto = null;

// Funciones que vuelven a pintar el valor de cada select personalizado.
const refrescarSelects = [];

function crearSelectPersonalizado(select) {
  const etiqueta = document.querySelector(`label[for="${select.id}"]`);
  if (etiqueta && !etiqueta.id) etiqueta.id = select.id + "-etiqueta";

  const contenedor = document.createElement("div");
  contenedor.className = "select-personalizado";

  // Lo que se ve en lugar del select: un cuadro que se puede enfocar con Tab.
  const boton = document.createElement("div");
  boton.className = "select-boton";
  boton.id = select.id + "-boton";
  boton.tabIndex = 0;
  boton.setAttribute("role", "combobox");
  boton.setAttribute("aria-haspopup", "listbox");
  boton.setAttribute("aria-expanded", "false");
  boton.setAttribute("aria-controls", select.id + "-opciones");
  if (etiqueta) boton.setAttribute("aria-labelledby", etiqueta.id);
  if (select.required) boton.setAttribute("aria-required", "true");
  if (select.hasAttribute("aria-describedby")) {
    boton.setAttribute("aria-describedby", select.getAttribute("aria-describedby"));
  }

  const texto = document.createElement("span");
  texto.className = "select-texto";
  boton.append(texto);

  // La lista de opciones que se despliega.
  const lista = document.createElement("ul");
  lista.className = "select-opciones";
  lista.id = select.id + "-opciones";
  lista.setAttribute("role", "listbox");
  if (etiqueta) lista.setAttribute("aria-labelledby", etiqueta.id);
  lista.hidden = true;

  // El select original queda oculto, pero sigue siendo parte del formulario.
  select.classList.add("select-nativo");
  select.tabIndex = -1;
  select.setAttribute("aria-hidden", "true");
  select.replaceWith(contenedor);
  contenedor.append(select, boton, lista);

  let activa = -1; // posición de la opción resaltada con el teclado o el mouse

  // Las opciones reales, sin la primera ("Selecciona...") que tiene value="".
  const opciones = () => [...select.options].filter((opcion) => opcion.value !== "");

  function mostrarValor() {
    const elegida = select.selectedOptions[0];
    const sinValor = !elegida || elegida.value === "";
    texto.textContent = sinValor ? select.options[0].textContent : elegida.textContent;
    contenedor.classList.toggle("sin-valor", sinValor);
  }

  function dibujarOpciones() {
    lista.replaceChildren();
    opciones().forEach((opcion, posicion) => {
      const item = document.createElement("li");
      item.id = `${select.id}-opcion-${posicion}`;
      item.className = "select-opcion";
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(opcion.value === select.value));
      item.textContent = opcion.textContent;
      item.addEventListener("click", () => elegir(posicion));
      item.addEventListener("mousemove", () => resaltar(posicion));
      lista.append(item);
    });
  }

  function resaltar(posicion) {
    const items = [...lista.children];
    if (items.length === 0) return;
    activa = Math.max(0, Math.min(posicion, items.length - 1));
    items.forEach((item, i) => item.classList.toggle("activa", i === activa));
    boton.setAttribute("aria-activedescendant", items[activa].id);
    items[activa].scrollIntoView({ block: "nearest" });
  }

  function abrir() {
    if (cerrarMenuAbierto) cerrarMenuAbierto();
    dibujarOpciones();
    lista.hidden = false;
    boton.setAttribute("aria-expanded", "true");
    contenedor.classList.add("abierto");

    // Si no cabe hacia abajo y arriba hay más espacio, se abre hacia arriba.
    const caja = boton.getBoundingClientRect();
    const espacioAbajo = window.innerHeight - caja.bottom;
    contenedor.classList.toggle("hacia-arriba", espacioAbajo < lista.offsetHeight + 12 && caja.top > espacioAbajo);

    const actual = opciones().findIndex((opcion) => opcion.value === select.value);
    resaltar(actual === -1 ? 0 : actual);
    cerrarMenuAbierto = cerrar;
  }

  function cerrar() {
    lista.hidden = true;
    boton.setAttribute("aria-expanded", "false");
    boton.removeAttribute("aria-activedescendant");
    contenedor.classList.remove("abierto", "hacia-arriba");
    if (cerrarMenuAbierto === cerrar) cerrarMenuAbierto = null;
  }

  function elegir(posicion) {
    const opcion = opciones()[posicion];
    if (!opcion) return;
    select.value = opcion.value;
    // Avisa al resto de la página (por ejemplo, a la validación) que el valor cambió.
    select.dispatchEvent(new Event("change", { bubbles: true }));
    cerrar();
    boton.focus();
  }

  // ----- Mouse -----
  boton.addEventListener("click", () => (lista.hidden ? abrir() : cerrar()));
  // Evita que el botón pierda el foco al hacer clic dentro de la lista.
  lista.addEventListener("mousedown", (evento) => evento.preventDefault());
  boton.addEventListener("blur", cerrar);

  // ----- Teclado -----
  let busqueda = "";
  let temporizador;
  boton.addEventListener("keydown", (evento) => {
    const abierto = !lista.hidden;
    switch (evento.key) {
      case "ArrowDown":
        evento.preventDefault();
        abierto ? resaltar(activa + 1) : abrir();
        break;
      case "ArrowUp":
        evento.preventDefault();
        abierto ? resaltar(activa - 1) : abrir();
        break;
      case "Home":
      case "End":
        if (abierto) {
          evento.preventDefault();
          resaltar(evento.key === "Home" ? 0 : lista.children.length - 1);
        }
        break;
      case "Enter":
      case " ":
        evento.preventDefault();
        abierto ? elegir(activa) : abrir();
        break;
      case "Escape":
        if (abierto) {
          evento.preventDefault();
          cerrar();
        }
        break;
      default:
        // Escribir letras salta a la primera opción que empieza con ellas.
        if (evento.key.length === 1 && !evento.ctrlKey && !evento.metaKey && !evento.altKey) {
          busqueda += evento.key.toLowerCase();
          clearTimeout(temporizador);
          temporizador = setTimeout(() => (busqueda = ""), 700);
          const posicion = opciones().findIndex((opcion) => opcion.textContent.toLowerCase().startsWith(busqueda));
          if (posicion !== -1) {
            if (!abierto) abrir();
            resaltar(posicion);
          }
        }
    }
  });

  // Si el valor del select cambia desde JavaScript (por ejemplo, al editar), se repinta.
  select.addEventListener("change", mostrarValor);
  // Al hacer clic en la etiqueta, el foco va al select oculto: lo pasamos al botón visible.
  select.addEventListener("focus", () => boton.focus());

  refrescarSelects.push(mostrarValor);
  mostrarValor();
}

document.querySelectorAll(".campo select").forEach(crearSelectPersonalizado);

// formulario.reset() cambia los valores sin avisar; se repintan justo después.
document.querySelectorAll("form").forEach((formulario) => {
  formulario.addEventListener("reset", () => {
    setTimeout(() => refrescarSelects.forEach((refrescar) => refrescar()), 0);
  });
});

// En pantallas táctiles, tocar fuera del menú también lo cierra.
document.addEventListener("pointerdown", (evento) => {
  if (cerrarMenuAbierto && !evento.target.closest(".select-personalizado")) cerrarMenuAbierto();
});
