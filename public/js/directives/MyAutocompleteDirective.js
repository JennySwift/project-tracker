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
                "postRequestUser": "@postrequest"
            },
            templateUrl: 'js/directives/MyAutocompleteTemplate.php',
            link: function($scope, elem, attrs) {
                $scope.currentIndex = 1;
                $scope.showDropdown = false;

                /**
                 * Act on keypress for input field
                 * @param $keycode
                 * @returns {boolean}
                 */
                $scope.autocomplete = function ($keycode) {
                    if ($keycode === 13) {
                        //enter is pressed

                        //Fill the input field with the correct value to complete the autocomplete
                        var $input_field = elem.find('input');
                        $($input_field).val($scope.results[$scope.currentIndex].name);
                        $scope.autocomplete.payers = $scope.results[$scope.currentIndex].name;

                        //Hide the dropdown
                        $scope.showDropdown = false;
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
                 * Query the database
                 */
                $scope.search = function () {
                    var $data = {
                        typing: $scope.autocomplete.payer
                    };

                    $http.post($scope.url, $data).
                        success(function(response, status, headers, config) {
                            //Highlight the letters that match what has been typed
                            response = $scope.highlightLetters(response);
                            //Populate the dropdown
                            $scope.results = response;
                            //Show the dropdown
                            $scope.showDropdown = true;
                            //Select the first item
                            $scope.currentIndex = 0;
                        }).
                        error(function(data, status, headers, config) {
                            //todo: Can I access my provideFeedback method in my controller from here?
                            console.log("There was an error");
                        });
                };

                $scope.highlightLetters = function ($response) {
                    var $typing = $scope.autocomplete.payer.toLowerCase();

                    for (var i = 0; i < $response.length; i++) {
                        var $name = $response[i].name;
                        var $index = $name.toLowerCase().indexOf($typing);
                        var $substr = $name.substr($index, $typing.length);
                        var $html = $name.replace($substr, '<span class="highlight">' + $substr + '</span>');
                        $response[i].name = $html;
                    }
                    return $response;
                };

                //todo: add extra functionality like Nishant did, such as highlighting the matched part of the result

                //$scope.hoverItem = function(index) {
                //    $scope.currentIndex = index;
                //};
                //
                //elem.on('mouseover', function () {
                //    console.log('worked');
                //});





            /**
             * Nishant's code
             */

            //    $scope.lastSearchTerm = null;
            //    $scope.currentIndex = null;
            //    $scope.justChanged = false;
            //    $scope.searchTimer = null;
            //    $scope.hideTimer = null;
            //    $scope.searching = false;
            //    $scope.pause = 500;
            //    $scope.minLength = 3;
            //    $scope.searchStr = null;
            //    $scope.postRequest = 'false';
            //
            //    if ($scope.minLengthUser && $scope.minLengthUser != "") {
            //        $scope.minLength = $scope.minLengthUser;
            //    }
            //
            //    if ($scope.userPause) {
            //        $scope.pause = $scope.userPause;
            //    }
            //
            //    if ($scope.postRequestUser && $scope.postRequestUser != "") {
            //        $scope.postRequest = $scope.postRequestUser;
            //    }
            //
            //    var isNewSearchNeeded = function(newTerm, oldTerm) {
            //        return newTerm.length >= $scope.minLength && newTerm != oldTerm
            //    }
            //
            //    $scope.processResults = function(responseData, str) {
            //        if (responseData && responseData.length > 0) {
            //            $scope.results = [];
            //
            //            var titleFields = [];
            //            if ($scope.titleField && $scope.titleField != "") {
            //                titleFields = $scope.titleField.split(",");
            //            }
            //
            //            for (var i = 0; i < responseData.length; i++) {
            //                // Get title variables
            //                var titleCode = [];
            //
            //                for (var t = 0; t < titleFields.length; t++) {
            //                    titleCode.push(responseData[i][titleFields[t]]);
            //                }
            //
            //                var text = titleCode.join(' ');
            //
            //                if ($scope.matchClass) {
            //                    var re = new RegExp(str, 'i');
            //                    var strPart = text.match(re)[0];
            //                    text = $sce.trustAsHtml(text.replace(re, '<span class="'+ $scope.matchClass +'">'+ strPart +'</span>'));
            //                }
            //
            //                var resultRow = {
            //                    title: text,
            //                    originalObject: responseData[i]
            //                }
            //
            //
            //                $scope.results[$scope.results.length] = resultRow;
            //            }
            //
            //
            //        } else {
            //            $scope.results = [];
            //        }
            //    }
            //
            //    $scope.searchTimerComplete = function(str) {
            //        // Begin the search
            //
            //        if (str.length >= $scope.minLength) {
            //            if ($scope.localData) {
            //                var searchFields = $scope.searchFields.split(",");
            //
            //                var matches = [];
            //
            //                for (var i = 0; i < $scope.localData.length; i++) {
            //                    var match = false;
            //
            //                    for (var s = 0; s < searchFields.length; s++) {
            //                        match = match || (typeof $scope.localData[i][searchFields[s]] === 'string' && typeof str === 'string' && $scope.localData[i][searchFields[s]].toLowerCase().indexOf(str.toLowerCase()) >= 0);
            //                    }
            //
            //                    if (match) {
            //                        matches[matches.length] = $scope.localData[i];
            //                    }
            //                }
            //
            //                $scope.searching = false;
            //                $scope.processResults(matches, str);
            //
            //            } else {
            //
            //                if($scope.postRequest === 'true') {
            //                    $http.post($scope.url, {typing : str}).
            //                        success(function(responseData, status, headers, config) {
            //                            $scope.searching = false;
            //                            $scope.processResults((($scope.dataField) ? responseData[$scope.dataField] : responseData ), str);
            //                        }).
            //                        error(function(data, status, headers, config) {
            //                            console.log("Some error occur while processing your request");
            //                        });
            //                } else {
            //                    $http.get($scope.url + str, {}).
            //                        success(function(responseData, status, headers, config) {
            //                            $scope.searching = false;
            //                            $scope.processResults((($scope.dataField) ? responseData[$scope.dataField] : responseData ), str);
            //                        }).
            //                        error(function(data, status, headers, config) {
            //                            console.log("Some error occur while processing your request");
            //                        });
            //                }
            //
            //            }
            //        }
            //    }
            //
            //    $scope.hideResults = function() {
            //        $scope.hideTimer = $timeout(function() {
            //            $scope.showDropdown = false;
            //        }, $scope.pause);
            //    };
            //
            //    $scope.resetHideResults = function() {
            //        if($scope.hideTimer) {
            //            $timeout.cancel($scope.hideTimer);
            //        };
            //    };
            //
            //    $scope.hoverRow = function(index) {
            //        $scope.currentIndex = index;
            //    }
            //
            //    $scope.keyPressed = function(event) {
            //        if (!(event.which == 38 || event.which == 40 || event.which == 13)) {
            //            if (!$scope.searchStr || $scope.searchStr == "") {
            //                $scope.showDropdown = false;
            //                $scope.lastSearchTerm = null
            //            } else if (isNewSearchNeeded($scope.searchStr, $scope.lastSearchTerm)) {
            //                $scope.lastSearchTerm = $scope.searchStr
            //                $scope.showDropdown = true;
            //                $scope.currentIndex = 0;
            //                $scope.results = [];
            //
            //                if ($scope.searchTimer) {
            //                    $timeout.cancel($scope.searchTimer);
            //                }
            //
            //                $scope.searching = true;
            //
            //                $scope.searchTimer = $timeout(function() {
            //                    $scope.searchTimerComplete($scope.searchStr);
            //                }, $scope.pause);
            //            }
            //        } else {
            //            event.preventDefault();
            //        }
            //    }
            //
            //    $scope.selectResult = function(result) {
            //        if ($scope.matchClass) {
            //            result.title = result.title.toString().replace(/(<([^>]+)>)/ig, '');
            //        }
            //        $scope.searchStr = $scope.lastSearchTerm = result.title;
            //        $scope.selectedObject = result;
            //        $scope.showDropdown = false;
            //        $scope.results = [];
            //        //$scope.$apply();
            //    }
            //
            //    var inputField = elem.find('input');
            //
            //    if($scope.width && $scope.width !== null){
            //        inputField.css('width', $scope.width + "px");
            //    }
            //
            //    inputField.on('keyup', $scope.keyPressed);
            //
            //    elem.on("keyup", function (event) {
            //        if(event.which === 40) {
            //            if ($scope.results && ($scope.currentIndex + 1) < $scope.results.length) {
            //                $scope.currentIndex ++;
            //                $scope.$apply();
            //                event.preventDefault;
            //                event.stopPropagation();
            //            }
            //
            //            $scope.$apply();
            //        } else if(event.which == 38) {
            //            if ($scope.currentIndex >= 1) {
            //                $scope.currentIndex --;
            //                $scope.$apply();
            //                event.preventDefault;
            //                event.stopPropagation();
            //            }
            //
            //        } else if (event.which == 13) {
            //            if ($scope.results && $scope.currentIndex >= 0 && $scope.currentIndex < $scope.results.length) {
            //                $scope.selectResult($scope.results[$scope.currentIndex]);
            //                $scope.$apply();
            //                event.preventDefault;
            //                event.stopPropagation();
            //            } else {
            //                $scope.results = [];
            //                $scope.$apply();
            //                event.preventDefault;
            //                event.stopPropagation();
            //            }
            //
            //        } else if (event.which == 27) {
            //            $scope.results = [];
            //            $scope.showDropdown = false;
            //            $scope.$apply();
            //        } else if (event.which == 8) {
            //            $scope.selectedObject = null;
            //            $scope.$apply();
            //        }
            //    });
            //

            /**
             * End Nishant's code
              */
            }
        };
    }
}).call(this);

