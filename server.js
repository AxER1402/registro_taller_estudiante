const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Opciones permitidas en cada select. Deben coincidir con los <option> del HTML.
const OPCIONES = {
  taller: ["HTML y CSS", "JavaScript", "Node.js y Express"],
  horario: ["Mañana (8:00 - 10:00)", "Tarde (14:00 - 16:00)", "Noche (18:00 - 20:00)"],
  modalidad: ["Presencial", "Virtual"],
  nivel_experiencia: ["Inicial", "Intermedio", "Avanzado"]
};

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Solo números, espacios, guiones y el signo +, entre 8 y 20 caracteres.
const FORMATO_TELEFONO = /^[0-9+\-\s]{8,20}$/;

// Limpia y valida los datos que llegan en req.body.
// La usan POST y PUT para no repetir las mismas reglas dos veces.
// Devuelve { datos } si todo está bien, o { error } con el motivo.
function validarInscripcion(cuerpo) {
  const texto = (valor) => (typeof valor === "string" ? valor.trim() : "");

  const datos = {
    nombre: texto(cuerpo.nombre),
    correo: texto(cuerpo.correo).toLowerCase(),
    telefono: texto(cuerpo.telefono),
    taller: texto(cuerpo.taller),
    horario: texto(cuerpo.horario),
    modalidad: texto(cuerpo.modalidad),
    nivel_experiencia: texto(cuerpo.nivel_experiencia)
  };

  if (Object.values(datos).some((valor) => !valor)) {
    return { error: "Completa todos los campos." };
  }
  if (datos.nombre.length < 2 || datos.nombre.length > 80) {
    return { error: "El nombre debe tener entre 2 y 80 caracteres." };
  }
  if (datos.correo.length > 120 || !FORMATO_CORREO.test(datos.correo)) {
    return { error: "Escribe un correo válido." };
  }
  if (!FORMATO_TELEFONO.test(datos.telefono)) {
    return { error: "El teléfono debe tener entre 8 y 20 caracteres: números, espacios, guiones o +." };
  }
  for (const [campo, permitidas] of Object.entries(OPCIONES)) {
    if (!permitidas.includes(datos[campo])) {
      return { error: `El valor elegido en ${campo.replace("_", " de ")} no es válido.` };
    }
  }

  return { datos };
}

// Convierte el :id de la ruta en número. Devuelve null si no es un entero positivo.
function leerId(req) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET: lee todas las inscripciones desde la base.
app.get("/api/inscripciones", (req, res) => {
  const filas = db.prepare(
    "SELECT id, nombre, correo, telefono, taller, horario, " +
    "modalidad, nivel_experiencia, fecha_registro " +
    "FROM inscripciones ORDER BY id DESC"
  ).all();

  res.json(filas);
});

// POST: valida y guarda una inscripción nueva.
app.post("/api/inscripciones", (req, res) => {
  const { datos, error } = validarInscripcion(req.body ?? {});
  if (error) {
    return res.status(400).json({ error });
  }

  // Los signos ? son sentencias preparadas: SQLite recibe los valores aparte,
  // así el texto escrito por el usuario nunca se mezcla con la consulta SQL.
  const resultado = db.prepare(
    "INSERT INTO inscripciones " +
    "(nombre, correo, telefono, taller, horario, modalidad, nivel_experiencia) " +
    "VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(
    datos.nombre, datos.correo, datos.telefono,
    datos.taller, datos.horario, datos.modalidad,
    datos.nivel_experiencia
  );

  res.status(201).json({
    mensaje: `Inscripción de ${datos.nombre} guardada.`,
    id: Number(resultado.lastInsertRowid)
  });
});

// PUT: valida y actualiza la inscripción indicada por su id.
app.put("/api/inscripciones/:id", (req, res) => {
  const id = leerId(req);
  if (id === null) {
    return res.status(400).json({ error: "Id inválido." });
  }

  const { datos, error } = validarInscripcion(req.body ?? {});
  if (error) {
    return res.status(400).json({ error });
  }

  const resultado = db.prepare(
    "UPDATE inscripciones SET nombre = ?, correo = ?, telefono = ?, " +
    "taller = ?, horario = ?, modalidad = ?, nivel_experiencia = ? " +
    "WHERE id = ?"
  ).run(
    datos.nombre, datos.correo, datos.telefono,
    datos.taller, datos.horario, datos.modalidad,
    datos.nivel_experiencia, id
  );

  // changes indica cuántas filas cambió el UPDATE; 0 significa que el id no existe.
  if (resultado.changes === 0) {
    return res.status(404).json({ error: "No se encontró la inscripción." });
  }

  res.json({ mensaje: `Inscripción de ${datos.nombre} actualizada.` });
});

// DELETE: elimina la inscripción indicada y avisa si no existe.
app.delete("/api/inscripciones/:id", (req, res) => {
  const id = leerId(req);
  if (id === null) {
    return res.status(400).json({ error: "Id inválido." });
  }

  const resultado = db.prepare("DELETE FROM inscripciones WHERE id = ?").run(id);

  if (resultado.changes === 0) {
    return res.status(404).json({ error: "No se encontró la inscripción." });
  }

  res.json({ mensaje: "Inscripción eliminada." });
});

// GET: conteos calculados directamente en la base para los reportes visuales.
app.get("/api/reportes/resumen", (req, res) => {
  const total = db.prepare(
    "SELECT COUNT(*) AS total FROM inscripciones"
  ).get().total;

  const porTaller = db.prepare(
    "SELECT taller, COUNT(*) AS cantidad FROM inscripciones " +
    "GROUP BY taller ORDER BY cantidad DESC, taller"
  ).all();

  const porHorario = db.prepare(
    "SELECT horario, COUNT(*) AS cantidad FROM inscripciones " +
    "GROUP BY horario ORDER BY cantidad DESC, horario"
  ).all();

  const porModalidad = db.prepare(
    "SELECT modalidad, COUNT(*) AS cantidad FROM inscripciones " +
    "GROUP BY modalidad ORDER BY cantidad DESC, modalidad"
  ).all();

  const porNivel = db.prepare(
    "SELECT nivel_experiencia, COUNT(*) AS cantidad FROM inscripciones " +
    "GROUP BY nivel_experiencia ORDER BY cantidad DESC, nivel_experiencia"
  ).all();

  res.json({ total, porTaller, porHorario, porModalidad, porNivel });
});

// En Express 5, si el servidor no puede iniciar (por ejemplo, porque el puerto
// ya está ocupado por otro npm start), el error llega como parámetro.
app.listen(PORT, (error) => {
  if (error) {
    console.error(error.code === "EADDRINUSE"
      ? `No se pudo iniciar: el puerto ${PORT} ya está en uso. Cierra el otro servidor (Ctrl + C) e intenta de nuevo.`
      : `No se pudo iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
  console.log(`Servidor disponible en http://localhost:${PORT}`);
});
