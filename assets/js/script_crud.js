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