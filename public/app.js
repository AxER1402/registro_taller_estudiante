const formulario = document.querySelector("#formulario-registro");
const lista = document.querySelector("#lista-inscripciones");
const mensaje = document.querySelector("#mensaje");
const botonGuardar = document.querySelector("#boton-guardar");
const botonCancelar = document.querySelector("#boton-cancelar");
const avisoEdicion = document.querySelector("#aviso-edicion");
const contador = document.querySelector("#contador-inscripciones");

// Guarda el id de la inscripción que se está editando.
// null = el formulario está creando una inscripción nueva (POST).
let idEnEdicion = null;

// true mientras el aviso general está contando los campos con error.
let resumenVisible = false;

function mostrarMensaje(texto, esError = false) {
  resumenVisible = false;
  mensaje.textContent = texto;
  mensaje.classList.toggle("error", esError);
}

// ---------- Validación en el navegador ----------
// El formulario tiene novalidate: el navegador sigue revisando required,
// type="email", pattern y minlength, pero en lugar de sus burbujas
// mostramos nuestros propios mensajes debajo de cada campo.
const MENSAJES = {
  nombre: {
    valueMissing: "Escribe tu nombre completo.",
    tooShort: "El nombre debe tener al menos 2 caracteres."
  },
  correo: {
    valueMissing: "Escribe tu correo electrónico.",
    typeMismatch: "Escribe un correo válido, por ejemplo ana@correo.com."
  },
  telefono: {
    valueMissing: "Escribe tu número de teléfono.",
    tooShort: "Usa de 8 a 20 caracteres: números, espacios, - o +.",
    patternMismatch: "Usa de 8 a 20 caracteres: números, espacios, - o +."
  },
  taller: { valueMissing: "Elige un taller." },
  horario: { valueMissing: "Elige un horario." },
  modalidad: { valueMissing: "Elige una modalidad." },
  nivel_experiencia: { valueMissing: "Elige tu experiencia previa." }
};

const controles = formulario.querySelectorAll(".campo input, .campo select");

// Revisa un campo con las reglas del HTML y muestra (o quita) su mensaje de error.
function validarCampo(control) {
  const campo = control.closest(".campo");
  const propios = MENSAJES[control.name] ?? {};
  // required acepta "   ", así que los espacios solos se revisan aparte.
  const soloEspacios = control.value !== "" && control.value.trim() === "";
  const valido = !soloEspacios && control.checkValidity();

  let texto = "";
  if (soloEspacios) {
    texto = propios.valueMissing;
  } else if (!valido) {
    const problema = ["valueMissing", "typeMismatch", "tooShort", "patternMismatch"]
      .find((tipo) => control.validity[tipo]);
    texto = propios[problema] ?? control.validationMessage;
  }

  campo.classList.toggle("con-error", !valido);
  campo.querySelector(".error-campo").textContent = texto;
  // En los select personalizados, el estado se marca en el cuadro visible.
  const visible = campo.querySelector("[role='combobox']") ?? control;
  visible.setAttribute("aria-invalid", String(!valido));
  return valido;
}

// Aviso general con cuántos campos faltan por corregir; desaparece al llegar a 0.
function actualizarResumen() {
  const pendientes = formulario.querySelectorAll(".campo.con-error").length;
  if (pendientes === 0) mostrarMensaje("");
  else if (pendientes === 1) mostrarMensaje("Revisa el campo marcado en rojo.", true);
  else mostrarMensaje(`Revisa los ${pendientes} campos marcados en rojo.`, true);
  resumenVisible = pendientes > 0;
}

function validarFormulario() {
  const invalidos = [...controles].filter((control) => !validarCampo(control));
  if (invalidos.length > 0) {
    invalidos[0].focus(); // en un select, el foco pasa a su cuadro visible
    actualizarResumen();
  }
  return invalidos.length === 0;
}

function limpiarErrores() {
  controles.forEach((control) => {
    const campo = control.closest(".campo");
    campo.classList.remove("con-error");
    campo.querySelector(".error-campo").textContent = "";
    (campo.querySelector("[role='combobox']") ?? control).removeAttribute("aria-invalid");
  });
}

// Si un campo ya está en rojo, se vuelve a revisar mientras la persona lo corrige.
function revisarSiTieneError(evento) {
  if (!evento.target.closest(".con-error")) return;
  validarCampo(evento.target);
  if (resumenVisible) actualizarResumen();
}
formulario.addEventListener("input", revisarSiTieneError);
formulario.addEventListener("change", revisarSiTieneError);

// Al salir de un campo de texto con algo escrito, se revisa (por ejemplo, el correo).
formulario.addEventListener("focusout", (evento) => {
  const control = evento.target;
  if (control.matches(".campo input") && control.value.trim() !== "") validarCampo(control);
});

// ---------- Ayudantes para crear elementos ----------
// SQLite guarda fecha_registro en UTC ("2026-11-09 18:30:00").
// Se agrega la "Z" para que el navegador la convierta a la hora local.
function formatearFecha(fecha) {
  const valor = new Date(fecha.replace(" ", "T") + "Z");
  return Number.isNaN(valor.getTime())
    ? fecha
    : valor.toLocaleString("es", { dateStyle: "medium", timeStyle: "short" });
}

// "Ana López" → "AL"
function iniciales(nombre) {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((parte) => parte[0].toUpperCase()).join("");
}

function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  // textContent muestra el texto tal cual, sin interpretarlo como HTML.
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function crearBoton(texto, clase, alHacerClic) {
  const boton = crearElemento("button", clase, texto);
  boton.type = "button";
  boton.addEventListener("click", alHacerClic);
  return boton;
}

// Botones Editar y Eliminar de cada tarjeta.
// Eliminar pide confirmación dentro de la misma tarjeta, sin el confirm() del navegador.
function crearAcciones(fila) {
  const acciones = crearElemento("div", "acciones-item");
  const editar = crearBoton("Editar", "boton-secundario boton-editar", () => prepararEdicion(fila));
  const eliminar = crearBoton("Eliminar", "boton-peligro boton-eliminar", () => {
    const pregunta = crearElemento("p", "pregunta-eliminar", "¿Eliminar esta inscripción?");
    const cancelar = crearBoton("Cancelar", "boton-secundario", () => {
      acciones.replaceChildren(editar, eliminar);
      eliminar.focus();
    });
    const confirmar = crearBoton("Sí, eliminar", "boton-peligro boton-confirmar", () => eliminarInscripcion(fila));
    acciones.replaceChildren(pregunta, cancelar, confirmar);
    cancelar.focus();
  });
  acciones.append(editar, eliminar);
  return acciones;
}

// ---------- GET: mostrar registros ----------
async function cargarInscripciones() {
  try {
    const respuesta = await fetch("/api/inscripciones");
    const filas = await respuesta.json();
    lista.replaceChildren();
    contador.textContent = filas.length;

    if (filas.length === 0) {
      lista.append(crearElemento("li", "vacio", "Aún no hay inscripciones. Usa el formulario para registrar la primera."));
      return;
    }

    filas.forEach((fila) => {
      const item = document.createElement("li");
      item.dataset.id = fila.id;
      item.classList.toggle("en-edicion", fila.id === idEnEdicion);

      const avatar = crearElemento("span", "avatar", iniciales(fila.nombre));
      avatar.setAttribute("aria-hidden", "true");

      const chips = crearElemento("p", "datos-chips");
      chips.append(
        crearElemento("span", "chip chip-taller", fila.taller),
        crearElemento("span", "chip", fila.horario),
        crearElemento("span", "chip", fila.modalidad),
        crearElemento("span", "chip", `Experiencia: ${fila.nivel_experiencia}`)
      );

      const datos = crearElemento("div", "datos-inscripcion");
      datos.append(
        crearElemento("p", "nombre", fila.nombre),
        crearElemento("p", "contacto", `${fila.correo} · ${fila.telefono}`),
        chips,
        crearElemento("p", "fecha", `Registrado: ${formatearFecha(fila.fecha_registro)}`)
      );

      item.append(avatar, datos, crearAcciones(fila));
      lista.append(item);
    });
  } catch (error) {
    mostrarMensaje("No se pudo cargar la lista. Revisa que el servidor esté encendido.", true);
  }
}

// ---------- Editar: cargar la fila en el formulario ----------
function prepararEdicion(fila) {
  idEnEdicion = fila.id;

  // Cada clave de la fila (nombre, correo...) coincide con el name de un control.
  Object.entries(fila).forEach(([campo, valor]) => {
    const control = formulario.elements.namedItem(campo);
    if (!control) return;
    control.value = valor;
    // Avisa del cambio para que el select personalizado muestre el valor nuevo.
    control.dispatchEvent(new Event("change", { bubbles: true }));
  });
  limpiarErrores();

  botonGuardar.textContent = "Guardar cambios";
  botonCancelar.hidden = false;
  avisoEdicion.textContent = `Editando la inscripción de ${fila.nombre}.`;
  avisoEdicion.hidden = false;
  mostrarMensaje("");
  marcarFilaEnEdicion();

  document.querySelector("#panel-formulario").scrollIntoView({ behavior: "smooth" });
  formulario.elements.namedItem("nombre").focus({ preventScroll: true });
}

function salirDeEdicion() {
  idEnEdicion = null;
  formulario.reset();
  limpiarErrores();
  botonGuardar.textContent = "Registrar inscripción";
  botonCancelar.hidden = true;
  avisoEdicion.hidden = true;
  marcarFilaEnEdicion();
}

// Resalta en la lista la fila que se está editando sin volver a pedir los datos.
function marcarFilaEnEdicion() {
  lista.querySelectorAll("li").forEach((item) => {
    item.classList.toggle("en-edicion", item.dataset.id === String(idEnEdicion));
  });
}

botonCancelar.addEventListener("click", () => {
  salirDeEdicion();
  mostrarMensaje("Edición cancelada.");
});

// ---------- DELETE: eliminar y refrescar ----------
async function eliminarInscripcion(fila) {
  try {
    const respuesta = await fetch("/api/inscripciones/" + fila.id, { method: "DELETE" });
    const resultado = await respuesta.json();
    mostrarMensaje(resultado.mensaje || resultado.error, !respuesta.ok);

    if (respuesta.ok) {
      if (fila.id === idEnEdicion) salirDeEdicion();
      await cargarInscripciones();
      await cargarReportes();
    }
  } catch (error) {
    mostrarMensaje("No se pudo conectar con el servidor. Revisa que esté encendido.", true);
  }
}

// ---------- POST o PUT: enviar el formulario ----------
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (!validarFormulario()) return;

  // FormData usa el atributo name de cada control como clave del objeto.
  const datos = Object.fromEntries(new FormData(formulario));
  const metodo = idEnEdicion ? "PUT" : "POST";
  const ruta = idEnEdicion ? "/api/inscripciones/" + idEnEdicion : "/api/inscripciones";

  try {
    const respuesta = await fetch(ruta, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
    const resultado = await respuesta.json();
    mostrarMensaje(resultado.mensaje || resultado.error, !respuesta.ok);

    // Si hubo error, los datos se quedan en el formulario para corregirlos.
    if (respuesta.ok) {
      salirDeEdicion();
      await cargarInscripciones();
      await cargarReportes();
    }
  } catch (error) {
    mostrarMensaje("No se pudo conectar con el servidor. Revisa que esté encendido.", true);
  }
});

// ---------- Reportes visuales ----------
// Dibuja una barra por fila. campo es la columna agrupada (taller, horario...).
function dibujarBarras(selector, filas, campo, total) {
  const contenedor = document.querySelector(selector);
  contenedor.replaceChildren();
  const mayor = Math.max(...filas.map((fila) => Number(fila.cantidad)), 1);

  filas.forEach((fila) => {
    const cantidad = Number(fila.cantidad);
    const porcentaje = Math.round((cantidad / total) * 100);

    const etiqueta = document.createElement("p");
    const valor = crearElemento("span", "cantidad", `${cantidad} `);
    valor.append(crearElemento("span", "porcentaje", `· ${porcentaje} %`));
    etiqueta.append(crearElemento("span", "", fila[campo]), valor);

    const fondo = crearElemento("div", "barra-fondo");
    const barra = crearElemento("div", "barra");
    barra.style.width = (cantidad / mayor) * 100 + "%";
    fondo.append(barra);

    const item = document.createElement("li");
    item.append(etiqueta, fondo);
    contenedor.append(item);
  });
}

async function cargarReportes() {
  try {
    const respuesta = await fetch("/api/reportes/resumen");
    const datos = await respuesta.json();

    document.querySelector("#total").textContent = datos.total;
    document.querySelector("#reportes-vacio").hidden = datos.total > 0;

    dibujarBarras("#reporte-talleres", datos.porTaller, "taller", datos.total);
    dibujarBarras("#reporte-horarios", datos.porHorario, "horario", datos.total);
    dibujarBarras("#reporte-modalidades", datos.porModalidad, "modalidad", datos.total);
    dibujarBarras("#reporte-niveles", datos.porNivel, "nivel_experiencia", datos.total);
  } catch (error) {
    mostrarMensaje("No se pudieron cargar los reportes. Revisa que el servidor esté encendido.", true);
  }
}

cargarInscripciones();
cargarReportes();
