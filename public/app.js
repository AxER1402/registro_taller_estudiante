const formulario = document.querySelector("#formulario-registro");
const lista = document.querySelector("#lista-inscripciones");
const mensaje = document.querySelector("#mensaje");
const botonGuardar = document.querySelector("#boton-guardar");
const botonCancelar = document.querySelector("#boton-cancelar");
const avisoEdicion = document.querySelector("#aviso-edicion");

// Guarda el id de la inscripción que se está editando.
// null = el formulario está creando una inscripción nueva (POST).
let idEnEdicion = null;

function mostrarMensaje(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.classList.toggle("error", esError);
}

// SQLite guarda fecha_registro en UTC ("2026-11-09 18:30:00").
// Se agrega la "Z" para que el navegador la convierta a la hora local.
function formatearFecha(fecha) {
  const valor = new Date(fecha.replace(" ", "T") + "Z");
  return Number.isNaN(valor.getTime())
    ? fecha
    : valor.toLocaleString("es", { dateStyle: "medium", timeStyle: "short" });
}

function crearParrafo(texto, clase) {
  const parrafo = document.createElement("p");
  parrafo.className = clase;
  parrafo.textContent = texto;
  return parrafo;
}

function crearBoton(texto, clase, alHacerClic) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = clase;
  boton.textContent = texto;
  boton.addEventListener("click", alHacerClic);
  return boton;
}

// ---------- GET: mostrar registros ----------
async function cargarInscripciones() {
  try {
    const respuesta = await fetch("/api/inscripciones");
    const filas = await respuesta.json();
    lista.replaceChildren();

    if (filas.length === 0) {
      const vacio = document.createElement("li");
      vacio.className = "vacio";
      vacio.textContent = "Aún no hay inscripciones.";
      lista.append(vacio);
      return;
    }

    filas.forEach((fila) => {
      const item = document.createElement("li");
      item.dataset.id = fila.id;
      item.classList.toggle("en-edicion", fila.id === idEnEdicion);

      // textContent muestra el texto tal cual, sin interpretarlo como HTML.
      const datos = document.createElement("div");
      datos.className = "datos-inscripcion";
      datos.append(
        crearParrafo(fila.nombre, "nombre"),
        crearParrafo(`${fila.taller} · ${fila.horario}`, "detalle"),
        crearParrafo(`${fila.modalidad} · Experiencia previa: ${fila.nivel_experiencia}`, "detalle"),
        crearParrafo(`${fila.correo} · ${fila.telefono}`, "detalle"),
        crearParrafo(`Registrado: ${formatearFecha(fila.fecha_registro)}`, "detalle")
      );

      const acciones = document.createElement("div");
      acciones.className = "acciones-item";
      acciones.append(
        crearBoton("Editar", "boton-secundario", () => prepararEdicion(fila)),
        crearBoton("Eliminar", "boton-peligro", () => eliminarInscripcion(fila))
      );

      item.append(datos, acciones);
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
    if (control) control.value = valor;
  });

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
  if (!confirm(`¿Eliminar la inscripción de ${fila.nombre}?`)) return;

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
  // Validación del navegador: required, type="email", pattern, minlength...
  if (!formulario.reportValidity()) return;

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
function dibujarBarras(selector, filas, campo) {
  const contenedor = document.querySelector(selector);
  contenedor.replaceChildren();
  const mayor = Math.max(...filas.map((fila) => Number(fila.cantidad)), 1);

  filas.forEach((fila) => {
    const item = document.createElement("li");

    const etiqueta = document.createElement("p");
    const nombre = document.createElement("span");
    nombre.textContent = fila[campo];
    const cantidad = document.createElement("strong");
    cantidad.textContent = fila.cantidad;
    etiqueta.append(nombre, cantidad);

    const fondo = document.createElement("div");
    fondo.className = "barra-fondo";
    const barra = document.createElement("div");
    barra.className = "barra";
    barra.style.width = (Number(fila.cantidad) / mayor) * 100 + "%";
    fondo.append(barra);

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

    dibujarBarras("#reporte-talleres", datos.porTaller, "taller");
    dibujarBarras("#reporte-horarios", datos.porHorario, "horario");
    dibujarBarras("#reporte-modalidades", datos.porModalidad, "modalidad");
    dibujarBarras("#reporte-niveles", datos.porNivel, "nivel_experiencia");
  } catch (error) {
    mostrarMensaje("No se pudieron cargar los reportes. Revisa que el servidor esté encendido.", true);
  }
}

cargarInscripciones();
cargarReportes();
