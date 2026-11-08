# Proyecto: Registro de participantes para un taller — versión base

Esta es la carpeta inicial para completar durante el repaso interactivo de Desarrollo Web. Busca cada comentario `TODO` y sigue las instrucciones del paso 19, “Proyecto final”, en `Repaso_Interactivo_Desarrollo_Web.html`.

## Requisitos
- Node.js 18 o superior (se recomienda LTS) y Visual Studio Code.
- Conexión a internet la primera vez para instalar Express.

## Ejecutar en VS Code
1. Abre esta carpeta con **File → Open Folder**.
2. Abre **Terminal → New Terminal**.
3. Ejecuta `npm install`.
4. Ejecuta `npm start`.
5. Abre `http://localhost:3000`.

### Si PowerShell bloquea npm.ps1
Si aparece un mensaje que dice que la ejecución de scripts está deshabilitada, usa estos comandos en la misma terminal:

```powershell
npm.cmd install
npm.cmd start
```

También puedes cambiar el perfil de la terminal de VS Code a **Command Prompt** y usar los comandos `npm install` y `npm start`.

El servidor y la ruta GET ya están preparados. Completa los TODO de HTML, CSS, JavaScript y la ruta POST. Los registros se guardan temporalmente en memoria y se borran al detener Node.

## API solicitada
- `GET /api/inscripciones`: devuelve el arreglo de registros en JSON.
- `POST /api/inscripciones`: recibe nombre, correo, teléfono, taller y horario; valida y crea una inscripción. Usa estado `201` al crear y `400` si los datos no son válidos.

## Entrega en GitHub
Sube el código fuente, `README.md` y `bitacora.md`. Completa al menos tres commits descriptivos y comparte el enlace del repositorio. No subas `node_modules/` ni archivos `.env`; ya están excluidos en `.gitignore`.
