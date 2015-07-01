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
<body ng-controller="payee">

@include('templates.header')

<div id="payee" class="container">

    @include('templates.projects.index')

    {{--<button ng-click="testFeedback()">testFeedback</button>--}}

    <div id="feedback">
        <div ng-repeat="message in feedback_messages track by $index" class="feedback-message">[[message]]</div>
    </div>

    <div ng-show="declined_projects.length > 0">
        <div ng-repeat="project in declined_projects track by $index" class="alert alert-danger message">
            [[project.payer.name]] has declined your project '[[project.description]]!'
            <i ng-click="dismissDeclinedProjectMessage(project)" class="fa fa-times"></i>
        </div>
    </div>

    <div ng-show="error_messages.length > 0">
        <div ng-repeat="message in error_messages track by $index" class="alert alert-danger">[[message]]</div>
    </div>

    <div ng-show="validation_messages.length > 0">
        <div ng-repeat="message in validation_messages track by $index" class="alert alert-danger">[[message]]</div>
    </div>

    <div ng-show="notifications.length > 0">
        <div ng-repeat="notification in notifications track by $index" class="alert alert-success message">
            [[notification.message]]
            <i ng-click="dismissNotification(notification)" class="fa fa-times"></i>
        </div>
    </div>

    <div>
        <autocomplete-Jenny
            placeholder="Choose existing payer or enter new email address"
            url = "select/autocompletePayers"
            width="300"/>
    </div>

    <h1>Add a new payer</h1>

    <div class="flex margin-bottom input-container">
        <input ng-keyup="addPayer($event.keyCode)" type="text" placeholder="enter payer's email" id="new-payer-email"/>
        <button ng-click="addPayer(13)" class="btn btn-success">Add payer</button>
    </div>

    <h1>Create a new project</h1>

    <div class="margin-bottom input-container">

        <div class="flex margin-bottom-md">
            <select ng-model="new_project.email" title="something">
                <option ng-repeat="payer in payers" ng-value="payer.email">[[payer.name]]</option>
            </select>
            <input ng-model="new_project.description" type="text" placeholder="description">
            <input ng-model="new_project.rate" ng-keyup="insertProject($event.keyCode)" type="text" placeholder="rate">
        </div>

        <div class="flex">
            <button ng-click="insertProject(13)" class="btn btn-success">Create project</button>
        </div>

    </div>

    <div class="flex">
        <div>
            <h1>Payers</h1>
            <table class="table table-bordered margin-bottom">
                <tr>
                    <th></th>
                    <th>name</th>
                    <th>owed</th>
                    <th></th>
                    <th></th>
                </tr>

                <tr ng-repeat="payer in payers">
                    <td><img ng-src="[[payer.gravatar]]" class="gravatar"></td>
                    <td>[[payer.name]]</td>
                    <td>[[payer.formatted_owed_to_user]]</td>
                    <td><button ng-click="markAsPaid(payer)" class="btn btn-xs">paid</button></td>
                    <td><button ng-click="removePayer(payer)" class="btn btn-xs btn-danger">delete</button></td>
                </tr>
            </table>
        </div>

    </div>


    <h1>Projects</h1>

    <table class="table table-bordered margin-bottom-lg">
        <tr>
            <th>Payer</th>
            <th>Description</th>
            <th>Rate/hour</th>
            <th>Time</th>
            <th>$</th>
            {{--<th>Paid</th>--}}
            <th></th>
        </tr>
        <tr ng-repeat="project in projects">
            <td ng-click="showProjectPopup(project)" class="pointer">[[project.payer.name]]
                <img ng-src="[[project.payer.gravatar]]" class="gravatar" alt="">
            </td>
            <td ng-click="showProjectPopup(project)" class="pointer">[[project.description]]</td>
            <td ng-click="showProjectPopup(project)" class="pointer">$[[project.rate_per_hour]]</td>
            <td ng-click="showProjectPopup(project)" class="pointer">
                [[project.total_time_formatted.hours]]:[[project.total_time_formatted.minutes]]:[[project.total_time_formatted.seconds]]
            </td>
            <td ng-click="showProjectPopup(project)" class="pointer">[[project.formatted_price]]</td>
            {{--<td>--}}
            {{--<span ng-if="!project.paid" class="label label-danger">unpaid</span>--}}
            {{--<span ng-if="project.paid" class="label label-success">paid</span>--}}
            {{--</td>--}}
            <td>
                <button ng-click="deleteProject(project)" class="btn btn-xs btn-danger">delete</button>
            </td>
        </tr>

    </table>

</div>

<?php include($footer); ?>

@include('footer')

</body>
</html>