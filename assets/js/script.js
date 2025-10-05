// Variables globales para poder tomarlas desde cualquier funcion ya que más de una función una alguna de estas variables.
let i = 0;
let datosDelJuego = null;
var totalTime = 10;
let countdownInterval = null;
let usuario = '';
let estatDeLaPartida = {
    respostesUsuari: []
};
const STORAGE_KEY = 'nomUsuariTrivia';

// Función de principal 

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

// Función que muestra el formulario que no solo hace eso si no que esconde otros divs para que no los muestre si el usuario acaba de poner su nombre.
function mostrarFormulari(contenidor) {
    const cosFinestra = document.getElementById('cuerpo-ventana');
    if (cosFinestra) {
        cosFinestra.style.display = 'none';
    }
    document.getElementById('juego').innerHTML = '';
    document.getElementById('puntos').innerHTML = '';

    // El formulario como tal en html:
    contenidor.innerHTML = `
        <form id="formUsuari" class="formulario-usuario">
            <label for="inputUsuario">Introdueix el teu nom:</label>
            <input type="text" id="inputUsuario" name="nombre" required>
            <input type="submit" id="btnGuardarNombre" value="Guardar i Jugar">
        </form>
    `;

    //El addEventListener que cuando le den a submit lo que hace es coger el id de 'inputUsuario' 
    // para guardar el valor que se le ha puesto y si tiene algo lo marca como localStorage y 
    // lo guarda también en una variable guardada usuario (variable global) para mostrar el nombre más tarde si queremos.
    // Luego llama a la siguiente funcion, pasandole el div del form y el nom.
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


// En la siguiente funcion es la que simplemente muestra un mensaje de bienvenida para el usuario,
//  con su nombre que persiste a lo largo de la partida, he usado el antiguo contenedorrr donde estaba 
// el form para guardar esto, por eso lo hemos pasado por parametros.
// Esto a parte, también gestiona el eliiminar al usuario de la localStorage con el boton de "btnEsborrarNom" 
// cogiendo su id y añadiendo un addEventListener para cuando se le clicke que borre el localStorage que tenia, a demás, 
// por motivos esteticos le he agrregado que oculte de nuevo todo una vez clickes al botón, pero solo por estetica y para dar una forma de detener el juego.
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

// Esta función simplemente se encarga de mostrar el contenido de el div de 'cuerpo-ventana'
//  una vez el usuario ya haya puesto su nombre.

function prepararJoc() {
    const inicio = document.getElementById('cuerpo-ventana');
    if (inicio) {
        inicio.style.display = 'block';
    }

    empezarJuego();
}

// Funciones para el juego como tal:


// Función que gestiona el clic usando la delegación de eventos.
function seleccionarBotonDelegado(event) {
    // Busca el elemento más cercano que tenga la clase 'btn-respuesta',
    // Para asegurarnos que, incluso si el usuario clica en el texto, obtengamos el elemento <button> padre.
    const elementoBoton = event.target.closest('.btn-respuesta');

    // Para compruebar si el elemento clicado por el usuario es realmente un botón de respuesta y no es el div u otra cosa.
    if (!elementoBoton) {
        return;
    }

    // Extrae los datos necesarios (el índice de la pregunta y el ID de la respuesta)
    // El .dataset se usa para leer los atributos data-* del botón. Que son datos personalizados de la pagina sin tener que usar variables.
    const numPregunta = parseInt(elementoBoton.dataset.preguntaIndice);
    const numRespuesta = parseInt(elementoBoton.dataset.respuestaId);

    // Llamo a la función de lógica para manejar la selección visual y de estado.
    seleccionarBoton(elementoBoton, numPregunta, numRespuesta);
}


// Función para manejar la selección de una respuesta al usuario hacer click en uno de los botones de opción en el juego.
function seleccionarBoton(elementoBoton, numPregunta, numRespuesta) {
    // Llamo a marcarRespuesta que me guarda la respuesta soleccionada ya que es la que necesito aquí.
    marcarRespuesta(numPregunta, numRespuesta);

    const contenedorRespuestas = elementoBoton.parentElement.parentElement;
    const botones = contenedorRespuestas.querySelectorAll('.opcion-pregunta button');

    // Itera sobre los botones para remover la clase 'seleccionado' (deselecciona los demás).
    botones.forEach(btn => {
        btn.classList.remove('seleccionado');
    });

    // Le añade la clase 'seleccionado' al botón que ha sido clickeado.
    elementoBoton.classList.add('seleccionado');
}

// Esta es una función simple para guardar la respuesta del usuario en el array 'respostesUsuari' del estado de la partida 
// donde le asingno el id de la respuesta a la posición en donde se encuentra la pregunta en el array y me guarda la respuesta que ha seleccionado el usuario.
function marcarRespuesta(numPregunta, numRespuesta) {
    estatDeLaPartida.respostesUsuari[numPregunta] = numRespuesta;
}

// Función que gestiona el botón de "Play" para iniciar el juego.
function empezarJuego() {

    // Aquí asigno a dos variables el div de puntos y el boton de Play
    let playbtn = document.getElementById("btnPlay");
    let puntos = document.getElementById("puntos");

    // Uso este If para asegurarme que el div de puntos quede oculto, más para cuando el usuario acabe de jugar 
    // el div se oculte al mostrar el div que corresponde
    if (puntos) {
        puntos.style.display = 'none';
    };

    // Aquí comprueba si el botón existe y si ya se le ha añadido el listener para evitar que el listener 
    // se llame más de 1 vez y pueda haber problemas al lanzar más de 1 peticion al server.
    if (playbtn && !playbtn.hasAttribute('data-listener-added')) {
        // Añade un listener al botón de Play para cuando un usuario clique.
        playbtn.addEventListener("click", function () {
            // Si clequean procede a realizar una petición Fetch al servidor para obtener las preguntas  con un control de errores por si falla.
            fetch("/proyecto1/php/getPreguntas.php")
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error HTTP: ${response.status}`);
                    }
                    return response.json(); // Me parsea la respuesta a formato JSON.
                })
                .then(data => {
                    datosDelJuego = data; // Guarda los datos de las preguntas en la variable global.
                    jueguito(datosDelJuego); // Comienza a mostrar la primera pregunta del juego al llamar a jueguito.
                })
                .catch(error => {
                    console.error("Hubo un error al cargar las preguntas:", error);
                });
        });
        playbtn.setAttribute('data-listener-added', 'true');
    }
}

// Función principal que renderiza la pregunta actual y sus opciones.
function jueguito(datosDelJuego) {

    // Divs donde cojo las id de los divs, el que va a salir el juego y los otros tres y a parte hago un string donde se va a contruir el HTML.
    let juego = document.getElementById("juego");
    let puntos = document.getElementById("puntos");
    let inicio = document.getElementById("cuerpo-ventana");
    let htmlString = "";

    // Me oculta el div de inicio y el de puntos, y muestra el solo el de juego.
    if (inicio) {
        inicio.style.display = 'none';
    };
    if (puntos) {
        puntos.style.display = 'none';
    };
    if (juego) {
        juego.style.display = 'block';
    };

    // Comprueba si se han mostrado todas las preguntas.
    if (i >= datosDelJuego.preguntes.length) {
        if (countdownInterval) {
            clearInterval(countdownInterval); // Detiene el temporizador si ya no hay más preguntas.
        }
        enviarRespuestas(); // Llama a la función para enviar las respuestas y finalizar.
        return;
    }

    // El HTML para la pregunta actual, el contador y la imagen (usando como índice 'i' 
    // y tomando la info de la variable de datosDelJuego para mostrar la imagen y la pregunta).
    htmlString += `<h3>${datosDelJuego.preguntes[i].pregunta}</h3>`;
    htmlString += `<div id="contador-pregunta">Tiempo restante: <span id="countdown">10</span>s</div>`;
    htmlString += `<img src="${datosDelJuego.preguntes[i].imatge}" alt="" class="imgPreg">`;
    htmlString += `<div class="contenedor-respuestas" id="contenedor-respuestas-pregunta">`;

    // Un for para que me muestre todas las opciones que el usuario tiene, dentro de este esta el html que las muestra
    for (let j = 0; j < datosDelJuego.preguntes[i].respostes.length; j++) {
        htmlString += `
                        <div class="opcion-pregunta"> 
                            <button class="btn-respuesta" data-respuesta-id="${datosDelJuego.preguntes[i].respostes[j].id}" data-pregunta-indice="${i}"> 
                                ${datosDelJuego.preguntes[i].respostes[j].resposta} 
                            </button>
                        </div>
                    `;
    }

    htmlString += `</div>`;

    // Botón para pasar a la siguiente pregunta.
    htmlString += `<button id="btnSiguientePregunta" class="btnNext"> 
                        <img src="assets/img/btn/btn-pa.png" alt="Botón Play">
                        <span class="text-btn1 parpadea-btn">Següent pregunta</span> </button>`;

    // Inserta el HTML generado en el div de juego.
    juego.innerHTML = htmlString;

    // Llama a otra función que se encarga de iniciar el contador
    iniciarContador();
    
    // Aquí tengo dos EventListeners y mientras que en uno, el de opciones (contenedorRespuestas) llamo al padre 
    // para que me gestione los botones en el otro llamo directamente para la funcion que quiero que haga
    const contenedorRespuestas = document.getElementById('contenedor-respuestas-pregunta');
    if (contenedorRespuestas) {
        contenedorRespuestas.addEventListener('click', seleccionarBotonDelegado);
    }
    
    const btnNext = document.getElementById('btnSiguientePregunta');
    if (btnNext) {
        btnNext.addEventListener('click', siguientePregunta);
    }


    // Lógica para restablecer la selección si el usuario ha vuelto a la pregunta anterior.
    const respuestaSeleccionada = estatDeLaPartida.respostesUsuari[i]; // Obtiene la respuesta guardada para esta pregunta.
    if (respuestaSeleccionada !== undefined) {
        // Busca el botón correspondiente a la respuesta guardada y le añade la clase 'seleccionado'.
        const botonSeleccionado = juego.querySelector(`[data-pregunta-indice="${i}"][data-respuesta-id="${respuestaSeleccionada}"]`);
        if (botonSeleccionado) {
            botonSeleccionado.classList.add('seleccionado');
        }
    }
}

// Función que llama cuando el tiempo se agota, haciendo que pase a la siguiente pregunta.
function tiempoAcabado() {
    i++;
    jueguito(datosDelJuego);
}

// Función que comprueba si el usuario a seleccionado una respuesta, si no no podra continuar 
// y que limpia el contador para la siguiente pregunta si no ha llegado a 0, a parte también se encarga de llevar al usuario a la sguiente pregunta de el Trivia
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

// Función que se encarga de enviar las respuestas a Finalitza.php, 
// el que se encarga de mandar luego la puntación, luego de enviarla también recibe la puntuación en 
// un JSON y se encarga de enviarla a finalizarTrivia.
function enviarRespuestas() {
    fetch("/proyecto1/php/finalitza.php", {
        method: "POST",
        body: JSON.stringify({
            respuestas: estatDeLaPartida.respostesUsuari,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then(response => response.json())
        .then(data => { finalizarTrivia(data) });
}


// Función que muestra la puntuación final del usuario.
function finalizarTrivia(datosDelJuego) {

    // Asigno los divs por elemento una vez más.
    let juego = document.getElementById("juego");
    let inicio = document.getElementById("cuerpo-ventana");
    let puntos = document.getElementById("puntos");

    // Oculto los divs de juego e inicio, y muestro el de puntos.
    if (inicio) {
        inicio.style.display = 'none';
    };
    if (juego) {
        juego.style.display = 'none';
    };
    if (puntos) {
        puntos.style.display = 'block';
    };

    let htmlFinal = "";

    // Se hace eñ HTML con el comentario al usuario y su puntuación. Usando la variable global de usuario que contiene su nombre de usuario.
    htmlFinal += `
        <div class="finalitza"> 
            <h2> Gracias por finalizar el juego, ${usuario}!</h2>
             <h5> Esta es tu puntuación: </h5>
             <p> ${datosDelJuego.puntuacio}</p>
        </div>`

    // Botón que llama a otra función que es la que se encarga de volve a empezar el juego con el event Listener que le sigue.
    htmlFinal += `<button id="btnVolverEmpezar" class="btnNext"> <img src="assets/img/btn/btn-pa.png" alt="Botón Play">
                 <span class="text-btn1 parpadea-btn">vuelve a empezar</span> </button>`;

    
    const btnReinicio = document.getElementById('btnVolverEmpezar');
    if (btnReinicio) {
        btnReinicio.addEventListener('click', volverEmpezar);
    }

    puntos.innerHTML = htmlFinal;
}

// Función para reiniciar la partida y cargar un nuevo set de preguntas una vez más.
function volverEmpezar() {

    // Hago un fetch a GetPreguntas para conseguir una tanda nueva de preguntas y directamente se las paso a la función de jueguito, 
    // limpiando las respuestas y el indice de preguntas de la partida anterior.
    fetch("/proyecto1/php/getPreguntas.php")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} `);
            }
            return response.json()
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

// Función que inicializa y se encarga de hacer la cuenta regresiva para cada pregunta, en este caso si es que el usuario se queda sin tiempo, 
// encargandose de reiniciar el temporizador cada vez para que no haya problemas y no se vaya sobreponiendo.
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

// Función para actualizar el texto del contador de tiempo y cambiar su color si el tiempo es crítico en la interfaz. 
// Esta es una función por estetica y para que se muestre bien en la pantalla al usuario.
function actualizarRelojPregunta() {
    const relojElemento = document.getElementById("countdown");

    // Aquí lo que hace es ir cambiando el contenido del tiempo por el TotalTime que va teniendo, el cual va descendiendo,
    //  como se ve en la funcion anterior, mientras el siguiente if simplemente le agrega color depende en el numero que este, cambiando el style.color de el elemento.
    if (relojElemento) {
        relojElemento.textContent = totalTime;

        if (totalTime <= 3) {
            relojElemento.style.color = 'red';
        } else {
            relojElemento.style.color = 'white';
        }
    }
}

// Función que obtiene y muestra la fecha y hora actuales.
function actualizarFechaYHora() {

    // Coge la fecha de hoy:
    const ahora = new Date();

    // Aquí le digo como quiero que lo muestre
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

    // Le dice el formato que quiere y el estilo que quiere que coja, pues no seria lo mismo poner es-ES que en-US por ejemplo.
    const fecha = ahora.toLocaleDateString('es-ES', opcionesFecha);
    const hora = ahora.toLocaleTimeString('es-ES', opcionesHora);

    // En lo siguiente simplemente busco el elemento donde quiero que aparezca y se lo agrego.
    const elementoFecha = document.getElementById("fecha_hoy");
    const elementoHora = document.getElementById("reloj");
    if (elementoFecha) {
        elementoFecha.textContent = fecha;
    }

    if (elementoHora) {
        elementoHora.textContent = hora;
    }
}

// EventListener que se activa cuando el DOM ('la página') ha terminado de cargarse.
document.addEventListener('DOMContentLoaded', (event) => {
    // Llama a la primera funcion que se ha de cargar.
    gestionarUsuario();

    // Llama la funcion y la configura para que se vaya actualizando cada un segundo
    actualizarFechaYHora();
    setInterval(actualizarFechaYHora, 1000);
});