var app = angular.module('projects');

(function () {
    app.controller('payer', function ($scope, $http, $interval, $timeout, ProjectsFactory) {

        /**
         * scope properties
         */

        $scope.projects = projects;
        $scope.me = me;
        $scope.notifications = notifications;
        $scope.payees = payees;
        $scope.new_project = {};
        $scope.show = {
            popups: {}
        };
        $scope.project_popup = {
            is_timing: false
        };
        $scope.selected = {};
        $scope.feedback_messages = [];
        $scope.project_requests = project_requests;

        /**
         * Pusher
         * @type {string}
         */

        $scope.pusher_public_key = pusher_public_key;

        var pusher = new Pusher($scope.pusher_public_key);

        var channel = pusher.subscribe('channel');

        channel.bind('startTimer', function(data) {
            if ($scope.me.id === data.payer_id) {
                $scope.notifications.push(data.notification);
                $scope.$apply();
            }
        });

        channel.bind('stopTimer', function(data) {
            if ($scope.me.id === data.payer_id) {
                $scope.notifications.push(data.notification);
                $scope.$apply();
            }
        });

        channel.bind('markAsPaid', function(data) {
            if ($scope.me.id === data.payer_id) {
                $scope.notifications.push(data.notification);

                //Find the payee and update owed to 0.00
                var $index = _.indexOf($scope.payees, _.findWhere($scope.payees, {id: data.payee_id}));
                $scope.payees[$index].formatted_owed_by_user = "0.00";

                $scope.$apply();
            }
        });

        channel.bind('insertProject', function(data) {
            if ($scope.me.id === data.payer_id) {
                $scope.project_requests.push(data.project);
                $scope.$apply();
            }
        });

        /**
         * watches
         */

        /**
         * Todo: Duplicate code from PayeeController.js
         */

        $scope.$watch('project_popup.timer_time.seconds', function (newValue, oldValue) {
            if (newValue < 10) {
                $scope.project_popup.timer_time.formatted_seconds = '0' + newValue;
            }
            else {
                $scope.project_popup.timer_time.formatted_seconds = newValue;
            }
        });

        $scope.$watch('project_popup.timer_time.minutes', function (newValue, oldValue) {
            if (newValue < 10) {
                $scope.project_popup.timer_time.formatted_minutes = '0' + newValue;
            }
            else {
                $scope.project_popup.timer_time.formatted_minutes = newValue;
            }
        });

        $scope.$watch('project_popup.timer_time.hours', function (newValue, oldValue) {
            if (newValue < 10) {
                $scope.project_popup.timer_time.formatted_hours = '0' + newValue;
            }
            else {
                $scope.project_popup.timer_time.formatted_hours = newValue;
            }
        });

        /**
         * select
         */

        /**
         * insert
         */

        $scope.insertProject = function () {
            ProjectsFactory.insertProject($scope.new_project.email, $scope.new_project.description, $scope.new_project.rate).then(function (response) {
                //$scope.projects = response.data;
            });
        };

        $scope.addPayer = function ($keycode) {
            if ($keycode !== 13) {
                return false;
            }
            ProjectsFactory.addPayer().then(function (response) {
                $scope.payers = response.data;
            });
        };

        /**
         * update
         */

        $scope.confirmNewProject = function ($project) {
            ProjectsFactory.confirmNewProject($project).then(function (response) {
                $scope.projects.push(response.data);
                $scope.provideFeedback('You have confirmed the project!');
                $scope.project_requests = _.without($scope.project_requests, $project);
            });
        };

        $scope.declineNewProject = function ($project) {
            ProjectsFactory.declineNewProject($project).then(function (response) {
                $scope.provideFeedback('You have declined the project!');
                $scope.project_requests = _.without($scope.project_requests, $project);
            });
        };

        /**
         * delete
         */

        $scope.dismissNotification = function ($notification) {
            ProjectsFactory.dismissNotification($notification)
                .then(function (response) {
                    $scope.notifications = _.without($scope.notifications, $notification);
                })
                .catch(function (response) {
                    $scope.error_messages.push(response.data.error);
                });
        };

        /**
         * other
         */

        $scope.provideFeedback = function ($message) {
            $scope.feedback_messages.push($message);
            setTimeout(function () {
                $scope.feedback_messages = _.without($scope.feedback_messages, $message);
                $scope.$apply();
            }, 3000);
        };

        /**
         * Todo: Duplicate code from PayeeController.js
         * @param $event
         * @param $popup
         */

        $scope.showProjectPopup = function ($project) {
            ProjectsFactory.showProject($project).then(function (response) {
                $scope.selected.project = response.data;

                //Check if the project has a timer going

                var $timer_in_progress = $scope.isTimerGoing();
                if ($timer_in_progress) {
                    //Set the time of the timer in progress to what it should be
                    var $start = moment($timer_in_progress.formatted_start, 'DD/MM/YY HH:mm:ss');
                    var $now = moment();
                    var $time = $now.diff($start, 'seconds');
                    var $hours = Math.floor($time / 3600);
                    $time = $time - ($hours * 3600);
                    var $minutes = Math.floor($time / 60);
                    $time = $time - ($minutes * 60);
                    var $seconds = $time;

                    $scope.project_popup.timer_time.hours = $hours;
                    $scope.project_popup.timer_time.minutes = $minutes;
                    $scope.project_popup.timer_time.seconds = $seconds;

                    //Resume the timer
                    $scope.countUp();
                }

                $scope.show.popups.project = true;
            });
        };

        $scope.isTimerGoing = function () {
            return _.findWhere($scope.selected.project.timers, {finish: null});
        };

        $scope.stopJsTimer = function () {
            $interval.cancel($scope.counter);
            $scope.project_popup.is_timing = false;
        };

        $scope.countUp = function () {
            $scope.project_popup.is_timing = true;

            $scope.counter = $interval(function () {
                if ($scope.project_popup.timer_time.seconds < 59) {
                    $scope.project_popup.timer_time.seconds+= 1;
                }
                else if ($scope.project_popup.timer_time.minutes < 59) {
                    $scope.newMinute();
                }
                else {
                    $scope.newHour();
                }

            }, 1000);
        };


        $scope.closePopup = function ($event, $popup) {
            var $target = $event.target;
            if ($target.className === 'popup-outer') {
                $scope.show.popups[$popup] = false;
            }
            $scope.stopJsTimer();
        };

        $scope.resetTimer = function () {
            $scope.project_popup.timer_time = {
                hours: 0,
                minutes: 0,
                seconds: 0,
                formatted_seconds: '00',
                formatted_minutes: '00',
                formatted_hours: '00'
            };
        };

        $scope.newMinute = function () {
            $scope.project_popup.timer_time.seconds = 0;
            $scope.project_popup.timer_time.minutes+= 1;
        };

        $scope.newHour = function () {
            $scope.project_popup.timer_time.seconds = 0;
            $scope.project_popup.timer_time.minutes = 0;
            $scope.project_popup.timer_time.hours+= 1;
        };

        /**
         * page load
         */

        $scope.resetTimer();

    }); //end controller

})();