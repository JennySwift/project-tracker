<div class="angucomplete-container">

    <input ng-model="inputValue" ng-focus="search()" ng-blur="hideDropdown()" ng-keyup="autocomplete($event.keyCode)" type="text" placeholder="[[placeholder]]"/>

    <div class="angucomplete-dropdown" ng-show="showDropdown">
        <div ng-repeat="result in results" ng-mousedown="chooseItem($index)" ng-mouseover="hoverItem($index)" ng-class="{'angucomplete-selected-item': $index == currentIndex}" class="angucomplete-dropdown-item">
            <div ng-bind-html="result.html"></div>
        </div>

    </div>

</div>