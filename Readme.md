# Gestor de tareas

Aplicación web para crear, organizar y consultar tareas, desarrollada con **HTML5, CSS3 y JavaScript puro**, sin frameworks ni dependencias externas. Utiliza **Web Components**, **Shadow DOM** y **localStorage** para separar la interfaz, la lógica de negocio y la persistencia de los datos.

Además de administrar tareas locales, permite consultar e importar tareas desde la API pública [JSONPlaceholder](https://jsonplaceholder.typicode.com/todos).

> Proyecto académico desarrollado en equipo por **Michael Daniel Martinez Buenahora** y **Sara Yuliana Borda Ochoa**.

---

## Tabla de contenido

1. [Tecnologías](#tecnologías)
2. [Funcionalidades](#funcionalidades)
3. [Cómo usar la aplicación](#cómo-usar-la-aplicación)
4. [Instalación y ejecución](#instalación-y-ejecución)
5. [Estructura del proyecto](#estructura-del-proyecto)
6. [Arquitectura y lógica implementada](#arquitectura-y-lógica-implementada)
7. [Modelo de datos y persistencia](#modelo-de-datos-y-persistencia)
8. [Integración con la API](#integración-con-la-api)
9. [Experiencia de usuario y accesibilidad](#experiencia-de-usuario-y-accesibilidad)
10. [Diseño responsivo](#diseño-responsivo)
11. [Wireframes](#wireframes)
12. [Pruebas funcionales](#pruebas-funcionales)
13. [Consideraciones y limitaciones](#consideraciones-y-limitaciones)
14. [Trabajo en equipo](#trabajo-en-equipo)

---

## Tecnologías

| Tecnología | Uso en el proyecto |
|---|---|
| **HTML5** | Estructura principal y elementos semánticos de la aplicación. |
| **CSS3** | Estilos, variables de diseño, Flexbox, Grid y media queries para adaptar la interfaz. |
| **JavaScript (ES Modules)** | Lógica de la aplicación organizada en módulos. |
| **Web Components** | Componentes personalizados para la aplicación, la lista, cada tarea y los modales. |
| **Shadow DOM** | Encapsulamiento del HTML y CSS de cada componente. |
| **Fetch API** | Consulta de tareas en JSONPlaceholder. |
| **localStorage** | Almacenamiento local de las tareas en formato JSON. |
| **Git y GitHub** | Control de versiones y trabajo colaborativo mediante ramas e integración. |

No se utilizan frameworks, gestores de paquetes ni procesos de compilación.

---

## Funcionalidades

| Funcionalidad | Descripción |
|---|---|
| **Listado de tareas** | Muestra las tareas con título, fecha de registro, estado, origen y acciones disponibles. |
| **Crear tareas** | Abre un formulario modal para registrar una tarea local. El título es obligatorio y el estado inicial puede seleccionarse. |
| **Editar tareas** | Permite modificar el título y el estado de las tareas locales. La fecha de registro se conserva. |
| **Completar tareas** | Permite marcar una tarea local como completada o pendiente desde su casilla. |
| **Marcar todas** | Completa las tareas locales que aún están pendientes. Las tareas importadas no se modifican. |
| **Eliminar tareas** | Permite eliminar una tarea individual con confirmación. |
| **Vaciar lista** | Elimina todas las tareas, tanto locales como importadas, después de solicitar confirmación. |
| **Búsqueda** | Busca tareas por título e ignora mayúsculas y tildes. |
| **Filtro por estado** | Permite mostrar todas las tareas, solo las pendientes o solo las completadas. |
| **Progreso** | Presenta el total de tareas completadas y su porcentaje respecto al total. |
| **Importación desde API** | Consulta las tareas de JSONPlaceholder y permite seleccionar una o varias para agregarlas a la lista. |
| **Control de duplicados** | Las tareas que ya fueron importadas se identifican y no pueden seleccionarse nuevamente. |
| **Tareas importadas de solo lectura** | No se pueden editar ni cambiar de estado; sí se pueden eliminar. |
| **Persistencia** | Las tareas permanecen guardadas al recargar la página o volver a abrirla en el mismo navegador. |
| **Estados y mensajes** | La interfaz informa cuando la lista está vacía, una búsqueda no obtiene resultados o la consulta a la API falla. |

---

## Cómo usar la aplicación

1. **Crear una tarea:** selecciona **Nueva tarea**, escribe el título y, si corresponde, marca la opción para crearla como completada. Después pulsa **Guardar tarea**.
2. **Editar una tarea local:** utiliza el botón **Editar**, modifica el título o el estado y guarda los cambios. La fecha de registro original se conserva.
3. **Completar o reabrir una tarea:** utiliza la casilla que aparece junto al título. Esta acción está disponible para tareas locales.
4. **Eliminar una tarea:** pulsa **Eliminar** y confirma la operación.
5. **Importar tareas:** pulsa **Importar**, espera a que se cargue el banco de tareas, busca o selecciona las tareas que necesites y pulsa **Importar seleccionadas**.
6. **Seleccionar todas las disponibles:** utiliza la casilla de selección general del modal. La selección se aplica a las tareas visibles que todavía no se han importado.
7. **Buscar y filtrar:** escribe en el campo de búsqueda o selecciona **Todas**, **Pendientes** o **Completadas** en el filtro.
8. **Marcar todas:** utiliza esta acción para completar las tareas locales pendientes.
9. **Vaciar lista:** pulsa **Vaciar lista** y confirma. Se eliminan las tareas locales y las importadas.

### Reglas para las tareas importadas

Las tareas importadas conservan el estado recibido desde la API. No se pueden editar ni cambiar entre pendientes y completadas. La interfaz deshabilita esas acciones y `taskService.js` también valida esta regla. La eliminación sí está permitida.

---

## Instalación y ejecución

La aplicación es estática y utiliza módulos de JavaScript (`import` / `export`). Por ello, debe ejecutarse desde un servidor local o web; abrir `index.html` directamente con doble clic (`file://`) puede impedir que el navegador cargue los módulos.

### Requisitos

- Un navegador actualizado, como Google Chrome, Microsoft Edge, Firefox o Safari.
- Visual Studio Code y la extensión Live Server, o un servidor local equivalente.
- Conexión a internet para consultar e importar tareas desde JSONPlaceholder. Las tareas que ya están guardadas y las funciones locales no necesitan consultar la API.

### Opción 1: Visual Studio Code y Live Server

1. Clona el repositorio o descarga el proyecto.
2. Abre la carpeta del proyecto en Visual Studio Code.
3. Instala la extensión **Live Server**, si aún no está instalada.
4. Haz clic derecho sobre `index.html` y selecciona **Open with Live Server**.
5. El navegador abrirá la aplicación en una dirección local.

### Opción 2: servidor de Python

Desde la terminal, ubicado en la carpeta del proyecto, ejecuta:

```bash
python -m http.server 8000
```

Después abre `http://localhost:8000` en el navegador.

### Opción 3: servidor de Node.js

Si tienes Node.js instalado, puedes ejecutar:

```bash
npx serve .
```

Abre la dirección local que indique la terminal.

### Despliegue

Al ser una aplicación estática, puede publicarse en un servicio de alojamiento de sitios estáticos, por ejemplo GitHub Pages, Netlify o Vercel. No requiere comandos de compilación ni instalar dependencias. Para GitHub Pages, configura la publicación desde la rama y carpeta donde se encuentre `index.html`.

---

## Estructura del proyecto

```text
Proyecto_Javascript/
├── index.html
├── README.md
├── css/
│   ├── global.css
│   ├── task-app.css
│   ├── task-list.css
│   ├── task-item.css
│   ├── task-form-modal.css
│   └── task-import-modal.css
├── js/
│   ├── app.js
│   ├── shared/
│   │   ├── constants.js
│   │   └── utils.js
│   ├── services/
│   │   ├── taskService.js
│   │   ├── filterService.js
│   │   ├── apiService.js
│   │   └── importService.js
│   └── components/
│       ├── task-app.js
│       ├── task-list.js
│       ├── task-item.js
│       ├── task-form-modal.js
│       └── task-import-modal.js
└── wireframes/
    ├── escritorio.png
    ├── modal-formulario.png
    ├── modal-importacion.png
    ├── movil.png
    ├── movil-sin-tareas.png
    ├── movil-sin-coincidencias.png
    ├── sin-coincidencias.png
    ├── tareas.png
    └── evidencia_dibujo/
        ├── escritorio.png
        └── model.png
```

### Responsabilidad de los archivos principales

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Página de entrada. Carga los estilos globales y el módulo principal. |
| `js/app.js` | Controlador de la aplicación. Registra los componentes, escucha eventos y coordina los servicios. |
| `js/shared/constants.js` | Define la clave de almacenamiento, la URL de la API, los estados, los orígenes y los nombres de eventos. |
| `js/shared/utils.js` | Genera identificadores y crea objetos de tareas locales e importadas. |
| `js/services/taskService.js` | Administra el arreglo de tareas, las operaciones CRUD, la importación y la persistencia. |
| `js/services/filterService.js` | Filtra las tareas por estado y realiza la búsqueda por título. |
| `js/services/apiService.js` | Consulta la API de JSONPlaceholder y devuelve los datos o un mensaje de error. |
| `js/services/importService.js` | Convierte las tareas seleccionadas de la API al formato interno de la aplicación. |
| `js/components/task-app.js` | Construye la pantalla principal y expone métodos para actualizar la interfaz. |
| `js/components/task-list.js` | Muestra la lista, sus encabezados y los estados vacíos. |
| `js/components/task-item.js` | Representa una tarea y muestra las acciones permitidas según su origen. |
| `js/components/task-form-modal.js` | Contiene el formulario modal para crear o editar tareas locales. |
| `js/components/task-import-modal.js` | Muestra el banco de tareas de la API y permite seleccionar las que se importarán. |
| `css/` | Contiene los estilos generales y los estilos propios de cada componente. |
| `wireframes/` | Guarda los wireframes y las evidencias del diseño inicial. |

---

## Arquitectura y lógica implementada

### Separación de responsabilidades

La aplicación divide la interfaz y la gestión de datos. Los componentes visuales muestran información y emiten eventos personalizados; el controlador `app.js` recibe esos eventos y llama al servicio correspondiente.

```text
Componentes Web
      │
      │ CustomEvent
      ▼
    app.js  ───────────────► Servicios
      ▲                         │
      │                         ├── taskService.js
      │                         ├── filterService.js
      │                         ├── apiService.js
      │                         └── importService.js
      │                         │
      └──── actualización ◄─────┘
                 │
                 ▼
             Interfaz
```

`taskService.js` es el módulo encargado de modificar y guardar las tareas. Los componentes no acceden directamente a `localStorage` ni modifican el arreglo interno del servicio.

### Componentes web y Shadow DOM

El proyecto utiliza cinco componentes personalizados:

| Componente | Responsabilidad |
|---|---|
| `<task-app>` | Contenedor principal, controles, progreso y mensajes. |
| `<task-list>` | Lista de tareas y mensajes para listas vacías o búsquedas sin resultados. |
| `<task-item>` | Información y acciones de una tarea individual. |
| `<task-form-modal>` | Formulario para crear o editar tareas locales. |
| `<task-import-modal>` | Selección de tareas disponibles en la API. |

Cada componente extiende `HTMLElement`, crea su propio Shadow DOM con `attachShadow({ mode: 'open' })` y carga su hoja de estilos correspondiente. Esto permite encapsular la estructura y los estilos de los componentes.

### Comunicación mediante eventos

Los componentes emiten eventos `CustomEvent` con `bubbles: true` y `composed: true`, de modo que puedan atravesar el Shadow DOM y llegar al componente principal.

| Evento | Información enviada | Acción del controlador |
|---|---|---|
| `task:save` | `{ id, title, completed }` | Crea o actualiza una tarea local. |
| `task:edit` | `{ id }` | Abre el formulario vacío o con los datos de una tarea. |
| `task:toggle` | `{ id }` | Cambia el estado de una tarea local. |
| `task:delete` | `{ id }` | Elimina la tarea indicada. |
| `task:clear` | Sin datos adicionales | Solicita confirmación y vacía la lista. |
| `task:complete-all` | Sin datos adicionales | Completa las tareas locales pendientes. |
| `task:import` | `{ sourceIds: [...] }` | Busca, transforma e importa las tareas seleccionadas. |
| `task:filter` | `{ status }` | Actualiza el filtro de estado. |
| `task:search` | `{ query }` | Actualiza la búsqueda por título. |
| `task:api-retry` | Sin datos adicionales | Vuelve a consultar la API. |

### Servicios

**`taskService.js`** administra el estado de las tareas y ofrece las operaciones principales:

- `loadTasks()` y `getTasks()` para recuperar y consultar las tareas.
- `addTask()` y `updateTask()` para crear y editar tareas locales.
- `toggleTask()` para cambiar el estado de una tarea local.
- `deleteTask()` y `clearTasks()` para eliminar tareas.
- `completeAll()` para completar las tareas locales pendientes.
- `importTasks()` para incorporar las tareas previamente normalizadas y omitir duplicados.

Las operaciones que modifican los datos devuelven un resultado con la propiedad `ok`. Cuando una operación no se puede realizar, el resultado incluye un mensaje. Si no se puede guardar en `localStorage`, el servicio revierte el cambio en memoria.

**`filterService.js`** recibe la lista de tareas, el estado seleccionado y el texto de búsqueda. Devuelve una lista filtrada sin modificar los datos originales. La búsqueda por título ignora mayúsculas y tildes.

**`apiService.js`** consulta la dirección de JSONPlaceholder definida en `constants.js`, comprueba que la respuesta HTTP sea correcta y verifica que el resultado sea un arreglo.

**`importService.js`** convierte las tareas seleccionadas de la API al formato de la aplicación. El controlador coordina esta transformación con `taskService.js` para guardar las tareas.

---

## Modelo de datos y persistencia

Todas las tareas utilizan la misma estructura, independientemente de si fueron creadas por el usuario o importadas desde la API:

```js
{
    id: "task-<identificador-unico>",
    title: "Estudiar JavaScript",
    createdAt: "2026-11-09T18:00:00.000Z",
    completed: false,
    origin: "local",
    sourceId: null
}
```

| Propiedad | Descripción |
|---|---|
| `id` | Identificador interno generado por la aplicación mediante `crypto.randomUUID()` o un valor alternativo. |
| `title` | Título de la tarea. Se eliminan los espacios sobrantes al inicio y al final. |
| `createdAt` | Fecha y hora de registro en formato ISO. |
| `completed` | Indica si la tarea está completada (`true`) o pendiente (`false`). |
| `origin` | Identifica si la tarea es `local` o `api`. |
| `sourceId` | Identificador numérico original de JSONPlaceholder. Para las tareas locales su valor es `null`. |

### Persistencia en localStorage

- Las tareas se guardan como JSON bajo la clave `proyecto-tareas-v1`.
- Al iniciar, `loadTasks()` recupera y valida la información almacenada.
- Cada operación que modifica las tareas intenta guardar el nuevo arreglo.
- Si el almacenamiento falla, `taskService.js` revierte el cambio y devuelve un resultado de error.
- Los componentes no acceden directamente al almacenamiento; toda la persistencia se gestiona desde `taskService.js`.

El almacenamiento es local al navegador y al dispositivo. No existe una cuenta de usuario ni sincronización entre distintos dispositivos.

---

## Integración con la API

La aplicación consulta el endpoint público:

[`https://jsonplaceholder.typicode.com/todos`](https://jsonplaceholder.typicode.com/todos)

El proceso de importación funciona así:

1. Al iniciar la aplicación, `app.js` solicita las tareas mediante `getApiTasks()`.
2. El modal comunica si la consulta está cargando, terminó correctamente o presentó un error.
3. El usuario puede buscar dentro del banco y seleccionar una o varias tareas disponibles.
4. El modal emite `task:import` con los identificadores originales (`sourceIds`) seleccionados.
5. `app.js` localiza las tareas originales y llama a `mapSelectedApiTasks()`.
6. `importService.js` crea los objetos internos con un identificador propio, `origin: "api"` y el identificador original en `sourceId`.
7. `taskService.js` incorpora las tareas y omite las que ya existían para evitar duplicados.
8. La lista, el progreso y los identificadores importados se actualizan.

### Manejo de errores

Si la consulta no puede completarse, el modal muestra el mensaje recibido del servicio y ofrece el botón **Reintentar**. La aplicación sigue permitiendo trabajar con las tareas que ya están guardadas y crear nuevas tareas locales.

La consulta comprueba errores HTTP, errores de red o lectura de la respuesta y que el contenido recibido sea un arreglo. No implementa un tiempo máximo de espera personalizado.

---

## Experiencia de usuario y accesibilidad

- La interfaz muestra mensajes cuando no existen tareas o cuando una búsqueda no devuelve coincidencias.
- El formulario utiliza un elemento `<dialog>`, etiquetas asociadas a los campos y mensajes de validación para el título.
- El modal de importación utiliza `role="dialog"`, `aria-modal="true"` y `aria-labelledby`.
- El buscador y el filtro tienen etiquetas accesibles mediante `aria-label`.
- Los botones de acción de cada tarea incluyen nombres accesibles (`aria-label`) descriptivos.
- Los mensajes de operación se muestran en una región con `aria-live="polite"`.
- Los elementos interactivos cuentan con estilos de foco visible.
- Las acciones de eliminación y vaciado solicitan confirmación antes de ejecutarse.
- El modal de formulario enfoca el campo de título al abrirse y devuelve el foco al elemento que lo abrió al cerrarse. El modal de importación enfoca su buscador al abrirse y se puede cerrar con `Esc`, el botón de cerrar, cancelar o al pulsar fuera del cuadro.
- Los títulos de las tareas se insertan mediante `textContent` en los componentes, en lugar de interpretarse como HTML.

---

## Diseño responsivo

La interfaz se adapta al ancho disponible mediante media queries:

| Ancho de pantalla | Adaptación |
|---|---|
| **Escritorio (más de 900 px)** | Las tareas se presentan en formato de tabla con columnas para título, fecha, estado, origen y acciones. |
| **Tablet y móvil (hasta 900 px)** | La lista cambia a tarjetas. Las acciones se muestran mediante botones de icono y los controles principales se reorganizan. |
| **Teléfonos pequeños (hasta 380 px)** | Se ajustan los espacios y la distribución de los controles para evitar que se compriman. |
| **Modal de formulario (hasta 480 px)** | Los botones del formulario se apilan verticalmente. |
| **Modal de importación (hasta 600 px)** | Se reducen los espacios internos y los botones se reorganizan para pantallas estrechas. |

---

## Wireframes

Los wireframes y las evidencias de los bocetos se encuentran en la carpeta [`wireframes/`](wireframes/).

| Vista | Archivo |
|---|---|
| Vista principal de escritorio | [`escritorio.png`](wireframes/escritorio.png) |
| Modal para crear y editar | [`modal-formulario.png`](wireframes/modal-formulario.png) |
| Modal de importación | [`modal-importacion.png`](wireframes/modal-importacion.png) |
| Vista móvil | [`movil.png`](wireframes/movil.png) |
| Móvil sin tareas | [`movil-sin-tareas.png`](wireframes/movil-sin-tareas.png) |
| Móvil sin coincidencias | [`movil-sin-coincidencias.png`](wireframes/movil-sin-coincidencias.png) |
| Escritorio sin coincidencias | [`sin-coincidencias.png`](wireframes/sin-coincidencias.png) |
| Lista con tareas | [`tareas.png`](wireframes/tareas.png) |

La carpeta `wireframes/evidencia_dibujo/` conserva las imágenes de los bocetos iniciales.

---

## Pruebas funcionales

Durante la revisión de la aplicación se verificaron manualmente los siguientes comportamientos:

| Prueba | Comportamiento esperado |
|---|---|
| Crear una tarea local | Se agrega a la lista y queda almacenada. |
| Editar una tarea local | Se actualiza el título o el estado y se conserva la fecha de registro. |
| Completar y reabrir una tarea | La casilla y la etiqueta de estado reflejan el cambio. |
| Buscar y filtrar | La lista muestra las tareas que coinciden con el texto y el estado seleccionados. |
| Marcar todas | Se completan las tareas locales pendientes, sin modificar las importadas. |
| Eliminar una tarea | Solicita confirmación y elimina únicamente la tarea seleccionada. |
| Vaciar la lista | Solicita confirmación y elimina las tareas locales e importadas. |
| Importar varias tareas | Las tareas seleccionadas se agregan con origen API. |
| Importar una tarea repetida | No se duplica y se identifica como ya importada en el modal. |
| Modificar una tarea importada | La edición y el cambio de estado no están disponibles. |
| Recargar la página | Las tareas guardadas se recuperan desde `localStorage`. |
| Error al consultar la API | Se informa el problema y se ofrece la opción de reintentar. |
| Diseño responsivo | La presentación cambia entre tabla de escritorio y tarjetas en tablet y móvil. |

---

## Consideraciones y limitaciones

- **Solo almacenamiento local:** las tareas se conservan en el navegador donde se creó la información; no hay sincronización en la nube.
- **Importación como copia:** una tarea importada no se sincroniza posteriormente con JSONPlaceholder. Si los datos originales cambian, la copia guardada no se actualiza automáticamente.
- **Conexión para importar:** se necesita internet para consultar el banco de tareas. Las funciones locales siguen disponibles con las tareas previamente guardadas.
- **Tareas importadas de solo lectura:** no pueden editarse ni cambiar de estado, aunque sí eliminarse.
- **Sin backend:** la aplicación no utiliza servidor propio, base de datos ni autenticación.

---

## Trabajo en equipo

El desarrollo se distribuyó en dos áreas y se integró utilizando Git y ramas de trabajo.

| Integrante | Área principal | Archivos principales |
|---|---|---|
| **Sara Yuliana Borda Ochoa** | Gestión de tareas y listado | `taskService.js`, `filterService.js`, `task-list.js`, `task-item.js`, `task-form-modal.js` y sus estilos. |
| **Michael Daniel Martinez Buenahora** | API e integración de la aplicación | `apiService.js`, `importService.js`, `task-app.js`, `task-import-modal.js`, `app.js`, `index.html`, `global.css` y sus estilos. |

Las funciones compartidas y los eventos se coordinaron para mantener un mismo formato de tarea y una comunicación consistente entre componentes y servicios.

---

## Autores

- **Michael Daniel Martinez Buenahora**
- **Sara Yuliana Borda Ochoa**
