<?php
$servername = "localhost";
$username = "a25albsanrom_root";
$password = "EpC0nPcH!5(h]mC3";
$dbname = "a25albsanrom_trivia";


$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}