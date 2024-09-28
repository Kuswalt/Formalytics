<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

ini_set('log_errors', 1);
ini_set('error_log', 'path/to/php-error.log');

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
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

// Add Account
if ($requestMethod == 'POST' && strpos($requestUri, '/acc/add') !== false) {
    $data = json_decode(file_get_contents("php://input"), true);
    $username = $data['username'];
    $password = $data['password'];
    $email = $data['email'];
    $name = $data['name'];
    $isAdmin = isset($data['isAdmin']) ? $data['isAdmin'] : 0;

    $checkUserSql = "SELECT * FROM acc WHERE username = :username";
    $stmt = $conn->prepare($checkUserSql);
    $stmt->bindParam(':username', $username);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        if ($result['isAdmin'] == 0) {
            echo json_encode(array("status" => false, "message" => "Account is still not approved by developers or Username already taken"));
        } else if ($result['isAdmin'] == 1) {
            echo json_encode(array("status" => false, "message" => "Account Username is already used"));
        } else {
            echo json_encode(array("status" => false, "message" => "Username already taken"));
        }
    } else {
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $sql = "INSERT INTO acc (username, password, email, name, isAdmin) VALUES (:username, :password, :email, :name, :isAdmin)";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':isAdmin', $isAdmin);
        try {
            $stmt->execute();
            echo json_encode(array("status" => true, "message" => "Account created successfully"));
        } catch (PDOException $e) {
            handleError("Account creation failed: " . $e->getMessage());
        }
    }
    exit();
}

// Get Accounts
if ($requestMethod == 'GET' && strpos($requestUri, '/acc') !== false) {
    $sql = "SELECT * FROM acc";
    $stmt = $conn->query($sql);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($data) {
        echo json_encode(array("status" => true, "data" => $data));
    } else {
        echo json_encode(array("status" => false, "message" => "No accounts found"));
    }
    exit();
}

// Login
if ($requestMethod == 'POST' && strpos($requestUri, '/login') !== false) {
    error_log("Login endpoint hit");
    $data = json_decode(file_get_contents("php://input"), true);
    error_log("Request data: " . print_r($data, true));
    $username = $data['username'];
    $password = $data['password'];

    $sql = "SELECT * FROM acc WHERE username = :username";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $username);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        error_log("User not found: " . $username);
        echo json_encode(array("status" => false, "message" => "User not found"));
    } else {
        if (password_verify($password, $user['password'])) {
            error_log("Login successful for user: " . $username);
            echo json_encode(array("status" => true, "message" => "Login successful", "userId" => $user['userid'], "isAdmin" => $user['isAdmin']));
        } else {
            error_log("Incorrect credentials for user: " . $username);
            echo json_encode(array("status" => false, "message" => "Incorrect credentials"));
        }
    }
    exit();
}
// Add Survey Answer
if ($requestMethod == 'POST' && strpos($requestUri, '/survey_answers/add') !== false) {
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "INSERT INTO survey_answers (name, email, contact_Num, program, occupation, civil_Status, sex, work_Status, work_place, salary, firstjob_curriculum, batchYr, address) VALUES (:name, :email, :contact_Num, :program, :occupation, :civil_Status, :sex, :work_Status, :work_place, :salary, :firstjob_curriculum, :batchYr, :address)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':email', $data['email']);
    $stmt->bindParam(':contact_Num', $data['contact_Num']);
    $stmt->bindParam(':program', $data['program']);
    $stmt->bindParam(':occupation', $data['occupation']);
    $stmt->bindParam(':civil_Status', $data['civil_Status']);
    $stmt->bindParam(':sex', $data['sex']);
    $stmt->bindParam(':work_Status', $data['work_Status']);
    $stmt->bindParam(':work_place', $data['work_place']);
    $stmt->bindParam(':salary', $data['salary']);
    $stmt->bindParam(':firstjob_curriculum', $data['firstjob_curriculum']);
    $stmt->bindParam(':batchYr', $data['batchYr']);
    $stmt->bindParam(':address', $data['address']); // Include address
    if ($stmt->execute()) {
        echo json_encode(array("status" => true, "message" => "Survey answer added successfully"));
    } else {
        echo json_encode(array("status" => false, "message" => "Failed to add survey answer", "error" => $stmt->errorInfo()));
    }
    exit();
}

// Update Survey Answer by Email
if ($requestMethod == 'PUT' && strpos($requestUri, '/survey_answers/update_by_email/') !== false) {
    $email = basename($requestUri);
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "UPDATE survey_answers SET name = :name, contact_Num = :contact_Num, program = :program, occupation = :occupation, civil_Status = :civil_Status, sex = :sex, work_Status = :work_Status, work_place = :work_place, salary = :salary, firstjob_curriculum = :firstjob_curriculum, batchYr = :batchYr, address = :address WHERE email = :email";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':contact_Num', $data['contact_Num']);
    $stmt->bindParam(':program', $data['program']);
    $stmt->bindParam(':occupation', $data['occupation']);
    $stmt->bindParam(':civil_Status', $data['civil_Status']);
    $stmt->bindParam(':sex', $data['sex']);
    $stmt->bindParam(':work_Status', $data['work_Status']);
    $stmt->bindParam(':work_place', $data['work_place']);
    $stmt->bindParam(':salary', $data['salary']);
    $stmt->bindParam(':firstjob_curriculum', $data['firstjob_curriculum']);
    $stmt->bindParam(':batchYr', $data['batchYr']);
    $stmt->bindParam(':address', $data['address']); // Include address
    $stmt->bindParam(':email', $email);
    if ($stmt->execute()) {
        echo json_encode(array("status" => true, "message" => "Survey answer updated successfully"));
    } else {
        echo json_encode(array("status" => false, "message" => "Failed to update survey answer", "error" => $stmt->errorInfo()));
    }
    exit();
}

// Check Email Existence
if ($requestMethod == 'GET' && strpos($requestUri, '/survey_answers/check_email/') !== false) {
    $email = basename($requestUri);
    $sql = "SELECT COUNT(*) as count FROM survey_answers WHERE email = :email";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $emailExists = $result['count'] > 0;
    echo json_encode(array("emailExists" => $emailExists, "status" => true));
    exit();
}


// Get All Survey Answers
if ($requestMethod == 'GET' && strpos($requestUri, '/survey_answers') !== false) {
    $sql = "SELECT * FROM survey_answers";
    $stmt = $conn->query($sql);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($data) {
        echo json_encode(array("status" => true, "data" => $data));
    } else {
        echo json_encode(array("status" => false, "message" => "No survey answers found"));
    }
    exit();
}

// Update Survey Answer by ID
if ($requestMethod == 'PUT' && strpos($requestUri, '/survey_answers/update/') !== false) {
    $id = basename($requestUri);
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "UPDATE survey_answers SET name = :name, email = :email, contact_Num = :contact_Num, program = :program, occupation = :occupation, civil_Status = :civil_Status, sex = :sex, work_Status = :work_Status, work_place = :work_place, salary = :salary, firstjob_curriculum = :firstjob_curriculum, batchYr = :batchYr, address = :address WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':email', $data['email']);
    $stmt->bindParam(':contact_Num', $data['contact_Num']);
    $stmt->bindParam(':program', $data['program']);
    $stmt->bindParam(':occupation', $data['occupation']);
    $stmt->bindParam(':civil_Status', $data['civil_Status']);
    $stmt->bindParam(':sex', $data['sex']);
    $stmt->bindParam(':work_Status', $data['work_Status']);
    $stmt->bindParam(':work_place', $data['work_place']);
    $stmt->bindParam(':salary', $data['salary']);
    $stmt->bindParam(':firstjob_curriculum', $data['firstjob_curriculum']);
    $stmt->bindParam(':batchYr', $data['batchYr']);
    $stmt->bindParam(':address', $data['address']); // Include address
    $stmt->bindParam(':id', $id);
    if ($stmt->execute()) {
        echo json_encode(array("status" => true, "message" => "Data updated successfully."));
    } else {
        echo json_encode(array("status" => false, "message" => "Failed to update data"));
    }
    exit();
}

// Delete Survey Answer by ID
if ($requestMethod == 'DELETE' && strpos($requestUri, '/survey_answers/delete/') !== false) {
    $id = basename($requestUri);
    $sql = "DELETE FROM survey_answers WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    if ($stmt->execute()) {
        echo json_encode(array("status" => true, "message" => "Successfully deleted the data"));
    } else {
        echo json_encode(array("status" => false, "message" => "Failed to delete data"));
    }
    exit();
}

// Add Multiple Students to Alumni List
if ($requestMethod == 'POST' && strpos($requestUri, '/alumni_list/add-multiple') !== false) {
    $students = json_decode(file_get_contents("php://input"), true);
    if (!is_array($students) || count($students) === 0) {
        echo json_encode(array("status" => false, "message" => "Invalid input data"));
    } else {
        $sql = "INSERT INTO alumni_list (Course, student_name, email, contact) VALUES ";
        $values = array();
        foreach ($students as $student) {
            $values[] = "(:Course, :student_name, :email, :contact)";
        }
        $sql .= implode(", ", $values);
        $stmt = $conn->prepare($sql);
        foreach ($students as $index => $student) {
            $stmt->bindParam(':Course', $student['Course']);
            $stmt->bindParam(':student_name', $student['student_name']);
            $stmt->bindParam(':email', $student['email']);
            $stmt->bindParam(':contact', $student['contact']);
        }
        if ($stmt->execute()) {
            echo json_encode(array("status" => true, "message" => "Students added successfully"));
        } else {
            echo json_encode(array("status" => false, "message" => "Failed to add students", "error" => $stmt->errorInfo()));
        }
    }
    exit();
}

// Add Singular Data to Alumni List
if ($requestMethod == 'POST' && strpos($requestUri, '/alumni_list/add') !== false) {
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "INSERT INTO alumni_list (Course, student_name, email, contact) VALUES (:Course, :student_name, :email, :contact)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':Course', $data['Course']);
    $stmt->bindParam(':student_name', $data['student_name']);
    $stmt->bindParam(':email', $data['email']);
    $stmt->bindParam(':contact', $data['contact']);
    if ($stmt->execute()) {
        echo json_encode(array("status" => true, "message" => "Student created successfully"));
    } else {
        echo json_encode(array("status" => false, "message" => "Student creation failed", "error" => $stmt->errorInfo()));
    }
    exit();
}

// Get All Alumni List
if ($requestMethod == 'GET' && strpos($requestUri, '/alumni_list') !== false) {
    $sql = "SELECT * FROM alumni_list";
    $stmt = $conn->query($sql);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($data) {
        echo json_encode(array("status" => true, "data" => $data));
    } else {
        echo json_encode(array("status" => false, "message" => "No alumni found"));
    }
    exit();
}

// Update Alumni List by ID
if ($requestMethod == 'PUT' && strpos($requestUri, '/alumni_list/update/') !== false) {
    $id = basename($requestUri);
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "UPDATE alumni_list SET Course = :Course, student_name = :student_name, email = :email, contact = :contact WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':Course', $data['Course']);
    $stmt->bindParam(':student_name', $data['student_name']);
    $stmt->bindParam(':email', $data['email']);
    $stmt->bindParam(':contact', $data['contact']);
    $stmt->bindParam(':id', $id);
    if ($stmt->execute()) {
        echo json_encode(array("status" => true, "message" => "Student updated successfully"));
    } else {
        echo json_encode(array("status" => false, "message" => "Failed to update data"));
    }
    exit();
}

// Delete Alumni List by ID
if ($requestMethod == 'DELETE' && strpos($requestUri, '/alumni_list/delete/') !== false) {
    $id = basename($requestUri);
    $sql = "DELETE FROM alumni_list WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    if ($stmt->execute()) {
        echo json_encode(array("status" => true, "message" => "Successfully deleted the data"));
    } else {
        echo json_encode(array("status" => false, "message" => "Failed to delete data"));
    }
    exit();
}

// Get Survey Answer by ID
if ($requestMethod == 'GET' && preg_match('/\/survey_answers\/(\d+)$/', $requestUri, $matches)) {
    $id = $matches[1];
    $sql = "SELECT * FROM survey_answers WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($data) {
        echo json_encode(array("status" => true, "data" => $data));
    } else {
        echo json_encode(array("status" => false, "message" => "No survey answer found"));
    }
    exit();
}

// Avoid exposing detailed error messages
function handleError($message) {
    error_log($message);
    echo json_encode(array("status" => false, "message" => "An error occurred. Please try again later."));
    exit();
}

$conn = null;
?>