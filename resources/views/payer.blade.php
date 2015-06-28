<!DOCTYPE html>
<html lang="en" ng-app="projects">
<head>
    <meta charset="UTF-8">
    <title>Projects</title>
    <?php
    include(base_path() . '/resources/views/templates/config.php');
    include($head_links);
    ?>
</head>
<body>

@include('templates.header')

<div ng-controller="payer" id="payer" class="container">


    {{--    @include($templates . '/popups/project/index.php')--}}
    @include('templates.projects.index')

    <div ng-show="flash_messages.length > 0">
        <div ng-repeat="message in flash_messages track by $index" class="alert alert-success">[[message]]</div>
    </div>


    <div class="flex">

        <div>
            <table class="table table-bordered margin-bottom">
                <caption>Your payees</caption>
                <tr>
                    <th></th>
                    <th>name</th>
                    <th>owed</th>
                </tr>

                <tr ng-repeat="payee in payees">
                    <td><img ng-src="[[payee.gravatar]]" alt=""></td>
                    <td>[[payee.name]]</td>
                    <td>[[payee.formatted_owed_by_user]]</td>
                </tr>
            </table>
        </div>

    </div>

    <h1>User is payer</h1>

    <table class="table table-bordered">
        <tr>
            <th>Payee</th>
            <th>Description</th>
            <th>Rate/hour</th>
            <th>Time</th>
            <th>$</th>
        </tr>
        <tr ng-repeat="project in projects">
            <td ng-click="showProjectPopup(project)" class="pointer">[[project.payee.name]]
                <img ng-src="[[project.payee.gravatar]]">
            </td>
            <td ng-click="showProjectPopup(project)" class="pointer">[[project.description]]</td>
            <td ng-click="showProjectPopup(project)" class="pointer">$[[project.rate_per_hour]]</td>
            <td ng-click="showProjectPopup(project)" class="pointer">
                [[project.total_time_formatted.hours]]:[[project.total_time_formatted.minutes]]:[[project.total_time_formatted.seconds]]
            </td>
            <td ng-click="showProjectPopup(project)" class="pointer">[[project.formatted_price]]</td>
        </tr>

    </table>

</div>

<?php include($footer); ?>

@include('footer')

</body>
</html>