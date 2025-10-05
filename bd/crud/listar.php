<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

include '../conexionbd.php';


// Select para hacer el listado de la base de datos
$sql = "SELECT p.id, p.nom, p.imagen, r.id AS resposta_id, r.valor AS resposta, r.esCorrecta 
        FROM preguntes p 
        JOIN respostes r ON p.id = r.pregunta_id 
        ORDER BY p.id";

$result = $conn->query($sql);

$listarData = [];

// Asignamos tablas de la base de datos al array y que se quede con los valores
while ($row = $result->fetch_assoc()) {
    $pid = $row['id'];

    if (!isset($listarData[$pid])) {
        $listarData[$pid] = [
            'id' => $pid,
            'pregunta' => $row['nom'],
            'imatge' => $row['imagen'],
            'respostes' => []
        ];
    }

    $listarData[$pid]['respostes'][] = [
        'id' => $row['resposta_id'],
        'resposta' => $row['resposta'],
        'correcta' => (bool)$row['esCorrecta']
    ];
}

$listarData = array_values($listarData);

// Le enviamos como JSON los valores del array
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['preguntes' => $listarData], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

