/**
 * Autocomplete
 * Autocomplete Main Driver Controller
 * Purpose: This controller would work as container for autocomplete directive If we 
            are dealing with local  data, As we have provided localdata as an optional field 
            to work with, so in that situation directive should be placed explicitly under diff 
            controller for preventing data conflict.
 * By John Doe ( Nishant ) :p
 */

;(function(){
      'use strict';

      angular.module('projects')
            .controller('FoodController', ['$scope', '$http',
                function FoodController($scope, $http) {
                  // Some Logic You would like to place here
                }
            ]).controller('ExcerciseController', ['$scope', '$http',
                function ExcerciseController($scope, $http) {
                  // Some Logic You would like to place here
                }
            ]);

}).call(this);
