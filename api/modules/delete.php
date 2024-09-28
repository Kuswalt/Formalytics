<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');


class Delete {
    public function delete_survey_answer_by_id($id) {
        global $conn;
        $sql = "DELETE FROM survey_answers WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $id);
        if ($stmt->execute()) {
            return ["status" => true, "message" => "Successfully deleted the data"];
        } else {
            return ["status" => false, "message" => "Failed to delete data"];
        }
    }

    public function delete_alumni_list_by_id($id) {
        global $conn;
        $sql = "DELETE FROM alumni_list WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $id);
        if ($stmt->execute()) {
            return ["status" => true, "message" => "Successfully deleted the data"];
        } else {
            return ["status" => false, "message" => "Failed to delete data"];
        }
    }
}
?>