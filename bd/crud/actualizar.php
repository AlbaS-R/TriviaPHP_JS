<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require '../conexionbd.php';
header('Content-Type: application/json');
$data = json_decode(file_get_contents("php://input"), true);

// Aquí lo que hace es coger la iinfo que le llega de el JS
$nuevaPregunta = $data['nuevaPregunta'];
$id = intval($data['id']);

// Hace el Statement prepare con la query para hacer la actualización de la pregunta
// para luego darle los parametros
$stmtPreg = $conn->prepare("UPDATE preguntes SET nom = ? WHERE id = ?");
if (!$stmtPreg) {
    echo json_encode(["status" => "error", "mensaje" => $conn->error]);
    exit;
}
$stmtPreg->bind_param("si", $nuevaPregunta, $id);

// Esto es simplemente un control de errores por si va mal, 
// pero podriamos simplemente colocar $stmtPreg->execute() como he hecho en otras
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

