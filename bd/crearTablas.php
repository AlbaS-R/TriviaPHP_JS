<?php
include 'conexionbd.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Metodo para que lea el JSON que le he puesto y lo descodifique.
$data = file_get_contents("../JSON/quiz_logos.json");
$array = json_decode($data, true);

// Creación de las dos tablas que queremos.
$sql1 = "CREATE TABLE IF NOT EXISTS preguntes(
  id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  imagen VARCHAR(255)
)";

if ($conn->query($sql1) === TRUE) {
  echo "Tabla preguntes creada<br>";
} else {
  echo "Error creando tabla preguntes: " . $conn->error . "<br>";
}

$sql2 = "CREATE TABLE IF NOT EXISTS respostes(
  id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pregunta_id INT(6) UNSIGNED NOT NULL,
  valor VARCHAR(255) NOT NULL,
  esCorrecta BOOLEAN NOT NULL,
  FOREIGN KEY (pregunta_id) REFERENCES preguntes(id)
)";

if ($conn->query($sql2) === TRUE) {
  echo "Tabla respostes creada<br>";
} else {
  echo "Error creando tabla respostes: " . $conn->error . "<br>";
}

// Statements prepare para que inserte la info en las tablas que queremos en este caso.
$stmtPreg = $conn->prepare("INSERT INTO preguntes (nom, imagen) VALUES (?, ?)");
$stmtResp = $conn->prepare("INSERT INTO respostes (pregunta_id, valor, esCorrecta) VALUES (?, ?, ?)");
$stmtPreg->bind_param("ss", $nom, $imatge);
$stmtResp->bind_param("isi", $id, $valor, $esCorrecta);


// Parrar asignar que lo que queremos es que le meta los datos de el JSON directamente a la base de datos. 
// Pasandole todos los puntos del JSON y metiendolos en los parametros hechos anteriormente.
if (isset($array['preguntes']) && is_array($array['preguntes'])) {
    foreach ($array['preguntes'] as $preg) {
        $nom = $preg['pregunta'];
        $imatge = $preg['imatge'];
        $stmtPreg->execute();
        $id = $conn->insert_id;

        foreach ($preg['respostes'] as $resp) {
            $valor = $resp['resposta'];
            $esCorrecta = $resp['correcta'];
            $stmtResp->execute();
        }
    }
} else {
    echo "El JSON no contiene la clave 'preguntes' o está vacío.";
}



$conn->close();
