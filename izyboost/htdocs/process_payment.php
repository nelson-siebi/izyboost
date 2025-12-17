<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('memory_limit', '256M');

// Configuration de la base de données
define('DB_HOST', 'sql310.infinityfree.com');
define('DB_NAME', 'if0_39106178_izyboost');
define('DB_USER', 'if0_39106178');
define('DB_PASS', 'RTNrS9RYwvPu');
define('API_TOKEN', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYjgzYzczMzc3ZWI1ZWM0NjcwNjBkMDBmOTMzZGEzODk2MDgwNzdjNmQwYjQyNGIwNGYwYzhhNGFkYWNjY2FlMzUyMTY1ZmQzMTVlYWU2MzMiLCJpYXQiOjE3NTIxNzc0OTcuMTAzMzU5OTM3NjY3ODQ2Njc5Njg3NSwibmJmIjoxNzUyMTc3NDk3LjEwMzM2MDg5MTM0MjE2MzA4NTkzNzUsImV4cCI6MTc4MzcxMzQ5Ny4xMDAwNDcxMTE1MTEyMzA0Njg3NSwic3ViIjoiODcyIiwic2NvcGVzIjpbXX0.BdBQzBJWVcHw2LoYyiu9YiCBoyLPEmdPG855VqiJK-3Mha5MD3Vih3GEeHVX9crkEXEdvvIVEEmmv9UPyy4hUZfEKzfXe0QQbDXIa4AwSzBlZFLs-5Y44-GrPnqFslvLxd7yleeCBMpV_0NQ5Uw_zLhb3gmkbJHjKzcNfr-peVqoKrn2xkjhQVOvFjlpLRtxhxyZ96hFxjCV3miUeMUtCkdYvngcX1EPWH-EDZEC9D5cdK9v-AtAYrW5Xm-mEvjtz2W-1sEWBdc_DRMebW_iwjbyuWJ1y0zhYyDl0r4uHkuHb7-d8X5rQQDGasbpgPHwaz4xYvBusE1WyZjsxYco24VUFz-vn5iW2RSkSMcgfKU4oTel9oyWluZGvVmWaLsIbHjMjGFoV-Vrc3EvCqPNkR2DtIqT1bP_A4cAkvw7YGCDaODDT_23PK22iKPZXLrA1mHRCh9muAAX6VmkZgl33tMpjDQ03INCuwjNm57oV4JGjE7EBWx4EVuObX51WYr_cmSjfCSgWpQ5Z3QrSPihkp2iTkxtu3QO1qqyimpftwoh2-5N2y5P72Rhm3HKxq7_pL_kFuxfA1cLBCDMXFx0WNqueR3DO1jxDMgG--pdWKgrPNczTJ_isT0LY7_T0dcZoKqEl1nna9KFDveBYDhB-7WjK4031NpMQkjdA4yKGsY'); // Raccourci pour exemple

class PaymentProcessor {
    private $pdo;

    public function __construct() {
        $this->connectDB();
    }

    private function connectDB() {
        try {
            $this->pdo = new PDO(
                "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8",
                DB_USER,
                DB_PASS
            );
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            $this->sendResponse(false, "Database connection failed: " . $e->getMessage());
            exit;
        }
    }

    public function handleRequest() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception("Invalid JSON input");
            }

            if (!isset($input['action'])) {
                throw new Exception("Action parameter is required");
            }

            switch ($input['action']) {
                case 'init':
                    $this->handleInitPayment($input);
                    break;
                case 'check':
                    $this->handleCheckPayment($input);
                    break;
                default:
                    throw new Exception("Unsupported action");
            }
        } catch (Exception $e) {
            $this->sendResponse(false, $e->getMessage());
        }
    }

    private function handleInitPayment($data) {
        $required = ['amount', 'phone'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }

        $amount = $this->validateAmount($data['amount']);
        $phone = (string) $this->validatePhone($data['phone']); // Forcer en string
        $externalRef = $data['external_reference'] ?? 'pay_'.time().'_'.bin2hex(random_bytes(4));

        $this->createTransaction($amount, $phone, $externalRef);

        $apiResponse = $this->callMamonipay([
            'amount' => $amount,
            'phone' => (string)$phone,
            'external_reference' => $externalRef,
            'client_fees_rate' => 50
        ], 'init_payment');

        if (!$apiResponse['success']) {
            $this->updateTransactionStatus($externalRef, 'FAILED', $apiResponse['message']);
            throw new Exception($apiResponse['message']);
        }

        $this->updateTransactionGateway(
            $externalRef,
            $apiResponse['data']['gateway_reference'],
            $apiResponse['data']['status']
        );

        $this->sendResponse(true, 'Payment initialized', [
            'gateway_reference' => $apiResponse['data']['gateway_reference'],
            'external_reference' => $externalRef,
            'status' => $apiResponse['data']['status'],
            'amount' => $amount,
            'phone_number' => $phone,
            'timestamp' => time()
        ]);
    }

    private function handleCheckPayment($data) {
        if (!isset($data['gateway_reference'])) {
            throw new Exception("Gateway reference is required");
        }

        $gatewayRef = $data['gateway_reference'];
        $transaction = $this->getTransaction($gatewayRef);

        if (!$transaction) {
            throw new Exception("Transaction not found");
        }

        if (in_array($transaction['status'], ['SUCCESSFUL', 'FAILED'])) {
            $this->sendResponse(true, 'Final status', $transaction);
            return;
        }

        $apiResponse = $this->callMamonipay([
            'gateway_reference' => $gatewayRef
        ], 'payment_status');

        if (!$apiResponse['success']) {
            throw new Exception($apiResponse['message'] ?? "API verification failed");
        }

        $status = $apiResponse['data']['status'];
        $this->updateTransactionStatus($gatewayRef, $status);

        if ($status === 'SUCCESSFUL') {
            $this->creditUserAccount(
                $transaction['user_id'],
                $transaction['amount'],
                $gatewayRef
            );
        }

        $responseData = [
            'gateway_reference' => $gatewayRef,
            'status' => $status,
            'amount' => $apiResponse['data']['amount'] ?? $transaction['amount'],
            'phone_number' => $apiResponse['data']['phone_number'] ?? $transaction['phone_number'],
            'timestamp' => time()
        ];

        if ($status === 'FAILED' && isset($apiResponse['data']['error_message'])) {
            $responseData['error_message'] = $apiResponse['data']['error_message'];
        }

        $this->sendResponse(true, 'Payment status updated', $responseData);
    }

    private function validateAmount($amount) {
    if (!is_numeric($amount)) {
        throw new Exception("Le montant doit être un nombre.");
    }

    $amount = (int) $amount;

    if ($amount < 100) {
        throw new Exception("Le montant minimum est 100 XAF.");
    }

    return $amount;
}

    private function validatePhone($phone) {
        $phoneStr = (string)$phone;
        if (!preg_match('/^237\d{9}$/', $phoneStr)) {
            throw new Exception("Invalid phone format. Must be: 237XXXXXXXXX");
        }
        return $phoneStr; // toujours string maintenant
    }

    private function createTransaction($amount, $phone, $externalRef) {
        $stmt = $this->pdo->prepare("INSERT INTO transactions 
            (user_id, amount, external_reference, status, phone_number, created_at, updated_at) 
            VALUES (:user_id, :amount, :external_ref, 'PENDING', :phone, NOW(), NOW())");

        $stmt->execute([
            ':user_id' => 1, // Adapter selon votre logique
            ':amount' => $amount,
            ':external_ref' => $externalRef,
            ':phone' => $phone
        ]);

        return $this->pdo->lastInsertId();
    }

    private function getTransaction($reference) {
        $stmt = $this->pdo->prepare("SELECT * FROM transactions WHERE gateway_reference = :ref OR external_reference = :ref");
        $stmt->execute([':ref' => $reference]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function updateTransactionStatus($reference, $status, $errorMessage = null) {
        $sql = "UPDATE transactions SET status = :status, updated_at = NOW()";
        $params = [':status' => $status];

        if ($errorMessage) {
            $sql .= ", error_message = :error";
            $params[':error'] = $errorMessage;
        }

        $sql .= " WHERE gateway_reference = :ref OR external_reference = :ref";
        $params[':ref'] = $reference;

        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }

    private function updateTransactionGateway($externalRef, $gatewayRef, $status) {
        $stmt = $this->pdo->prepare("UPDATE transactions 
            SET gateway_reference = :gateway_ref, status = :status, updated_at = NOW() 
            WHERE external_reference = :external_ref");

        return $stmt->execute([
            ':gateway_ref' => $gatewayRef,
            ':status' => $status,
            ':external_ref' => $externalRef
        ]);
    }

    private function creditUserAccount($userId, $amount, $transactionRef) {
        $stmt = $this->pdo->prepare("UPDATE users SET solde = solde + :amount WHERE id = :user_id");
        $stmt->execute([':amount' => $amount, ':user_id' => $userId]);

        $stmt = $this->pdo->prepare("INSERT INTO credit_logs (user_id, amount, transaction_ref, created_at) VALUES (:user_id, :amount, :transaction_ref, NOW())");
        $stmt->execute([
            ':user_id' => $userId,
            ':amount' => $amount,
            ':transaction_ref' => $transactionRef
        ]);
    }

    private function callMamonipay($data, $endpoint) {
        $url = 'https://mamonipay.me/api/transaction/' . $endpoint;

        if (isset($data['phone'])) {
            $data['phone'] = (string) $data['phone']; // Assurer que c'est une string
        }

        $headers = [
            'Authorization: Bearer ' . API_TOKEN,
            'Content-Type: application/json',
            'Accept: application/json'
        ];

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_FOLLOWLOCATION => true
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return ['success' => false, 'message' => "API connection error: $error"];
        }

        $decoded = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return ['success' => false, 'message' => "Invalid API response"];
        }

        if ($httpCode >= 400) {
            return ['success' => false, 'message' => $decoded['message'] ?? "API error (HTTP $httpCode)", 'http_code' => $httpCode];
        }

        return $decoded;
    }

    private function sendResponse($success, $message, $data = []) {
        $response = ['success' => $success, 'message' => $message];
        if (!empty($data)) {
            $response['data'] = $data;
        }
        echo json_encode($response);
        exit;
    }
}

$processor = new PaymentProcessor();
$processor->handleRequest();
?>
