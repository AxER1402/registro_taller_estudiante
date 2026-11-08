const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Este arreglo guarda los registros solo mientras el servidor está activo.
const inscripciones = [];

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Esta ruta ya permite consultar la lista.
app.get("/api/inscripciones", (req, res) => {
  res.json(inscripciones);
});

app.post("/api/inscripciones", (req, res) => {
  // TODO 1: Extrae nombre, correo, telefono, taller y horario de req.body.
  const { nombre, correo, telefono, taller, horario } = req.body ?? {};

  // TODO 2: Revisa que todos los campos existan y no estén vacíos.
  const campos = [nombre, correo, telefono, taller, horario];
  const faltaAlguno = campos.some((campo) => typeof campo !== "string" || campo.trim() === "");
  if (faltaAlguno) {
    return res.status(400).json({ mensaje: "Completa todos los campos: nombre, correo, teléfono, taller y horario." });
  }

  // TODO 3: Comprueba que el correo tenga un formato válido.
  const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formatoCorreo.test(correo.trim())) {
    return res.status(400).json({ mensaje: "El correo no tiene un formato válido." });
  }

  // TODO 4: Crea un objeto con id y los cinco datos; agrégalo a inscripciones.
  const nuevaInscripcion = {
    id: inscripciones.length + 1,
    nombre: nombre.trim(),
    correo: correo.trim(),
    telefono: telefono.trim(),
    taller: taller.trim(),
    horario: horario.trim()
  };
  inscripciones.push(nuevaInscripcion);

  // TODO 5: Responde con estado 201 y el registro creado.
  res.status(201).json(nuevaInscripcion);
});

app.listen(PORT, () => {
  console.log(`Servidor disponible en http://localhost:${PORT}`);
});
