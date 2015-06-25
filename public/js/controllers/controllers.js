var $page = window.location.pathname;
var app = angular.module('projects', ['ngSanitize', 'ngAnimate', 'checklist-model'], function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

(function () {
    app.controller('controller', function ($scope) {

        /**
         * old code
         */

        /**
         * media queries
         * $scope.apply works how I want it but it keeps causing a firebug error
         */

        enquire.register("screen and (min-width: 600px", {
            match: function () {
                if ($scope.tab.food_entries || $scope.tab.exercise_entries) {
                    $scope.changeTab('entries');
                    // $scope.$apply();
                }
            },
            unmatch: function () {
                if ($scope.tab.entries) {
                    $scope.changeTab('food_entries');
                    // $scope.$apply();
                }
            }
        });


    }); //end controller

})();