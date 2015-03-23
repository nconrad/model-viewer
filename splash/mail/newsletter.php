<?php
$recipient = "nconrad@anl.gov";
$subject = "Subscription to coremodels.mcs.anl.gov";

#$location = "enter the URL of the result page here";
$sender = $recipient;
$body = "This is an a newsletter subscription for coremodels.mcs.anl.gov\n";
$body .= "Email: ".$_REQUEST['email']." \n";

#echo "$body";
mail( $recipient, $subject, $body, "From: $sender" ) or die ("Mail could not be sent.");

#header( "Location: $location" );
?>
