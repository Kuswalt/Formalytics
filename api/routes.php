<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config.php';
require_once 'modules/get.php';
require_once 'modules/post.php';
require_once 'modules/put.php';
require_once 'modules/delete.php';

$get = new Get();
$post = new Post();
$put = new Put();
$delete = new Delete();

if (isset($_REQUEST['request'])) {
    $request = explode('/', $_REQUEST['request']);
} else {
    echo json_encode(["error" => "Request parameter not found"]);
    http_response_code(404);
    exit();
}

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            switch ($request[0]) {
                case 'get-accounts':
                    echo json_encode($get->get_accounts());
                    break;
                case 'get-survey-answers':
                    echo json_encode($get->get_survey_answers());
                    break;
                case 'get-survey-answer-by-id':
                    echo json_encode($get->get_survey_answer_by_id($request[1]));
                    break;
                case 'check-email-existence':
                    echo json_encode($get->check_email_existence($request[1]));
                    break;
                case 'get-alumni-list':
                    echo json_encode($get->get_alumni_list());
                    break;
                case 'get-archived-respondents':
                    echo json_encode($get->get_archived_respondents());
                    break;
                case 'get-survey-answers-by-ids':
                    echo json_encode($get->get_survey_answers_by_ids($request[1]));
                    break;
                default:
                    echo json_encode(["error" => "This is forbidden"]);
                    http_response_code(403);
                    break;
            }
            break;
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            switch ($request[0]) {
                case 'add-account':
                    echo json_encode($post->add_account($data));
                    break;
                case 'login':
                    echo json_encode($post->login($data));
                    break;
                case 'add-survey-answer':
                    echo json_encode($post->add_survey_answer($data));
                    break;
                case 'add-multiple-students':
                    echo json_encode($post->add_multiple_students($data));
                    break;
                case 'add-student':
                    echo json_encode($post->add_student($data));
                    break;
                case 'archive-students':
                    echo json_encode($post->archive_students($data['students']));
                    break;
                case 'archive-respondents':
                    echo json_encode($post->archive_respondents($data['respondents']));
                    break;
                default:
                    echo json_encode(["error" => "This is forbidden"]);
                    http_response_code(403);
                    break;
            }
            break;
        case 'PUT':
            $data = json_decode(file_get_contents("php://input"), true);
            switch ($request[0]) {
                case 'update-survey-answer-by-email':
                    echo json_encode($put->update_survey_answer_by_email($request[1], $data));
                    break;
                case 'update-survey-answer-by-id':
                    echo json_encode($put->update_survey_answer_by_id($request[1], $data));
                    break;
                case 'update-alumni-list-by-id':
                    echo json_encode($put->update_alumni_list_by_id($request[1], $data));
                    break;
                default:
                    echo json_encode(["error" => "This is forbidden"]);
                    http_response_code(403);
                    break;
            }
            break;
        case 'DELETE':
            switch ($request[0]) {
                case 'delete-survey-answer-by-id':
                    echo json_encode($delete->delete_survey_answer_by_id($request[1]));
                    break;
                case 'delete-alumni-list-by-id':
                    echo json_encode($delete->delete_alumni_list_by_id($request[1]));
                    break;
                default:
                    echo json_encode(["error" => "This is forbidden"]);
                    http_response_code(403);
                    break;
            }
            break;
        default:
            echo json_encode(["error" => "Method not available"]);
            http_response_code(404);
            break;
    }
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
    http_response_code(500);
}
?>