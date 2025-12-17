<?php

class Database {
    private $host = 'sql310.infinityfree.com';
    private $db_name = 'if0_39106178_izyboost';
    private $username = 'if0_39106178';
    private $password = 'RTNrS9RYwvPu';
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8", 
                $this->username, 
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            error_log("Erreur de connexion: " . $exception->getMessage());
        }
        return $this->conn;
    }
}
?>