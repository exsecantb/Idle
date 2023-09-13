<?php
$Query = $_GET['q'];
$Token = 'Hy6U3z61fflbgT2yJ%2FVdlQ2719';
$ch = curl_init("https://sutochno.ru/api/rest/search/getTermSuggestions?query=".$Query."&token=".$Token);
header('Access-Control-Allow-Origin: *');
curl_exec($ch);
curl_close($ch);
?>