<?php
// $servername = "153.92.15.9";
// $username = "u438242536_db_tracer";
// $password = "Arceo@2004";
// $dbname = "u438242536_study_tracer";


// try {
//     $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
//     $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
// } catch (PDOException $e) {
//     error_log("Connection failed: " . $e->getMessage());
//     die(json_encode(array("status" => false, "message" => "Connection failed: " . $e->getMessage())));
// }


// $host = 'localhost';
// $db = 'study_tracer';
// $user = 'root';
// $pass = '';

// try {
//     $conn = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
//     $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
//     $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
// } catch (PDOException $e) {
//     http_response_code(500);
//     echo json_encode(["error" => "Connection failed"]);
//     exit;
// }
require_once __DIR__ . '../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$host = $_ENV['DB_HOST'];
$db = $_ENV['DB_NAME'];
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];
$apiKey = $_ENV['API_KEY'];

try {
    $conn = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed"]);
    exit;
}
// 
// ?>