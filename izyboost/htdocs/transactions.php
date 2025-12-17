<?php
// transactions.php
require_once 'config.php';
require_once 'db.php';
require_once 'functions.php';
// Check if user is logged in
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}
// Fetch transactions for the logged-in user
$user_id = $_SESSION['user_id'];
$transactions = getTransactionsByUserId($user_id);
// Include header   
include 'header.php';

    
?>