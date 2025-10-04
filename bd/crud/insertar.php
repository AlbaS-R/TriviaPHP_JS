<?php
include '../conexionbd.php';

$data = json_decode(file_get_contents("php://input"), true);
header('Content-Type: application/json');

$stmtPreg = $conn->prepare("INSERT INTO preguntes (nom) VALUES (?)");
$stmtResp = $conn->prepare("INSERT INTO respostes (pregunta_id, valor, esCorrecta) VALUES (?, ?, ?)");
$stmtPreg->bind_param("s", $nom);
$stmtResp->bind_param("isi", $id, $valor, $esCorrecta);


$nom = $data['pregunta'];
$stmtPreg->execute();
$id = $conn->insert_id;

foreach ($data['respuestas'] as $resp) {
    $valor = $resp['valor'];
    $esCorrecta = $resp['esCorrecta'];
    $stmtResp->execute();
}
