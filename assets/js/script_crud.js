
//  Lee y obtiene todas las preguntas del servidor (usando el script listar.php).
// Cuando tiene los datos mira que sean correctos y luego llama renderizador para que los muestre en forma de lista.
async function listarDatos() {
    try {
        const response = await fetch("/proyecto1/bd/crud/listar.php");

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (!data.preguntes || !Array.isArray(data.preguntes)) {
            throw new Error("La estructura de datos recibida no es la esperada.");
        }

        renderizador(data.preguntes);

    } catch (error) {
        console.error("Error al listar datos:", error);
    }
}

// Elimina una pregunta específica con eliminar.php, cogiendo la id de la prergunta 
// y enviandola para que sepa que pregunta queremos eliminar
async function eliminarPreg(id) {
    const response = await fetch("/proyecto1/bd/crud/eliminar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: id
        })
    });

    if (response.ok) {
        listarDatos();
    }
}

// Función para actualizar la pregunta que queramos con un prompt que te aparece para que ingreses la pregunta o la modificación.
// Si se ha modificado algo manda la nueva pregunta y la id de esa pregunta para que actualizar.php se haga cargo y finalmente 
// si todo sale bien llama a listar datos de nuevo para que se recarge y coja bien la prergunta actualizada
async function modificarPreg(id) {
    const nuevaPregunta = prompt("Ingrese la nueva pregunta:");
    if (!nuevaPregunta) return;

    const response = await fetch("/proyecto1/bd/crud/actualizar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nuevaPregunta: nuevaPregunta,
            id: id
        })
    });

    if (response.ok) {
        listarDatos();
    } else {
        console.error("Error al actualizar");
    }
}


// Esta función lo que hace es mostrar en pantalla todo, tanto las preguntas, como las imagenes, sus respuestas, botones, etc.
// Cada pregunta esta dentro de el div preguntaEl y es el que tiene los botones e inputs que se encargad de llamar a las funciones
// y que hagan su trabajo.
function renderizador(preguntes) {
    const contenedor = document.getElementById("lista");
    contenedor.innerHTML = "";

    if (!preguntes || preguntes.length === 0) {
        contenedor.innerHTML = "<p>No hay preguntas para mostrar.</p>";
        return;
    }

    preguntes.forEach(p => {
        const preguntaEl = document.createElement("div");
        const crearFoto = document.createElement("img");
        preguntaEl.classList.add("pregunta");
        preguntaEl.innerHTML = `<h3>${p.pregunta}</h3>`;
        
        const cacheBuster = `?v=${new Date().getTime()}`;
        if (p.imatge) {
             crearFoto.src = p.imatge + cacheBuster; 
        }

        const listaRespuestas = document.createElement("ul");
        const eliminabtn = document.createElement("button");
        const modificador = document.createElement("button");
        
        if (p.respostes && Array.isArray(p.respostes)) {
            p.respostes.forEach(r => {
                const li = document.createElement("li");
                li.textContent = r.resposta + (r.correcta ? " ✅" : " ❌");
                listaRespuestas.appendChild(li);
            });
        } else {
            listaRespuestas.innerHTML = "<li>No hay respuestas disponibles</li>";
        }
        
        eliminabtn.innerHTML = "Eliminar pregunta";
        eliminabtn.setAttribute('onclick', `eliminarPreg(${p.id})`);
        modificador.innerHTML = "Modificar";
        modificador.setAttribute('onclick', `modificarPreg(${p.id})`);
        
        preguntaEl.appendChild(eliminabtn);
        preguntaEl.appendChild(modificador);
        preguntaEl.appendChild(crearFoto); 
        preguntaEl.appendChild(listaRespuestas);
        contenedor.appendChild(preguntaEl);
    });
}

// Aquí inserta la nueva prergunta que le hemos dado desde los inputs, mandando la pregunta, la imagen y las respuestas.
// Para luego de que insertar.php haga lo suyo y vuelva a llamar a listar datos para que vuelva a tener todos los datos y los liste de nuevo.
async function agregarPregunta(pregunta, respuestas, imagen) {
    try {
        const response = await fetch("/proyecto1/bd/crud/insertar.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                pregunta: pregunta,
                imagen: imagen || null, 
                respuestas: respuestas
            })
        });

        if (response.ok) {
            listarDatos();
        }

    } catch (error) {
        console.error("Error al agregar pregunta:", error);
    }
}

// Esto se encarga de de que al cargar la página se cargue todo lo necesario como listar datos por ejemplo.
// A parte de eso se encarga con el Event Listener de coger los datos tanto de las respuestas, como de la pregunta y la imagen cuando se clique al boton,
// la cual de esta última se encarga de hacer que la imagen este en un formato que pueda luego enviar para después llamar a agregar pregunta.
document.addEventListener("DOMContentLoaded", () => {
    listarDatos();

    document.getElementById("btnAgregar").addEventListener("click", () => {
        const pregunta = document.getElementById("inputPregunta").value;
        const respuestas = [
            { valor: document.getElementById("inputResp1").value, esCorrecta: true },
            { valor: document.getElementById("inputResp2").value, esCorrecta: false },
            { valor: document.getElementById("inputResp3").value, esCorrecta: false },
            { valor: document.getElementById("inputResp4").value, esCorrecta: false }
        ];

        let file = document.querySelector('input[type=file]')['files'][0];
        
        if (!file) {
            agregarPregunta(pregunta, respuestas, null);
            return;
        }

        let reader = new FileReader();

        reader.onload = function () {
            const imagen = reader.result;
            agregarPregunta(pregunta, respuestas, imagen);
        }

        reader.readAsDataURL(file);
    });
});