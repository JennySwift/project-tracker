;(function(){
    'use strict';
    angular
        .module('projects')
        .directive('autocompleteJenny', autocomplete);

    /* @inject */
    function autocomplete($parse, $http, $sce, $timeout) {
        return {
            restrict: 'EA',
            scope: {
                "id": "@id",
                "placeholder": "@placeholder",
                "selectedObject": "=selectedobject",
                "url": "@url",
                "dataField": "@datafield",
                "titleField": "@titlefield",
                "userPause": "@pause",
                "localData": "=localdata",
                "searchFields": "@searchfields",
                "minLengthUser": "@minlength",
                "matchClass": "@matchclass",
                "width" : "@width",
                "queryDatabase": "@querydatabase",
                "payers": "=payers"
            },
            templateUrl: 'js/directives/MyAutocompleteTemplate.php',
            link: function($scope, elem, attrs) {
                $scope.currentIndex = 1;
                $scope.showDropdown = false;
                $scope.inputValue = '';

                /**
                 * Act on keypress for input field
                 * @param $keycode
                 * @returns {boolean}
                 */
                $scope.autocomplete = function ($keycode) {
                    if ($keycode === 13) {
                        //enter is pressed
                        $scope.chooseItem();
                    }
                    else if ($keycode === 38) {
                        //up arrow is pressed
                        if ($scope.currentIndex > 0) {
                            $scope.currentIndex--;
                        }
                    }
                    else if ($keycode === 40) {
                        //down arrow is pressed
                        if ($scope.currentIndex + 1 < $scope.results.length) {
                            $scope.currentIndex++;
                        }
                    }
                    else {
                        //Not enter, up or down arrow
                        $scope.search();
                    }
                };

                /**
                 * Fill the input field with the chosen item from the dropdown.
                 * It can be chosen by pressing enter, or by clicking.
                 */
                $scope.chooseItem = function ($index) {
                    var $input_field = elem.find('input');

                    if ($index !== undefined) {
                        //Item was chosen by clicking, not by pressing enter
                        $scope.currentIndex = $index;
                    }

                    //Fill the input field with the correct value to complete the autocomplete
                    $($input_field).val($scope.results[$scope.currentIndex].name);
                    $scope.inputValue = $scope.results[$scope.currentIndex].name;

                    //Hide the dropdown
                    $scope.hideDropdown();
                };

                $scope.hideDropdown = function () {
                    $scope.showDropdown = false;
                };

                /**
                 * Search the database or the JS data
                 */
                $scope.search = function () {
                    if ($scope.queryDatabase && $scope.queryDatabase !== 'false') {
                        $scope.searchDatabase();
                    }
                    else {
                        $scope.searchLocal();
                    }
                };

                /**
                 * Search JS data
                 */
                $scope.searchLocal = function () {
                    var $results = _.filter($scope.payers, function ($payer) {
                        return $payer.name.toLowerCase().indexOf($scope.inputValue.toLowerCase()) !== -1;
                    });
                    $scope.dealWithResults($results);
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

                /**
                 * We have the data, from either the database or the JS. Deal with it.
                 * @param $results
                 */
                $scope.dealWithResults = function ($results) {
                    //Highlight the letters that match what has been typed
                    $results = $scope.highlightLetters($results);
                    //Populate the dropdown
                    $scope.results = $results;
                    //Show the dropdown
                    $scope.showDropdown = true;
                    //Select the first item
                    $scope.currentIndex = 0;
                };

                $scope.highlightLetters = function ($response) {
                    //if (!$scope.inputValue) {
                    //    $scope.inputValue = '';
                    //}

                    var $typing = $scope.inputValue.toLowerCase();

                    for (var i = 0; i < $response.length; i++) {
                        var $name = $response[i].name;
                        var $index = $name.toLowerCase().indexOf($typing);
                        var $substr = $name.substr($index, $typing.length);
                        var $html = $name.replace($substr, '<span class="highlight">' + $substr + '</span>');
                        $response[i].html = $html;
                    }
                    return $response;
                };

                //Todo: get hover working on Chrome

                //$scope.hoverItem = function(index) {
                //    $scope.currentIndex = index;
                //};
                //
                //elem.on('mouseover', function () {
                //    console.log('worked');
                //});
            }
        };
    }
}).call(this);

