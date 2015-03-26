<?php
//load a cross-domain xml file by placing this on your php server and calling
//proxy.php?url=http://example.com/myxmlfile.xml
//don't really use this in production
header ("Content-Type:text/xml");
readfile($_GET['url']);
?>