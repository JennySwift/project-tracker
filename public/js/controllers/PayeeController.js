var app = angular.module('projects');

(function () {
    app.controller('payee', function ($scope, $http, $interval, $timeout, ProjectsFactory) {

        /**
         * scope properties
         */

        $scope.projects = projects;
        $scope.declined_projects = declined_projects;
        $scope.me = me;
        $scope.payers = payers;
        $scope.new_project = {};
        $scope.show = {
            popups: {}
        };
        $scope.project_popup = {
            is_timing: false,
            timer: {}
        };
        $scope.selected = {};
        $scope.error_messages = [];
        $scope.validation_messages = [];
        $scope.feedback_messages = [];
        $scope.notifications = notifications;

        /**
         * Pusher
         * @type {string}
         */

        $scope.pusher_public_key = pusher_public_key;

        var pusher = new Pusher($scope.pusher_public_key);

        var channel = pusher.subscribe('channel');

        /**
         * The payer has confirmed the user's project
         */
        channel.bind('confirmProject', function(data) {
            if ($scope.me.id === data.payee_id) {
                $scope.notifications.push(data.notification);
                $scope.projects.push(data.project);
                $scope.$apply();
            }
        });

        /**
         * The payer has declined the user's project
         */
        channel.bind('declineProject', function(data) {
            if ($scope.me.id === data.payee_id) {
                $scope.declined_projects.push(data.project);
                $scope.$apply();
            }
        });

        /**
         * watches
         */

        $scope.$watch('project_popup.timer.time.seconds', function (newValue, oldValue) {
            if (newValue < 10) {
                $scope.project_popup.timer.time.formatted_seconds = '0' + newValue;
            }
            else {
                $scope.project_popup.timer.time.formatted_seconds = newValue;
            }

            //Update the JS price for the timer that is going
            //if (newValue) {
            //    $scope.calculateTimerPrice();
            //}
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

        $scope.$watch('project_popup.timer.time.hours', function (newValue, oldValue) {
            if (newValue < 10) {
                $scope.project_popup.timer.time.formatted_hours = '0' + newValue;
            }
            else {
                $scope.project_popup.timer.time.formatted_hours = newValue;
            }
        });

        $scope.$watch('selected.project.price', function (newValue, oldValue) {
            if (newValue) {
                $scope.selected.project.formatted_price = parseFloat(newValue).toFixed(2);
            }
        });

        $scope.$watch('project_popup.timer.price', function (newValue, oldValue) {
            if (newValue) {
                $scope.project_popup.timer.formatted_price = parseFloat(newValue).toFixed(2);
            }
        });

        /**
         * select
         */

        /**
         * insert
         */

        $scope.insertProject = function ($keycode) {
            if ($keycode !== 13)
            {
                return false;
            }
            $scope.validation_messages = [];
            ProjectsFactory.insertProject($scope.new_project.email, $scope.new_project.description, $scope.new_project.rate)
                .then(function (response) {
                    $scope.provideFeedback('Your project is awaiting confirmation.');
                })
                .catch(function (response) {
                    //Display the error messages to the user
                    $.each(response.data, function (key, value) {
                        //value is an array of errors, (for one thing, such as description)
                        for (var i = 0; i < value.length; i++) {
                            $scope.validation_messages.push(value[i]);
                        }
                    });
                });
        };

        $scope.startProjectTimer = function () {
            ProjectsFactory.startProjectTimer($scope.selected.project.id).then(function (response) {
                $scope.resetTimer();
                $scope.selected.project.timers.push(response.data);
                $scope.countUp();
            });
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

        /**
         * When timer is stopped, info about the timer, project,
         * and payer is returned in the response using a transformer.
         *
         * Update the following:
         * The timer in the timers table.
         * The amount owed.
         * On both main page and in the popup, update the project time and project price.
         */
        $scope.stopProjectTimer = function () {
            ProjectsFactory.stopProjectTimer($scope.selected.project.id).then(function (response) {
                //Find the timer in the JS array and update it
                var $index = _.indexOf($scope.selected.project.timers, _.findWhere($scope.selected.project.timers, {id: response.data.id}));
                $scope.selected.project.timers[$index].formatted_finish = response.data.finish;
                $scope.selected.project.timers[$index].formatted_time = response.data.time;
                $scope.selected.project.timers[$index].price = response.data.price;

                //Update the project price in the popup
                $scope.selected.project.price = response.data.project.price;

                //Update the project time in the popup
                $scope.selected.project.total_time_formatted = response.data.project.time;

                //Find the project on the main page
                //I suppose ideally the project time and price should somehow update
                //on the main page automatically when it updates in the popup.
                var $project = _.findWhere($scope.projects, {id: $scope.selected.project.id});
                var $index = _.indexOf($scope.projects, $project);

                //Update the project price on the main page
                $scope.projects[$index].price = $scope.selected.project.price;

                //Update the project time on the main page
                $scope.projects[$index].total_time_formatted = $scope.selected.project.total_time_formatted;

                //Find the payer
                var $payer_index = _.indexOf($scope.payers, _.findWhere($scope.payers, {id: response.data.payer.id}));

                //Update the amount owed
                $scope.payers[$payer_index].formatted_owed_to_user = response.data.payer.owed;

                //Stop the JS timer
                $scope.stopJsTimer();
            });
        };

        $scope.stopJsTimer = function () {
            $interval.cancel($scope.counter);
            $scope.project_popup.is_timing = false;
        };

        /**
         * After the successful response, in the JS:
         * Update amount owed to "0.00".
         * @param $payer
         */
        $scope.markAsPaid = function ($payer) {
            if (confirm("Are you sure? " + $payer.name + " will no longer owe you any money.")) {
                ProjectsFactory.markAsPaid($payer.id).then(function (response) {
                    //Todo: Is there some better way of writing this, so I can just do something like
                    //Todo: $payer.formatted_owed_to_user = "0.00"?

                    //Find the index of the payer
                    var $index = _.indexOf($scope.payers, _.findWhere($scope.payers, {id: $payer.id}));

                    //Update the amount owed
                    $scope.payers[$index].formatted_owed_to_user = "0.00";
                });
            }
        };

        /**
         * delete
         */

        $scope.removePayer = function ($payer) {
            if (confirm("Are you sure? This will delete all data associated with this payer.")) {
                ProjectsFactory.removePayer($payer.id).then(function (response) {
                    //Remove the payer from the payers
                    $scope.payers = _.without($scope.payers, $payer);
                    //Remove all the projects that were with the payer
                    var $projects_with_payer = _.where($scope.projects, {payer_id: $payer.id});
                    $scope.projects = _.difference($scope.projects, $projects_with_payer);
                });
            }
        };

        /**
         * Delete the project but confirm first
         * @param $project
         */
        $scope.deleteProject = function ($project) {
            if (confirm("Are you sure you want to delete this project?")) {
                ProjectsFactory.deleteProject($project)
                    .then(function (response) {
                        $scope.projects = _.without($scope.projects, $project);
                        $scope.provideFeedback('Project "' + $project.description + '" deleted.');
                    })
                    .catch(function (response) {
                        $scope.error_messages.push(response.data.error);
                    });
            }
        };

        /**
         * Delete the project, and
         * dismiss the feedback message about the payer declining the project
         * @param $project
         */
        $scope.dismissDeclinedProjectMessage = function ($project) {
            ProjectsFactory.deleteProject($project)
                .then(function (response) {
                    $scope.declined_projects = _.without($scope.declined_projects, $project);
                })
                .catch(function (response) {
                    $scope.error_messages.push(response.data.error);
                });
        };

        $scope.dismissNotification = function ($notification) {
            ProjectsFactory.dismissNotification($notification)
                .then(function (response) {
                    $scope.notifications = _.without($scope.notifications, $notification);
                })
                .catch(function (response) {
                    $scope.error_messages.push(response.data.error);
                });
        };

        $scope.deleteTimer = function ($timer) {
            if (confirm("Are you sure you want to delete this timer?")) {
                ProjectsFactory.deleteTimer($timer).then(function (response) {
                    $scope.selected.project.timers = _.without($scope.selected.project.timers, $timer);
                    $scope.provideFeedback('Timer deleted.');
                });
            }
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

        $scope.testFeedback = function () {
            $scope.provideFeedback('something');
        };

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

                    $scope.project_popup.timer.time.hours = $hours;
                    $scope.project_popup.timer.time.minutes = $minutes;
                    $scope.project_popup.timer.time.seconds = $seconds;

                    //Resume the timer
                    $scope.countUp();
                }

                $scope.show.popups.project = true;
            });
        };

        $scope.isTimerGoing = function () {
            return _.findWhere($scope.selected.project.timers, {finish: null});
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
                formatted_hours: '00',
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