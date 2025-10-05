<?php session_start();

$data = file_get_contents("php://input");
$array = json_decode($data, true)['respuestas'];

$_SESSION['puntuacio'] = 0;
$_SESSION['index'] = 0;

$opcionCorrecta = $pregunta['correcta'];
$puntuacionFinal = 0;

$preguntaAct = 0;


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
