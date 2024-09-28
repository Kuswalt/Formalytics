<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

class Get {
    public function get_accounts() {
        global $conn;
        try {
            $sql = "SELECT * FROM acc";
            $stmt = $conn->query($sql);
            $accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $accounts;
        } catch (PDOException $e) {
            http_response_code(500);
            return ["error" => "Query failed"];
        }
    }

    public function get_survey_answers() {
        global $conn;
        $sql = "SELECT * FROM survey_answers";
        $stmt = $conn->query($sql);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($data) {
            return ["status" => true, "data" => $data];
        } else {
            return ["status" => false, "message" => "No survey answers found"];
        }
    }

    public function get_survey_answer_by_id($id) {
        global $conn;
        $sql = "SELECT * FROM survey_answers WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($data) {
            return ["status" => true, "data" => $data];
        } else {
            return ["status" => false, "message" => "No survey answer found"];
        }
    }

    public function check_email_existence($email) {
        global $conn;
        $sql = "SELECT COUNT(*) as count FROM survey_answers WHERE email = :email";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $emailExists = $result['count'] > 0;
        return ["emailExists" => $emailExists, "status" => true];
    }

    public function get_alumni_list() {
        global $conn;
        $sql = "SELECT * FROM alumni_list";
        $stmt = $conn->query($sql);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($data) {
            return ["status" => true, "data" => $data];
        } else {
            return ["status" => false, "message" => "No alumni found"];
        }
    }

    public function get_archived_respondents() {
        global $conn;
        $sql = "SELECT * FROM archived_respondents";
        $stmt = $conn->query($sql);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($data) {
            return ["status" => true, "data" => $data];
        } else {
            return ["status" => false, "message" => "No archived respondents found"];
        }
    }

    public function get_survey_answers_by_ids($ids) {
        global $conn;
        $idsArray = explode(',', $ids);
        $placeholders = implode(',', array_fill(0, count($idsArray), '?'));
        $sql = "SELECT * FROM survey_answers WHERE id IN ($placeholders)";
        $stmt = $conn->prepare($sql);
        foreach ($idsArray as $index => $id) {
            $stmt->bindValue($index + 1, $id);
        }
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($data) {
            return ["status" => true, "data" => $data];
        } else {
            return ["status" => false, "message" => "No survey answers found"];
        }
    }
}
?>