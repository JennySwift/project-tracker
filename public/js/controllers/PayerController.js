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
            is_timing: false,
            timer: {}
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

        /**
         * A payee has started a timer with the user
         */
        channel.bind('startTimer', function(data) {
            if ($scope.me.id === data.payer_id) {
                $scope.notifications.push(data.notification);

                //Add the timer to the JS array
                //(if the payer has the relevant project popup open)
                //and start the timer for the payer
                //todo: this could be more accurate by starting the timer
                //todo: based on the start time of the timer in the database
                if ($scope.show.popups.project && $scope.selected.project.id === data.project.id) {
                    $scope.resetTimer();
                    $scope.selected.project.timers.push(data.timer);
                    $scope.countUp();
                }

                $scope.$apply();
            }
        });

        /**
         * A payee has stopped a timer with the user
         */
        channel.bind('stopTimer', function(data) {
            if ($scope.me.id === data.payer_id) {
                $scope.notifications.push(data.notification);
                $scope.$apply();
            }
        });

        /**
         * A payee has marked all the user's timers as paid
         */
        channel.bind('markAsPaid', function(data) {
            if ($scope.me.id === data.payer_id) {
                $scope.notifications.push(data.notification);

                //Find the payee and update owed to 0.00
                var $index = _.indexOf($scope.payees, _.findWhere($scope.payees, {id: data.payee_id}));
                $scope.payees[$index].formatted_owed_by_user = "0.00";

                $scope.$apply();
            }
        });

        /**
         * A payee has requested to start a new project with the user
         */
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

        $scope.$watch('project_popup.timer.time.seconds', function (newValue, oldValue) {
            if (newValue < 10) {
                $scope.project_popup.timer.time.formatted_seconds = '0' + newValue;
            }
            else {
                $scope.project_popup.timer.time.formatted_seconds = newValue;
            }
        });

        $scope.$watch('project_popup.timer.time.minutes', function (newValue, oldValue) {
            if (newValue < 10) {
                $scope.project_popup.timer.time.formatted_minutes = '0' + newValue;
            }
            else {
                $scope.project_popup.timer.time.formatted_minutes = newValue;
            }

            //Update the JS price for the timer that is going
            if (newValue) {
                $scope.calculateTimerPrice();
            }
        });

        $scope.$watch('project_popup.timer.time.hours', function (newValue, oldValue) {
            if (newValue < 10) {
                $scope.project_popup.timer.time.formatted_hours = '0' + newValue;
            }
            else {
                $scope.project_popup.timer.time.formatted_hours = newValue;
            }
        });

        $scope.$watch('project_popup.timer.price', function (newValue, oldValue) {
            if (newValue) {
                $scope.project_popup.timer.formatted_price = parseFloat(newValue).toFixed(2);
            }
        });

        /**
         * For updating the price of the timer in the project popup as it is in progress
         */
        $scope.calculateTimerPrice = function () {
            var $rate = parseFloat($scope.selected.project.rate_per_hour);
            var $hours = $scope.project_popup.timer.time.hours;
            var $minutes = $scope.project_popup.timer.time.minutes;
            var $price = 0;

            $price += $rate * $hours;
            $price += $rate / 60 * $minutes;

            $scope.project_popup.timer.price = $price;
        };

        /**
         * select
         */

        /**
         * insert
         */

        $scope.insertProject = function () {
            ProjectsFactory.insertProject($scope.new_project.email, $scope.new_project.description, $scope.new_project.rate)
                .then(function (response) {
                    //$scope.projects = response.data;
                })
                .catch(function (response) {
                    console.log('error');
                });
        };

        $scope.addPayer = function ($keycode) {
            if ($keycode !== 13) {
                return false;
            }
            ProjectsFactory.addPayer()
                .then(function (response) {
                    $scope.payers = response.data;
                })
                .catch(function (response) {
                    console.log('error');
                });
        };

        /**
         * update
         */

        $scope.confirmNewProject = function ($project) {
            ProjectsFactory.confirmNewProject($project)
                .then(function (response) {
                    $scope.projects.push(response.data);
                    $scope.provideFeedback('You have confirmed the project!');
                    $scope.project_requests = _.without($scope.project_requests, $project);
                })
                .catch(function (response) {
                    console.log('error');
                });
        };

        $scope.declineNewProject = function ($project) {
            ProjectsFactory.declineNewProject($project)
                .then(function (response) {
                    $scope.provideFeedback('You have declined the project!');
                    $scope.project_requests = _.without($scope.project_requests, $project);
                })
                .catch(function (response) {
                    console.log('error');
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
            ProjectsFactory.showProject($project)
                .then(function (response) {
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

                        $scope.project_popup.timer.time.hours = $hours;
                        $scope.project_popup.timer.time.minutes = $minutes;
                        $scope.project_popup.timer.time.seconds = $seconds;

                        //Resume the timer
                        $scope.countUp();
                    }

                    $scope.show.popups.project = true;
                })
                .catch(function (response) {
                    console.log('error');
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
                if ($scope.project_popup.timer.time.seconds < 59) {
                    $scope.project_popup.timer.time.seconds+= 1;
                }
                else if ($scope.project_popup.timer.time.minutes < 59) {
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
            $scope.project_popup.timer.time = {
                hours: 0,
                minutes: 0,
                seconds: 0,
                formatted_seconds: '00',
                formatted_minutes: '00',
                formatted_hours: '00'
            };
            $scope.project_popup.timer.price = '0';
        };

        $scope.newMinute = function () {
            $scope.project_popup.timer.time.seconds = 0;
            $scope.project_popup.timer.time.minutes+= 1;
        };

        $scope.newHour = function () {
            $scope.project_popup.timer.time.seconds = 0;
            $scope.project_popup.timer.time.minutes = 0;
            $scope.project_popup.timer.time.hours+= 1;
        };

        /**
         * page load
         */

        $scope.resetTimer();

    }); //end controller

})();