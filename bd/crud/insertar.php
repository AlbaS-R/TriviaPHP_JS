<?php
include '../conexionbd.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$data = json_decode(file_get_contents("php://input"), true);
header('Content-Type: application/json');

// Statement para insertar las preguntas con imagens y las respuestas a la base de datos
$stmtPreg = $conn->prepare("INSERT INTO preguntes (nom, imagen) VALUES (?,?)");
$stmtResp = $conn->prepare("INSERT INTO respostes (pregunta_id, valor, esCorrecta) VALUES (?, ?, ?)");
$stmtPreg->bind_param("ss", $nom, $imgUrl);
$stmtResp->bind_param("isi", $id, $valor, $esCorrecta);

// Para procesar la imagen
$extension = explode('/', mime_content_type($data['imagen']))[1];
$imagenB64 = explode(',', $data['imagen']);

$imagen = base64_decode($imagenB64[1]);

// Le da un nombre unico y le dice donde poner la imagen
$fileName = uniqid('imagen-', true) . '.' . $extension;
file_put_contents('../img/' . $fileName, $imagen);

// Lee dice donde encontrarr la imagen
$imgUrl = "http://a25albsanrom.daw.inspedralbes.cat/proyecto1/bd/img/" . $fileName;
$nom = $data['pregunta'];
$stmtPreg->execute();
$id = $conn->insert_id;

foreach ($data['respuestas'] as $resp) {
    $valor = $resp['valor'];
    $esCorrecta = $resp['esCorrecta'];
    $stmtResp->execute();
}
