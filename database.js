// Conexión con la base de datos SQLite usando el módulo integrado de Node.js.
// No hace falta instalar un servidor de base de datos: todo se guarda en un archivo.
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

// Abre registro_taller.db junto a server.js; si el archivo no existe, lo crea.
const db = new DatabaseSync(path.join(__dirname, "registro_taller.db"));

// Crea la tabla la primera vez que se inicia el servidor.
// id: clave primaria que SQLite asigna sola (1, 2, 3...).
// NOT NULL: la columna siempre debe recibir un valor.
// fecha_registro: se llena automáticamente con la fecha y hora (UTC) del INSERT.
db.exec(
  "CREATE TABLE IF NOT EXISTS inscripciones (" +
  "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
  "nombre TEXT NOT NULL, " +
  "correo TEXT NOT NULL, " +
  "telefono TEXT NOT NULL, " +
  "taller TEXT NOT NULL, " +
  "horario TEXT NOT NULL, " +
  "modalidad TEXT NOT NULL, " +
  "nivel_experiencia TEXT NOT NULL, " +
  "fecha_registro TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP" +
  ")"
);

module.exports = db;
