<?php
	$app = app_path();
	$public = public_path();

	$templates = base_path() . '/resources/views/templates';
	$head_links = $templates . '/head-links.php';
	$header = $templates . '/header.php';
	$footer = $templates . '/footer.php';
	$tools = $public . '/tools';
	$css = $public . '/css';
	$ajax = $app . '/ajax';
?>