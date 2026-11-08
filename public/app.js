const formulario = document.querySelector("#formulario-registro");
const lista = document.querySelector("#lista-inscripciones");
const mensaje = document.querySelector("#mensaje");

async function cargarInscripciones() {
  try {
    // TODO: Solicita GET /api/inscripciones con fetch().
    const respuesta = await fetch("/api/inscripciones");
    const inscripciones = await respuesta.json();

    // TODO: Limpia la lista y dibuja cada registro recibido.
    // Usa textContent para mostrar los datos.
    lista.textContent = "";

    if (inscripciones.length === 0) {
      const vacio = document.createElement("li");
      vacio.className = "vacio";
      vacio.textContent = "Aún no hay inscripciones.";
      lista.append(vacio);
      return;
    }

    inscripciones.forEach((inscripcion) => {
      const item = document.createElement("li");
      item.textContent = `${inscripcion.nombre} · ${inscripcion.taller} · ${inscripcion.horario}`;
      lista.append(item);
    });
  } catch (error) {
    mensaje.textContent = "No se pudo cargar la lista. Revisa que el servidor esté encendido.";
  }
}

formulario.addEventListener("submit", async (evento) => {
  // TODO 1: Evita que el formulario recargue la página.
  evento.preventDefault();

  // TODO 2: Obtén los valores del formulario.
  const datos = new FormData(formulario);
  console.log("Nombre:", datos.get("nombre"));

  // TODO 3: Envía los cinco datos como JSON con POST /api/inscripciones.
  const inscripcion = {
    nombre: datos.get("nombre"),
    correo: datos.get("correo"),
    telefono: datos.get("telefono"),
    taller: datos.get("taller"),
    horario: datos.get("horario")
  };

  try {
    const respuesta = await fetch("/api/inscripciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inscripcion)
    });
    const resultado = await respuesta.json();

    // TODO 4: Muestra confirmación o el mensaje de error del servidor.
    if (!respuesta.ok) {
      mensaje.textContent = resultado.mensaje;
      return;
    }
    mensaje.textContent = `¡Listo, ${resultado.nombre}! Tu inscripción quedó registrada.`;

    // TODO 5: Si se guardó, limpia el formulario y vuelve a cargar la lista.
    formulario.reset();
    await cargarInscripciones();
  } catch (error) {
    mensaje.textContent = "No se pudo conectar con el servidor. Revisa que esté encendido.";
  }
});

cargarInscripciones();
