
<?php
$host= 'sql310.infinityfree.com';
$dbname = 'if0_39106178_izyboost';
$username = 'if0_39106178';
$password = 'RTNrS9RYwvPu';
try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

$stmt = $conn->prepare("SELECT lien1, lien2,lien3,lien4 FROM canva WHERE id = 1");
$stmt->execute();

$result = $stmt->fetch(PDO::FETCH_ASSOC);


if ($result) {
    $lien1 = $result['lien1'];
    $lien2 = $result['lien2'];
    $lien3 = $result['lien3'];
    $lien4 = $result['lien4'];
} else {
    $lien = "Lien non trouvé";
}


$stmt = $conn->prepare("SELECT lien1, lien2,lien3,lien4 FROM canva WHERE id = 1");
$stmt->execute();

$result = $stmt->fetch(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Canva Links with nexius ai</title>
    <link rel="stylesheet" href="style.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 80%;
            margin: auto;
            overflow: hidden;
        }
        h1 {
            text-align: center;
            color: #333;
        }
        form {
            background: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        label {
            display: block;
            margin-bottom: 10px;
        }
        input[type="text"] {
            width: calc(100% - 20px);
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 5px;
            border: 1px solid #ccc;
        }
        button {
            background-color: #28a745;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        button:hover {
            background-color: #218838;
        }
        footer {
            text-align: center;
            padding: 20px;
            background-color: #333;
            color: white;
            position: relative;
            bottom: 0;
            width: 100%;
        }
        footer p {
            margin: 0;
        }
        .error-message {
            color: red;
            font-size: 0.9em;
        }
        .success-message {
            color: green;
            font-size: 0.9em;
        }
        .auth-container {
            max-width: 400px;
            margin: 50px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .auth-header {
            text-align: center;
            margin-bottom: 20px;
        }
        .auth-header h1 {
            margin: 0;
            font-size: 24px;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
    <h1><A href="admin.php">accueil</a></h1>
        <h1>Canva Links</h1>
        <form action="" method="post">
            <label for="lien1">Lien 1:</label>
            <input type="text" id="lien1" name="lien1" value="<?php echo htmlspecialchars($lien1); ?>" required>

            <label for="lien2">Lien 2:</label>
            <input type="text" id="lien2" name="lien2" value="<?php echo htmlspecialchars($lien2); ?>" >

            <label for="lien3">Lien 3:</label>
            <input type="text" id="lien3" name="lien3" value="<?php echo htmlspecialchars($lien3); ?>" >
            <label for="lien3">Lien 4:</label>
            <input type="text" id="lien4" name="lien4" value="<?php echo htmlspecialchars($lien4); ?>" >

            <button type="submit">Mettre à jour les liens</button>
        </form>
    </div>
    <footer>
        <p>&copy; 2025 IZYBOOST. Tous droits réservés.</p>
    </footer>
</body>

</html>

<?php
// Update links in the database
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $lien1 = $_POST['lien1'] ?? '';
    $lien2 = $_POST['lien2'] ?? '';
    $lien3 = $_POST['lien3'] ?? '';
    $lien4 = $_POST['lien4'] ?? '';

    try {
        $stmt = $conn->prepare("UPDATE canva SET lien1 = :lien1, lien2 = :lien2, lien3 = :lien3 , lien4= :lien4 WHERE id = 1");
        $stmt->bindParam(':lien1', $lien1);
        $stmt->bindParam(':lien2', $lien2);
        $stmt->bindParam(':lien3', $lien3);
        $stmt->bindParam(':lien4', $lien4);
        $stmt->execute();

        header('Location: admin.php?success=valider');
        exit;
    } catch (PDOException $e) {
        echo "Erreur lors de la mise à jour des liens : " . $e->getMessage();
    }
}
?>

