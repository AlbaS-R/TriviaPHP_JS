<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require '../conexionbd.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

$nuevaPregunta = $data['nuevaPregunta'];
$id = intval($data['id']);
var_dump($id);
$stmtPreg = $conn->prepare("UPDATE preguntes SET nom = ? WHERE id = ?");
if (!$stmtPreg) {
    echo json_encode(["status" => "error", "mensaje" => $conn->error]);
    exit;
}

$stmtPreg->bind_param("si", $nuevaPregunta, $id);

if ($stmtPreg->execute()) {
    echo json_encode([
        "status" => "ok",
        "mensaje" => "Pregunta actualizada",
        "filas_afectadas" => $stmtPreg->affected_rows
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "mensaje" => $stmtPreg->error
    ]);
}

$stmtPreg->close();
$conn->close();

