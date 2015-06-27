var app = angular.module('projects');

(function () {
    app.controller('payee', function ($scope, $http, $interval, $timeout, ProjectsFactory) {

        /**
         * scope properties
         */

        $scope.projects = payee_projects;
        $scope.me = me;
        $scope.payers = payers;
        $scope.new_project = {};
        $scope.show = {
            popups: {}
        };
        $scope.project_popup = {
            is_timing: false
        };
        $scope.selected = {};
        $scope.flash_messages = [];

        /**
         * Pusher
         * @type {string}
         */

        $scope.pusher_public_key = pusher_public_key;

        var pusher = new Pusher($scope.pusher_public_key);

        var channel = pusher.subscribe('channel');

        channel.bind('confirmProject', function(data) {
            if ($scope.me.id === data.payee_id) {
                $scope.flash_messages.push(data.message);
                $scope.$apply();
            }
        });

        channel.bind('declineProject', function(data) {
            if ($scope.me.id === data.payee_id) {
                $scope.flash_messages.push(data.message);
                $scope.$apply();
            }
        });

        /**
         * watches
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

        $scope.$watch('selected.project.price', function (newValue, oldValue) {
            if (newValue) {
                $scope.selected.project.formatted_price = parseFloat(newValue).toFixed(2);
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
            ProjectsFactory.insertProject($scope.new_project.email, $scope.new_project.description, $scope.new_project.rate)
                .then(function (response) {
                    $scope.projects.push(response.data)
                })
                .catch(function (response) {
                    console.log(response);
                });
        };

        $scope.startProjectTimer = function () {
            ProjectsFactory.startProjectTimer($scope.selected.project.id).then(function (response) {
                //$scope.projects = response.data.projects;
                //$scope.selected.project = response.data.project;
                $scope.resetTimer();
                $scope.project_popup.is_timing = true;
                $scope.selected.project.timers.push(response.data);

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
                $interval.cancel($scope.counter);
                $scope.project_popup.is_timing = false;
            });
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

        $scope.deleteProject = function ($project) {
            if (confirm("Are you sure you want to delete this project?")) {
                ProjectsFactory.deleteProject($project)
                    .then(function (response) {
                        //An error message for if the user has been logged out
                        //Angular thinks this exception is a success :P
                        if (response.data.error) {
                            $scope.flash_messages.push(response.data.error);
                            return false;
                        }
                        $scope.projects = _.without($scope.projects, $project);
                        $scope.flash_messages.push('Project ' + $project.description + ' deleted.');
                    })
                    .catch(function (response) {
                        $scope.flash_messages.push(response.data.error);
                    });
            }
        };

        $scope.deleteTimer = function ($timer) {
            if (confirm("Are you sure you want to delete this timer?")) {
                ProjectsFactory.deleteTimer($timer).then(function (response) {
                    $scope.selected.project.timers = _.without($scope.selected.project.timers, $timer);
                    $scope.flash_messages.push('Timer deleted.');
                });
            }
        };

        /**
         * other
         */

        $scope.showProjectPopup = function ($project) {
            ProjectsFactory.showProject($project).then(function (response) {
                $scope.selected.project = response.data;
                $scope.show.popups.project = true;
            });
        };

        $scope.closePopup = function ($event, $popup) {
            var $target = $event.target;
            if ($target.className === 'popup-outer') {
                $scope.show.popups[$popup] = false;
            }
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