<div ng-show="showPopup" ng-click="closePopup($event, 'project')" class="popup-outer">

    <div id="project-popup" class="popup-inner">

        <h1>Project</h1>

        <table class="table table-bordered">
            <tr>
                <th>Payer</th>
                <th>Description</th>
                <th>Rate/hour</th>
                <th>Time</th>
                <th>$</th>
            </tr>

            <tr>
                <td>[[selected.project.payer.name]] <img ng-src="[[selected.project.payer.gravatar]]" class="gravatar" alt=""></td>
                <td>[[selected.project.description]]</td>
                <td>$[[selected.project.rate_per_hour]]</td>
                <td>[[selected.project.total_time_formatted.hours]]:[[selected.project.total_time_formatted.minutes]]:[[selected.project.total_time_formatted.seconds]]</td>
                <td>[[selected.project.formatted_price]]</td>
            </tr>
        </table>

        <div ng-if="payers" class="flex">
            <button ng-show="!project_popup.is_timing" ng-click="startProjectTimer()" class="btn btn-success">Start</button>
            <button ng-show="project_popup.is_timing" ng-click="stopProjectTimer()" class="btn btn-danger">Stop</button>
        </div>

        <div class="flex">
            <h1>[[project_popup.timer.time.formatted_hours]]:[[project_popup.timer.time.formatted_minutes]]:[[project_popup.timer.time.formatted_seconds]]</h1>
            <h1>$[[project_popup.timer.formatted_price]]</h1>
        </div>

        <h1>Timers</h1>

        <h3 ng-show="selected.project.timers.length === 0">There are no timers for this project.</h3>

        <table ng-show="selected.project.timers.length > 0" class="table table-bordered">
            <tr>
                <th>Start</th>
                <th>Finish</th>
                <th>Time</th>
                <th>$</th>
                <th>Paid</th>
                <th>Paid At</th>
                <th ng-if="payers"></th>
            </tr>
            <tr ng-repeat="timer in selected.project.timers">
                <td>[[timer.formatted_start]]</td>
                <td>[[timer.formatted_finish]]</td>
                <td>
                    <span ng-show="timer.formatted_time">[[timer.formatted_time.hours]]:[[timer.formatted_time.minutes]]:[[timer.formatted_time.seconds]]</span>
                </td>
                <td>[[timer.price]]</td>
                <td>
                    <span ng-if="!timer.paid" class="label label-danger">unpaid</span>
                    <span ng-if="timer.paid" class="label label-success">paid</span>
                </td>
                <td>[[timer.formatted_paid_at]]</td>
                <td ng-if="payers">
                    <button ng-click="deleteTimer(timer)" class="btn btn-default btn-xs">delete</button>
                </td>
            </tr>
        </table>
    </div>

</div>