let i = 0;
let datosDelJuego = null;
var totalTime = 10;
let countdownInterval = null;
let usuario = '';
let estatDeLaPartida = {
    respostesUsuari: []
};
const STORAGE_KEY = 'nomUsuariTrivia';

// Funcions de persistència

function gestionarUsuario() {
    const divNombre = document.getElementById("nombre");
    const nomGuardat = localStorage.getItem(STORAGE_KEY);

    if (nomGuardat) {
        usuario = nomGuardat;
        mostrarBenvinguda(divNombre, nomGuardat);
    } else {
        mostrarFormulari(divNombre);
    }
}

function mostrarFormulari(contenidor) {
    const cosFinestra = document.getElementById('cuerpo-ventana');
    if (cosFinestra) {
        cosFinestra.style.display = 'none';
    }
    document.getElementById('juego').innerHTML = '';
    document.getElementById('puntos').innerHTML = '';

    contenidor.innerHTML = `
        <form id="formUsuari" class="formulario-usuario">
            <label for="inputUsuario">Introdueix el teu nom:</label>
            <input type="text" id="inputUsuario" name="nombre" required>
            <input type="submit" id="btnGuardarNombre" value="Guardar i Jugar">
        </form>
    `;

    document.getElementById('formUsuari').addEventListener('submit', function (e) {
        e.preventDefault();

        const nom = document.getElementById('inputUsuario').value.trim();
        if (nom) {
            localStorage.setItem(STORAGE_KEY, nom);
            usuario = nom;

            mostrarBenvinguda(contenidor, nom);


        }
    });
}

function mostrarBenvinguda(contenidor, nom) {
    contenidor.innerHTML = `
        <p class="salutacio-usuari">Hola, ${nom}!</p>
        <button id="btnEsborrarNom" class="control-usuario">Esborrar nom i reiniciar</button>
    `;

    document.getElementById('btnEsborrarNom').addEventListener('click', function () {
        localStorage.removeItem(STORAGE_KEY);
        usuario = '';
        clearInterval(countdownInterval);
        document.getElementById('juego').innerHTML = '';
        document.getElementById('puntos').innerHTML = '';

        const inicio = document.getElementById('cuerpo-ventana');
        if (inicio) {
            inicio.style.display = 'none';
        }

        mostrarFormulari(contenidor);
    });

    prepararJoc();
}

function prepararJoc() {
    const inicio = document.getElementById('cuerpo-ventana');
    if (inicio) {
        inicio.style.display = 'block';
    }

    empezarJuego();
}

// Funcions del joc

function seleccionarBoton(elementoBoton, numPregunta, numRespuesta) {
    marcarRespuesta(numPregunta, numRespuesta);

    const contenedorRespuestas = elementoBoton.parentElement.parentElement;
    const botones = contenedorRespuestas.querySelectorAll('.opcion-pregunta button');

    botones.forEach(btn => {
        btn.classList.remove('seleccionado');
    });

    elementoBoton.classList.add('seleccionado');
}

function marcarRespuesta(numPregunta, numRespuesta) {
    estatDeLaPartida.respostesUsuari[numPregunta] = numRespuesta;
}

function empezarJuego() {
    let playbtn = document.getElementById("btnPlay");
    let puntos = document.getElementById("puntos");
    if (puntos) {
        puntos.style.display = 'none';
    };
    if (playbtn && !playbtn.hasAttribute('data-listener-added')) {
        playbtn.addEventListener("click", function () {
            fetch("/proyecto1/php/getPreguntas.php")
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error HTTP: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    datosDelJuego = data;
                    jueguito(datosDelJuego);
                })
                .catch(error => {
                    console.error("Hubo un error al cargar las preguntas:", error);
                });
        });
        playbtn.setAttribute('data-listener-added', 'true');
    }
}

function jueguito(datosDelJuego) {
    let juego = document.getElementById("juego");
    let puntos = document.getElementById("puntos");
    let inicio = document.getElementById("cuerpo-ventana");
    const crearFoto = document.createElement("img");
    let htmlString = "";
    if (inicio) {
        inicio.style.display = 'none';
    };
    if(puntos){
        puntos.style.display = 'none';
    };
    if (juego) {
        juego.style.display = 'block'; 
    };
    if (i >= datosDelJuego.preguntes.length) {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        enviarRespuestas();
        return;
    }

    htmlString += `<h3>${datosDelJuego.preguntes[i].pregunta}</h3>`;
    htmlString += `<div id="contador-pregunta">Tiempo restante: <span id="countdown">10</span>s</div>`;
    htmlString += `<img src="${datosDelJuego.preguntes[i].imatge}" alt="" class="imgPreg">`;
    htmlString += `<div class="contenedor-respuestas">`;
    for (let j = 0; j < datosDelJuego.preguntes[i].respostes.length; j++) {
        htmlString += `
            <div class="opcion-pregunta"> 
                <button 
                    class="btn-respuesta" 
                    data-respuesta-id="${datosDelJuego.preguntes[i].respostes[j].id}"
                    data-pregunta-indice="${i}"
                    onclick='seleccionarBoton(this, ${i}, ${datosDelJuego.preguntes[i].respostes[j].id})'>
                    ${datosDelJuego.preguntes[i].respostes[j].resposta}
                </button>
            </div>
        `;
    }

    htmlString += `</div>`;
    htmlString += `<button onclick='siguientePregunta()' class="btnNext"> <img src="assets/img/btn/btn-pa.png" alt="Botón Play">
                      <span class="text-btn1 parpadea-btn">Següent pregunta</span> </button>`;

    juego.innerHTML = htmlString;
    iniciarContador();

    const respuestaSeleccionada = estatDeLaPartida.respostesUsuari[i];
    if (respuestaSeleccionada !== undefined) {
        const botonSeleccionado = juego.querySelector(`[data-pregunta-indice="${i}"][data-respuesta-id="${respuestaSeleccionada}"]`);
        if (botonSeleccionado) {
            botonSeleccionado.classList.add('seleccionado');
        }
    }
}

function tiempoAcabado() {
    i++;
    jueguito(datosDelJuego);
}

function siguientePregunta() {
    if (estatDeLaPartida.respostesUsuari[i] === undefined) {
        alert("Debes seleccionar una respuesta para continuar");
        return;
    }

    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    i++;
    jueguito(datosDelJuego);
}

function enviarRespuestas() {
    fetch("/proyecto1/php/finalitza.php", {
        method: "POST",
        body: JSON.stringify({
            respuestas: estatDeLaPartida.respostesUsuari,
            usuario: usuario // Pots enviar l'usuari aquí si el backend el necessita
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then(response => response.json())
        .then(data => { finalizarTrivia(data) });
}

function finalizarTrivia(datosDelJuego) {
    let juego = document.getElementById("juego");
    let inicio = document.getElementById("cuerpo-ventana");
    let puntos = document.getElementById("puntos");
    if (inicio) {
        inicio.style.display = 'none';
    };
    if(juego){
        juego.style.display = 'none';
    };
    if (puntos) {
        puntos.style.display = 'block'; 
    };
    
    let htmlFinal = "";

    htmlFinal += `
        <div class="finalitza"> 
            <h2> Gracias por finalizar el juego, ${usuario}!</h2>
            <h5> Esta es tu puntuación: </h5>
            <p> ${datosDelJuego.puntuacio}</p>
        </div>`

    htmlFinal += `<button onclick='volverEmpezar()' class="btnNext"> <img src="assets/img/btn/btn-pa.png" alt="Botón Play">
                      <span class="text-btn1 parpadea-btn">vuelve a empezar</span> </button>`;

    puntos.innerHTML = htmlFinal;
}

function volverEmpezar() {
    fetch("/proyecto1/php/getPreguntas.php")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} `);
            }
            return response.json();
        })
        .then(data => {
            i = 0;
            datosDelJuego = data;
            estatDeLaPartida.respostesUsuari = [];
            jueguito(datosDelJuego);
        })
        .catch(error => {
            console.error("Hubo un error al reiniciar el juego:", error);
        });
}

function iniciarContador() {
    clearInterval(countdownInterval);
    totalTime = 10;
    actualizarRelojPregunta();
    countdownInterval = setInterval(() => {
        totalTime--;
        actualizarRelojPregunta();
        if (totalTime <= 0) {
            clearInterval(countdownInterval);
            tiempoAcabado();
        }
    }, 1000);
}

function actualizarRelojPregunta() {
    const relojElemento = document.getElementById("countdown");
    if (relojElemento) {
        relojElemento.textContent = totalTime;

        if (totalTime <= 3) {
            relojElemento.style.color = 'red';
        } else {
            relojElemento.style.color = 'white';
        }
    }
}

function actualizarFechaYHora() {
    const ahora = new Date();

    const opcionesFecha = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };

    const opcionesHora = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };

    const fecha = ahora.toLocaleDateString('es-ES', opcionesFecha);
    const hora = ahora.toLocaleTimeString('es-ES', opcionesHora);

    const elementoFecha = document.getElementById("fecha_hoy");
    const elementoHora = document.getElementById("reloj");

    if (elementoFecha) {
        elementoFecha.textContent = fecha;
    }

    if (elementoHora) {
        elementoHora.textContent = hora;
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    gestionarUsuario();

    actualizarFechaYHora();
    setInterval(actualizarFechaYHora, 1000);
});