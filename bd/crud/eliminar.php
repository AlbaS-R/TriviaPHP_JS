<?php
include '../conexionbd.php';

$data = json_decode(file_get_contents("php://input"), true);
header('Content-Type: application/json');

// Statement para que se elimine de la base de datos.

$stmtPreg = $conn->prepare("DELETE FROM preguntes WHERE (id) = (?)");
$stmtResp = $conn->prepare("DELETE FROM respostes WHERE (pregunta_id) = (?)");
$stmtPreg->bind_param("i", $id);
$stmtResp->bind_param("i", $id);

$id = $data['id'];

$stmtResp->execute();
$stmtPreg->execute();