<?php
$id = $_GET['id'];
$servername = "exsec.beget.tech";
$username = "exsec_db1";
$password = "B8WfDDf*";
$dbname = "exsec_db1";
header('Access-Control-Allow-Origin: *');
// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT `lat`, `lon` FROM `Regions` WHERE `id` = '" . $id . "'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  // output data of each row
  while($row = $result->fetch_assoc()) {
    echo json_encode(array("lat" => $row["lat"], "lon" => $row["lon"]));
  }
}
$conn->close();
?>