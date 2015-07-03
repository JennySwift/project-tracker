;(function(){
    'use strict';
    angular
        .module('projects')
        .directive('popup', popup);

    /* @inject */
    function popup($parse, $http, $sce, $timeout) {
        return {
            restrict: 'EA',
            scope: {
                //"id": "@id",
                //"selectedObject": "=selectedobject",
                'showPopup': '=show'
            },
            templateUrl: 'js/directives/PopupTemplate.php',
            link: function($scope, elem, attrs) {
                $scope.currentIndex = 1;
                //$scope.showPopup = true;

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

                $scope.closePopup = function ($event, $popup) {
                    var $target = $event.target;
                    if ($target.className === 'popup-outer') {
                        $scope.show.popups[$popup] = false;
                    }
                    $scope.stopJsTimer();
                };

                /**
                 * Query the database
                 */
                $scope.searchDatabase = function () {
                    var $data = {
                        typing: $scope.inputValue
                    };

                    $http.post($scope.url, $data).
                        success(function(response, status, headers, config) {
                            $scope.dealWithResults(response);
                        }).
                        error(function(data, status, headers, config) {
                            //todo: Can I access my provideFeedback method in my controller from here?
                            console.log("There was an error");
                        });
                };
            }
        };
    }
}).call(this);

