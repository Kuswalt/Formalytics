<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

class Post {
    public function add_account($data) {
        global $conn;
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
                return ["status" => false, "message" => "Account is still not approved by developers or Username already taken"];
            } else if ($result['isAdmin'] == 1) {
                return ["status" => false, "message" => "Account Username is already used"];
            } else {
                return ["status" => false, "message" => "Username already taken"];
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
                return ["status" => true, "message" => "Account created successfully"];
            } catch (PDOException $e) {
                return ["status" => false, "message" => "Account creation failed: " . $e->getMessage()];
            }
        }
    }
    
    public function archive_students($students) {
        global $conn;
        $sql = "INSERT INTO archived_students (Course, student_name, email, contact) VALUES ";
        $values = array();
        $params = array();
        foreach ($students as $index => $student) {
            $values[] = "(:Course{$index}, :student_name{$index}, :email{$index}, :contact{$index})";
            $params[":Course{$index}"] = $student['Course'];
            $params[":student_name{$index}"] = $student['student_name'];
            $params[":email{$index}"] = $student['email'];
            $params[":contact{$index}"] = $student['contact'];
        }
        $sql .= implode(", ", $values);
        $stmt = $conn->prepare($sql);
        foreach ($params as $key => &$val) {
            $stmt->bindParam($key, $val);
        }
        if ($stmt->execute()) {
            return ["status" => true, "message" => "Students archived successfully"];
        } else {
            return ["status" => false, "message" => "Failed to archive students", "error" => $stmt->errorInfo()];
        }
    }

    public function login($data) {
        global $conn;
        $username = $data['username'];
        $password = $data['password'];

        $sql = "SELECT * FROM acc WHERE username = :username";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return ["status" => false, "message" => "User not found"];
        } else {
            if (password_verify($password, $user['password'])) {
                return ["status" => true, "message" => "Login successful", "userId" => $user['userid'], "isAdmin" => $user['isAdmin']];
            } else {
                return ["status" => false, "message" => "Incorrect credentials"];
            }
        }
    }

    public function add_survey_answer($data) {
        global $conn;
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
        $stmt->bindParam(':address', $data['address']);
        if ($stmt->execute()) {
            return ["status" => true, "message" => "Survey answer added successfully"];
        } else {
            return ["status" => false, "message" => "Failed to add survey answer", "error" => $stmt->errorInfo()];
        }
    }

    public function add_multiple_students($students) {
        global $conn;
        if (!is_array($students) || count($students) === 0) {
            return ["status" => false, "message" => "Invalid input data"];
        } else {
            $sql = "INSERT INTO alumni_list (Course, student_name, email, contact) VALUES ";
            $values = array();
            $params = array();
            foreach ($students as $index => $student) {
                $values[] = "(:Course{$index}, :student_name{$index}, :email{$index}, :contact{$index})";
                $params[":Course{$index}"] = $student['Course'];
                $params[":student_name{$index}"] = $student['student_name'];
                $params[":email{$index}"] = $student['email'];
                $params[":contact{$index}"] = $student['contact'];
            }
            $sql .= implode(", ", $values);
            $stmt = $conn->prepare($sql);
            foreach ($params as $key => &$val) {
                $stmt->bindParam($key, $val);
            }
            if ($stmt->execute()) {
                return ["status" => true, "message" => "Students added successfully"];
            } else {
                return ["status" => false, "message" => "Failed to add students", "error" => $stmt->errorInfo()];
            }
        }
    }

    public function add_student($data) {
        global $conn;
        $sql = "INSERT INTO alumni_list (Course, student_name, email, contact) VALUES (:Course, :student_name, :email, :contact)";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':Course', $data['Course']);
        $stmt->bindParam(':student_name', $data['student_name']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':contact', $data['contact']);
        if ($stmt->execute()) {
            return ["status" => true, "message" => "Student created successfully"];
        } else {
            return ["status" => false, "message" => "Student creation failed", "error" => $stmt->errorInfo()];
        }
    }

    public function archive_respondents($respondents) {
        global $conn;
        $sql = "INSERT INTO archived_respondents (name, email, contact_Num, program, occupation, civil_Status, sex, work_Status, work_place, salary, firstjob_curriculum, batchYr, address) VALUES ";
        $values = array();
        $params = array();
        foreach ($respondents as $index => $respondent) {
            $values[] = "(:name{$index}, :email{$index}, :contact_Num{$index}, :program{$index}, :occupation{$index}, :civil_Status{$index}, :sex{$index}, :work_Status{$index}, :work_place{$index}, :salary{$index}, :firstjob_curriculum{$index}, :batchYr{$index}, :address{$index})";
            $params[":name{$index}"] = $respondent['name'];
            $params[":email{$index}"] = $respondent['email'];
            $params[":contact_Num{$index}"] = $respondent['contact_Num'];
            $params[":program{$index}"] = $respondent['program'];
            $params[":occupation{$index}"] = $respondent['occupation'];
            $params[":civil_Status{$index}"] = $respondent['civil_Status'];
            $params[":sex{$index}"] = $respondent['sex'];
            $params[":work_Status{$index}"] = $respondent['work_Status'];
            $params[":work_place{$index}"] = $respondent['work_place'];
            $params[":salary{$index}"] = $respondent['salary'];
            $params[":firstjob_curriculum{$index}"] = $respondent['firstjob_curriculum'];
            $params[":batchYr{$index}"] = $respondent['batchYr'];
            $params[":address{$index}"] = $respondent['address'];
        }
        $sql .= implode(", ", $values);
        $stmt = $conn->prepare($sql);
        foreach ($params as $key => &$val) {
            $stmt->bindParam($key, $val);
        }
        if ($stmt->execute()) {
            return ["status" => true, "message" => "Respondents archived successfully"];
        } else {
            return ["status" => false, "message" => "Failed to archive respondents", "error" => $stmt->errorInfo()];
        }
    }
}
?>