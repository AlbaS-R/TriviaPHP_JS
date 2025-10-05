<?php session_start();

//Coge el JSON que le ha pasado el JS con las preguntas y respuestas a traves de el fetch.
$data = file_get_contents("php://input");
$array = json_decode($data, true)['respuestas'];

// Variables del juego 
$_SESSION['puntuacio'] = 0;
$_SESSION['index'] = 0;

$opcionCorrecta = $pregunta['correcta'];
$puntuacionFinal = 0;

$preguntaAct = 0;

// Array para que vaya por las preguntas que ha contestado el usuario previamente 
// y se queda con las preguntas donde la solucion coincida con lo que ha dado el usuario.
foreach ($array as $i) {

    $esCorrecte = false;
    // var_dump($_SESSION['preguntes'][$preguntaAct]);

    foreach ($_SESSION['preguntes'][$preguntaAct]["respostes"] as $solucio) {
        if ($solucio["id"] == $i  and $solucio["correcta"] == 1) {
            $esCorrecte = true;
            $puntuacionFinal += 1;
            break;
        }
    }
    $preguntaAct += 1;
}

echo json_encode(['puntuacio' => $puntuacionFinal]);
