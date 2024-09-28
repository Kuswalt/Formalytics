<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

class Put {
    public function update_survey_answer_by_email($email, $data) {
        global $conn;
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
        $stmt->bindParam(':address', $data['address']);
        $stmt->bindParam(':email', $email);
        if ($stmt->execute()) {
            return ["status" => true, "message" => "Survey answer updated successfully"];
        } else {
            return ["status" => false, "message" => "Failed to update survey answer", "error" => $stmt->errorInfo()];
        }
    }

    public function update_survey_answer_by_id($id, $data) {
        global $conn;
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
        $stmt->bindParam(':address', $data['address']);
        $stmt->bindParam(':id', $id);
        if ($stmt->execute()) {
            return ["status" => true, "message" => "Data updated successfully."];
        } else {
            return ["status" => false, "message" => "Failed to update data"];
        }
    }

    public function update_alumni_list_by_id($id, $data) {
        global $conn;
        $sql = "UPDATE alumni_list SET Course = :Course, student_name = :student_name, email = :email, contact = :contact WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':Course', $data['Course']);
        $stmt->bindParam(':student_name', $data['student_name']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':contact', $data['contact']);
        $stmt->bindParam(':id', $id);
        if ($stmt->execute()) {
            return ["status" => true, "message" => "Student updated successfully"];
        } else {
            return ["status" => false, "message" => "Failed to update data"];
        }
    }
}
?>