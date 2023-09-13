<?php
$Query = $_GET['q'];
$curl = curl_init();
$username = '4935';
$password = 'db0c792d-e431-49a3-b9e6-fbe8997c959a';
header('Access-Control-Allow-Origin: *');
curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://api.worldota.net/api/b2b/v3/search/multicomplete/',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_USERPWD => $username . ":" . $password,
  CURLOPT_POSTFIELDS =>'{"query": "' . $Query . '", "language": "ru"}',
  CURLOPT_HTTPHEADER => array('Content-Type: application/json', 'Access-Control-Allow-Origin: *'),
));

$response = curl_exec($curl);

curl_close($curl);
echo $response;
?>