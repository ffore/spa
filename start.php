<?php
	require('/usr/local/www/plantable_credentials.php');

	$host = 'localhost';
	$db = 'plants';
	$user = $db_user;
	$pass = $db_pass;
	$charset = 'utf8mb4';

	$dsn = "mysql:host=$host; dbname=$db; charset=$charset";

	$opt = [
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
				PDO::ATTR_EMULATE_PREPARES => false,
	];

	$pdo = new PDO($dsn, $user, $pass, $opt);

	$stmt = $pdo->query('SELECT COUNT(id) FROM `plantable` ');
	$total = $stmt->fetch()['COUNT(id)'];


	$stmt = $pdo->query('SELECT * FROM `plantable`');

	$outer = [];

	while($row = $stmt->fetch()){
		$file = $row['pixfile'];
		$name = $row['name'];
		$inner = [ 'file' => $file, 'name' => $name];
		$outer[$row['id']] = $inner;
	}

	$outer[0] = $total;

	echo json_encode($outer);
	