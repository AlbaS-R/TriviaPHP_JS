<?php session_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Conexión a la base de datos

require '../bd/conexionbd.php';

// Select preguntas y respuestas de BD
$sql = "SELECT s.id, s.nom, s.imagen, r.id AS resposta_id, r.valor AS resposta, r.esCorrecta
FROM (
    SELECT *
    FROM preguntes
    ORDER BY rand()
    LIMIT 10
) s
LEFT JOIN respostes r ON s.id = r.pregunta_id
";

$result = $conn->query($sql);

$listarData = [];



// Crear array con preguntas y respuestas
while ($row = $result->fetch_assoc()) {
    $pid = $row['id'];

    if (!isset($listarData[$pid])) {
        $listarData[$pid] = [
            'id' => $pid,
            'pregunta' => $row['nom'],
            'imatge'=> $row['imagen'],
            'respostes' => []
        ];
    }

    $listarData[$pid]['respostes'][] = [
        'id' => $row['resposta_id'],
        'resposta' => $row['resposta'],
        'correcta' => (bool)$row['esCorrecta']
    ];
}

$preguntes = array_values($listarData);

foreach ($preguntes as $key => $pregunta) {
    shuffle($preguntes[$key]['respostes']);
}

// Configurar variables del juego inicial
$_SESSION['preguntes'] = $preguntes;
$_SESSION['puntuacio'] = 0;
$_SESSION['index'] = 0;

// Limpiar respuestas ( solo borrar si es correcta para no enviarlo al JS)
foreach ($preguntes as $pregunta) {
    $opciones_limpias = [];
    foreach ($pregunta['respostes'] as $opcion) {
        unset($opcion['correcta']);
        $opciones_limpias[] = $opcion;
    }
    $preguntes_limpias[] = [
        'id' => $pregunta['id'],
        'imatge'=> $pregunta['imatge'],
        'pregunta' => $pregunta['pregunta'],
        'respostes' => $opciones_limpias
    ];
}

// Responde un JSON de preguntas limpias
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['preguntes' => $preguntes_limpias], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
