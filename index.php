<?php
	require('/usr/local/www/plantable_credentials.php');
	//pdo for db
	//==============================================================//===================================================
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
	$dbfilenum = $stmt->fetch()['COUNT(id)'] + 1;



	//uploading file to server & returning next file num back to javascript
	//==============================================================//===================================================
	//I had to change the permission for index.php AND datas/ to write access for everyone

	//prefix each file name with a number and -
		

	//using $dbfilenum
	$filenum = $dbfilenum;
	$nextfilenum = $filenum + 1;

	if(isset($_FILES['upload_file'])){
		//move_uploaded_file checks if first entry is valid and then moved to the filename in the second entry
		if(move_uploaded_file($_FILES['upload_file']['tmp_name'], 'datas/'.$filenum."-".$_FILES['upload_file']['name'])){
			

			//insert this file into the db table: plantable
			
			$stmt = $pdo->prepare('INSERT INTO plantable (name, pixfile) VALUES (? , ? )');
			$stmt->execute([$_POST['file_description'] ,$_FILES['upload_file']['name']]);

		}
		

		$array = 	['filenum'=> $filenum,'nextfilenum' => $nextfilenum, 
					'filename' => $_FILES['upload_file']['name'], 'plantdescr' => $_POST['file_description'], ];
		echo json_encode($array);
		exit;
	}
	else{
		echo "No files available to upload ...";
	}


	
	
?>