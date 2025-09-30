function empezarJuego() {
    let juego = document.getElementById("juego");
    let playbtn = document.getElementById("btnPlay");

    playbtn.addEventListener("click", function () {
        fetch("/triviaphp/Actividad4/php/getPreguntes.php")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {

                jueguito(data);
            })
            .catch(error => {

                console.error("Hubo un error al cargar las preguntas:", error);
            });

    });
} else {

    console.error("El elemento con el ID 'btnPlay' no fue encontrado.");
}


function jueguito(data) {
    let juego = document.getElementById("juego");
    let inicio = document.getElementById("cuerpo-ventana");
    let htmlString = "";

    for (let i = 0; i < NPREGUNTAS; i++) {
        htmlString += `<div class="pregunta oculta" id=${i}> `;

        htmlString += `<h3> ${data.preguntes[i].pregunta} </h3> `;
        htmlString += `<img src="img/${data.preguntes[i].imatge}" alt="imatge pregunta ${i + 1}"> <br>`;

        for (let j = 0; j < data.preguntes[i].respostes.length; j++) {
            htmlString += `<button id=${i}_${j} preg="${i}" resp="${j}" class="btn btn-primary"> 
                                ${data.preguntes[i].respostes[j].resposta} 
                            </button> `;
        }
        htmlString += `</div> `;
    }


    juego.innerHTML = htmlString;
    inicio.innerHTML = "";
}

empezarJuego();