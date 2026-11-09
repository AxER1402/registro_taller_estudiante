# Bitácora de repaso de Desarrollo Web

Completa una ficha por tema con tus palabras. No copies párrafos de los sitios consultados.

## Actividad · traza el recorrido
-1. ¿Qué presenta los campos?
El formulario (HTML) presenta los campos que Ana debe completar, como nombre, correo y contraseña.

-2. ¿Qué evita que el navegador recargue la página?
La función event.preventDefault()

-3. ¿Qué componente recibe el JSON?
El backend o servidor.

-4. ¿Qué parte puede guardar el registro?
La base de datos.

## HTML
- Resumen propio (2–3 frases):
HTML sirve para armar la estructura de una página web: títulos, textos, imágenes y formularios. No le da colores ni hace que las cosas funcionen; para eso están CSS y JavaScript.

- Dos términos clave y su explicación:
<label>: es el texto que dice qué va en cada campo. Se conecta al campo cuando su for es igual al id del campo.
<required>: hace que un campo sea obligatorio. Si se deja vacío, el navegador no deja enviar el formulario.

- Ejemplo de código explicado:
 <label for="telefono">Teléfono</label>
    <input id="telefono" name="telefono" type="tel">

La etiqueta dice “Teléfono” y se une al campo porque for e id son iguales. El type="tel" indica que ahí va un número de teléfono.

- Pregunta que podría aparecer en el examen:
¿Para qué sirve el atributo required en un formulario?

- Piensa: ¿por qué conviene validar un correo también en el servidor, aunque el formulario use type="email"?
type="email" solo revisa el correo en el navegador, y eso se puede saltar fácil: alguien puede quitar el atributo desde el inspector o mandar los datos directo a la API con otra herramienta, sin usar el formulario. El servidor es el que guarda los datos, así que no puede confiar en lo que le llega y tiene que revisarlo él también. La validación del navegador ayuda al usuario a no equivocarse, pero la del servidor es la que protege los datos.


## CSS
- Resumen propio (2–3 frases):
CSS es lo que hace que una página se vea bien. HTML pone el contenido, pero sin CSS todo sale plano y pegado; me pasó cuando abrí la página sin el servidor y no cargaba el estilo. Con CSS elijo los colores, los tamaños y cuánto espacio queda entre cada cosa.

- Dos términos clave y su explicación:
padding: es el espacio de adentro, entre el borde y lo que hay dentro. Cuando le subí el padding al formulario, los campos se alejaron del borde.
margin: es el espacio de afuera. Separa un elemento de lo que tiene alrededor; cuando lo agregué, el formulario se separó del título.

- Ejemplo de código explicado:
 form {
   border: 2px solid #087e83;
   border-radius: 12px;
   padding: 1.5rem;
   margin: 1.5rem 0;
 }

Esta regla se aplica al <form>, o sea, al formulario de inscripción. Le puse un borde verde de 2px con las esquinas un poco redondeadas. Con el padding los campos ya no quedan pegados al borde, y con el margin el formulario se separa del título de arriba y del mensaje de abajo.

- Pregunta que podría aparecer en el examen:
¿Qué diferencia hay entre padding y margin?

## Actividad · regla CSS propia
Antes de avanzar: registra en bitacora.md una regla CSS propia y explica qué elemento selecciona.

 form {
   border: 2px solid #087e83;
   padding: 1.5rem;
   margin: 1.5rem 0;
 }

Esta regla selecciona la etiqueta <form>, o sea, el formulario de inscripción. Como uso el nombre de la etiqueta y no una clase ni un id, se aplicaría a todos los formularios de la página, pero aquí solo hay uno. Solo cambia la caja del formulario; los campos de adentro conservan su propio borde y estilo.

## Actividad · Flexbox y media query
Registra en tu bitácora: una propiedad de Flexbox, una regla de media query y qué cambio visual produce cada una.

Propiedad de Flexbox:
 .contenedor { display: flex; }

Con display: flex, los hijos del contenedor se acomodan en fila en vez de quedar uno debajo del otro. Lo probé en el proyecto y el formulario y la lista de inscritos quedaron lado a lado, como dos columnas. Al final lo quité para que la página quede como la del catedrático, con la lista debajo del formulario.

Media query:
 @media (max-width: 640px) {
   .contenedor { padding: 1.5rem 0; }
   .panel { padding: 1rem; }
   form { padding: 1rem; }
 }

Esta regla solo funciona cuando la pantalla mide 640px o menos, como en un teléfono. Ahí se reduce el espacio de arriba de la página y el relleno de los paneles y del formulario, así los campos tienen más lugar y no se ven tan apretados.

## Actividad · juego de Flexbox
Resuelve niveles y explica las propiedades. Registra dos propiedades que usaste.

align-items: center;
Sirve para centrar los elementos en el eje cruzado. Si los elementos están en fila, los centra de arriba a abajo. En el juego la usé para mover las ranas a la mitad del estanque, a la altura de las hojas.

flex-direction: row-reverse;
Pone los elementos en fila, pero al revés: el primero queda a la derecha y el último a la izquierda. En el juego me sirvió cuando las ranas tenían que quedar en el orden contrario y empezar desde el otro lado.


## JavaScript y DOM
- Resumen propio (2–3 frases):
JavaScript es lo que hace que la página haga cosas: reaccionar cuando doy clic, revisar los datos o mostrar un mensaje sin recargar. El DOM es la forma en que el navegador ve el HTML, como un árbol de elementos que JavaScript puede buscar y cambiar. Así puedo, por ejemplo, agregar un nombre a la lista de inscritos sin tocar el HTML a mano.

- Dos términos clave y su explicación:
querySelector: busca un elemento de la página con un selector igual que en CSS (#id, .clase o etiqueta) y devuelve el primero que encuentra.
addEventListener: hace que un elemento "escuche" algo que pasa, como un clic o el envío del formulario, y ejecute una función cuando ocurre.

- Ejemplo de código explicado:
 const formulario = document.querySelector("#formulario-registro");

 formulario.addEventListener("submit", (evento) => {
   evento.preventDefault();
 });

La primera línea busca el formulario por su id y lo guarda en la constante formulario. Después le digo que, cuando se envíe, ejecute la función. Con evento.preventDefault() evito que la página se recargue, que es lo que hace el navegador normalmente al enviar un formulario. Así puedo mandar los datos con fetch sin perder lo que está en pantalla.

- Pregunta que podría aparecer en el examen:
¿Qué hace document.querySelector() y qué devuelve si no encuentra el elemento?

## Actividad · const y let
Explica: escribe un caso donde usarías const y otro donde usarías let.

const: la uso cuando el valor no va a cambiar. Por ejemplo, en app.js:
 const formulario = document.querySelector("#formulario-registro");
El formulario siempre es el mismo, así que no tiene sentido volver a asignarlo. Si lo intento, JavaScript da error.

let: la uso cuando el valor sí va a cambiar. Por ejemplo, para contar las inscripciones:
 let total = 0;
 total = total + 1;
Cada vez que alguien se registra, el total sube, así que necesito poder cambiarlo.

## Node.js, Express y API
- Resumen propio (2–3 frases):
Node.js permite usar JavaScript fuera del navegador, por ejemplo para hacer un servidor. Express es una librería que hace más fácil crear ese servidor y sus rutas. Una API son las rutas que el servidor ofrece para que el navegador pida o mande datos, casi siempre en formato JSON.

- Dos términos clave y su explicación:
ruta: es una dirección del servidor junto con un método, como GET o POST. Por ejemplo, GET /api/inscripciones sirve para pedir la lista de inscritos.
JSON: es el formato de texto que usan el navegador y el servidor para pasarse datos. Se parece a un objeto de JavaScript, con llaves y pares de nombre y valor.

- Ejemplo de ruta o solicitud explicado:
 app.get("/api/inscripciones", (req, res) => {
   res.json(inscripciones);
 });

Esta ruta está en server.js. Cuando el navegador hace una solicitud GET a /api/inscripciones, el servidor le responde con el arreglo de inscripciones en JSON. req trae lo que manda el navegador y res es lo que el servidor contesta. Si abro http://localhost:3000/api/inscripciones veo la lista, que por ahora sale vacía: [].

- Pregunta que podría aparecer en el examen:
¿Qué diferencia hay entre una solicitud GET y una POST?

## Actividad · Node.js, npm y VS Code
¿Qué diferencia hay entre Node.js, npm y VS Code? ¿Por qué node_modules aparece después de instalar y no debe subirse a GitHub?

Node.js es el programa que ejecuta JavaScript en la computadora; es lo que corre server.js cuando escribo npm start. npm es el administrador de paquetes que viene con Node: descarga las librerías que necesita el proyecto, como Express, y ejecuta los scripts del package.json. VS Code solo es el editor donde escribo el código y abro la terminal; por sí mismo no ejecuta nada.

La carpeta node_modules aparece después de npm install porque ahí se guardan Express y todas las librerías de las que depende. No se sube a GitHub porque pesa mucho y se puede volver a crear en cualquier momento con npm install, ya que el package.json dice qué hay que instalar. Por eso está en el .gitignore.

## Actividad · rutas y estados HTTP
Define qué es una ruta. Escribe un ejemplo de GET y otro de POST, e indica cuándo usarías los estados HTTP 200, 201 y 400.

Ruta: es la combinación de un método (GET, POST, etc.) y una dirección del servidor, como /api/inscripciones. Cuando llega una solicitud que coincide con los dos, el servidor ejecuta la función que le puse a esa ruta.

Ejemplo de GET (pedir datos):
 app.get("/api/inscripciones", (req, res) => {
   res.json(inscripciones);
 });

La uso para pedir la lista de inscritos. No cambia nada en el servidor, solo devuelve lo que ya está guardado.

Ejemplo de POST (mandar datos nuevos):
 app.post("/api/inscripciones", (req, res) => {
   const { nombre, correo, telefono, taller, horario } = req.body;
   // aquí reviso que estén completos y que el correo sea válido
   const nuevaInscripcion = { id: inscripciones.length + 1, nombre, correo, telefono, taller, horario };
   inscripciones.push(nuevaInscripcion);
   res.status(201).json(nuevaInscripcion);
 });

La uso cuando alguien llena el formulario. El navegador manda los datos en el cuerpo de la solicitud (req.body) y el servidor crea una inscripción nueva.

Estados HTTP:
200: todo salió bien. Es el que manda res.json() si no le pongo otro, por ejemplo cuando el GET devuelve la lista.
201: se creó algo nuevo. Lo uso en el POST cuando la inscripción se guardó.
400: la solicitud trae algo mal, como un campo vacío o un correo sin @. El servidor no guarda nada y responde con un mensaje que explica el error.

## Actividad · JSON.stringify() y response.json()
Explica la diferencia entre JSON.stringify() y response.json(). ¿Qué representa el estado 201?

JSON.stringify(): convierte un objeto de JavaScript en texto JSON. Lo uso en app.js antes de mandar los datos con fetch, porque por la red solo viaja texto:
 body: JSON.stringify(inscripcion)

response.json(): hace lo contrario. Toma la respuesta del servidor, que llega como texto JSON, y la convierte en un objeto de JavaScript para poder usarla. Como tarda un poco, lleva await:
 const resultado = await respuesta.json();

En pocas palabras: JSON.stringify() es para mandar (objeto a texto) y response.json() es para recibir (texto a objeto).

Estado 201: significa "Created", o sea, que la solicitud salió bien y además se creó algo nuevo en el servidor. En mi proyecto lo manda el POST cuando la inscripción se guardó, junto con el registro nuevo y su id. Es más específico que 200, que solo dice que todo salió bien.

## SQL
- Resumen propio (2–3 frases):
SQL es el lenguaje que se usa para hablar con una base de datos: guardar, buscar, cambiar y borrar información. Los datos se guardan en tablas, con columnas (nombre, correo...) y filas (cada registro). En mi proyecto las inscripciones están en un arreglo y se borran al apagar el servidor; con una base de datos se quedarían guardadas.

- Explica SELECT, INSERT, UPDATE y DELETE:
SELECT: sirve para consultar datos. Por ejemplo, traer todas las inscripciones:
 SELECT * FROM inscripciones;

INSERT: agrega una fila nueva, como cuando alguien se inscribe:
 INSERT INTO inscripciones (nombre, correo, telefono, taller, horario)
 VALUES ('Ana López', 'ana@correo.com', '5555-1234', 'JavaScript', 'Tarde (14:00 - 16:00)');

UPDATE: cambia datos que ya existen, por ejemplo si Ana se pasa al horario de la noche:
 UPDATE inscripciones SET horario = 'Noche (18:00 - 20:00)' WHERE id = 1;

DELETE: borra filas, por ejemplo si alguien cancela:
 DELETE FROM inscripciones WHERE id = 1;

En UPDATE y DELETE hay que tener cuidado con el WHERE, porque es lo que dice qué fila cambiar. Sin WHERE se modifican o se borran todas.

- ¿Qué son una clave primaria y una clave foránea?
La clave primaria es la columna que identifica a cada fila y no se puede repetir, como el id de cada inscripción. La clave foránea es una columna que apunta a la clave primaria de otra tabla. Por ejemplo, si tuviera una tabla talleres, en inscripciones podría guardar un taller_id que apunte al id del taller, y así cada inscripción queda conectada con un taller que sí existe.

- Pregunta que podría aparecer en el examen:
¿Qué pasa si ejecuto un DELETE sin WHERE?

## Git y GitHub
- Resumen propio (2–3 frases):
- Explica add, commit y push:
git add elige qué cambios quiero guardar; es como meterlos en una caja antes de cerrarla. git commit cierra esa caja y guarda una "foto" del proyecto en mi computadora, con un mensaje que dice qué cambié. git push sube esos commits a GitHub para que queden en internet y otros puedan verlos.

- Diferencia entre Git y GitHub:
- Pregunta que podría aparecer en el examen:

## Actividad · mensajes de commit
¿Qué información comunica un buen mensaje de commit?

Un buen mensaje dice qué cambió y, si hace falta, por qué, en pocas palabras. Así, cuando yo o el catedrático revisamos el historial, se entiende cada paso sin tener que abrir el código. Por ejemplo, "Agrega validación del correo en la ruta POST" dice mucho más que "cambios" o "ya quedó".

## Cuestionario · respuestas incorrectas
Puntuación: 6 de 7. Me equivoqué en una pregunta:

5. ¿Cuándo se activa @media (max-width: 640px)?
Respuesta correcta: cuando el ancho es de 640 px o menos.

max-width quiere decir "ancho máximo", así que las reglas de adentro se aplican mientras la pantalla mida hasta 640px de ancho, incluyendo los 640 exactos. Si la pantalla es más ancha, esas reglas se ignoran. No tiene nada que ver con el alto (para eso sería max-height) y tampoco se aplica siempre. En mi proyecto es la regla que reduce el relleno de los paneles cuando la ventana se hace angosta, como en un teléfono. Para no confundirme: max-width es "hasta este ancho" y min-width es "desde este ancho".
