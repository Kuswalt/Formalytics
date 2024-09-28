<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'config.php';

$requestMethod = $_SERVER["REQUEST_METHOD"];
$requestUri = $_SERVER["REQUEST_URI"];

// Add Survey Answer
if ($requestMethod == 'POST' && strpos($requestUri, '/api/survey_answers/add') !== false) {
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "INSERT INTO survey_answers (name, email, contact_Num, address, program, occupation, civil_Status, sex, work_Status, work_place, salary, firstjob_curriculum, batchYr) VALUES (:name, :email, :contact_Num, :address, :program, :occupation, :civil_Status, :sex, :work_Status, :work_place, :salary, :firstjob_curriculum, :batchYr)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':email', $data['email']);
    $stmt->bindParam(':contact_Num', $data['contact_Num']);
    $stmt->bindParam(':address', $data['address']); // Add this line
    $stmt->bindParam(':program', $data['program']);
    $stmt->bindParam(':occupation', $data['occupation']);
    $stmt->bindParam(':civil_Status', $data['civil_Status']);
    $stmt->bindParam(':sex', $data['sex']);
    $stmt->bindParam(':work_Status', $data['work_Status']);
    $stmt->bindParam(':work_place', $data['work_place']);
    $stmt->bindParam(':salary', $data['salary']);
    $stmt->bindParam(':firstjob_curriculum', $data['firstjob_curriculum']);
    $stmt->bindParam(':batchYr', $data['batchYr']);
    if ($stmt->execute()) {
        echo json_encode(array("status" => true, "message" => "Survey answer created successfully"));
    } else {
        echo json_encode(array("status" => false, "message" => "Survey answer creation failed", "error" => $stmt->errorInfo()));
    }
    exit();
}

// Update Survey Answer by ID
if ($requestMethod == 'PUT' && strpos($requestUri, '/api/survey_answers/update/') !== false) {
    $id = basename($requestUri);
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "UPDATE survey_answers SET name = :name, email = :email, contact_Num = :contact_Num, address = :address, program = :program, occupation = :occupation, civil_Status = :civil_Status, sex = :sex, work_Status = :work_Status, work_place = :work_place, salary = :salary, firstjob_curriculum = :firstjob_curriculum, batchYr = :batchYr WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':email', $data['email']);
    $stmt->bindParam(':contact_Num', $data['contact_Num']);
    $stmt->bindParam(':address', $data['address']); // Add this line
    $stmt->bindParam(':program', $data['program']);
    $stmt->bindParam(':occupation', $data['occupation']);
    $stmt->bindParam(':civil_Status', $data['civil_Status']);
    $stmt->bindParam(':sex', $data['sex']);
    $stmt->bindParam(':work_Status', $data['work_Status']);
    $stmt->bindParam(':work_place', $data['work_place']);
    $stmt->bindParam(':salary', $data['salary']);
    $stmt->bindParam(':firstjob_curriculum', $data['firstjob_curriculum']);
    $stmt->bindParam(':batchYr', $data['batchYr']);
    $stmt->bindParam(':id', $id);
    if ($stmt->execute()) {
        echo json_encode(array("status" => true, "message" => "Data updated successfully."));
    } else {
        echo json_encode(array("status" => false, "message" => "Failed to update data"));
    }
    exit();
}

// Other existing code...

$conn = null;
?>