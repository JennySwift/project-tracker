<!--<div class="angucomplete-holder">-->
<!---->
<!--    <input ng-model="searchStr" type="text" placeholder="[[placeholder]]" onmouseup="this.select();" ng-focus="resetHideResults()" ng-blur="hideResults()" />-->
<!---->
<!--    <div class="angucomplete-dropdown" ng-if="showDropdown">-->
<!--        <div class="angucomplete-row" ng-repeat="result in results" ng-mousedown="selectResult(result)" ng-mouseover="hoverRow()" ng-class="{'angucomplete-selected-row': $index == currentIndex}">-->
<!--            <div class="angucomplete-title" ng-if="matchClass" ng-bind-html="result.title"></div>-->
<!--            <div class="angucomplete-title" ng-if="!matchClass">{{ result.title }}</div>-->
<!--        </div>-->
<!---->
<!--    </div>-->
<!---->
<!--</div>-->

<div class="angucomplete-container">

    <input ng-model="autocomplete.payer" ng-keyup="autocomplete($event.keyCode)" type="text" placeholder="[[placeholder]]"/>

    <div class="angucomplete-dropdown" ng-show="showDropdown">
        <div ng-repeat="result in results" ng-click="chooseItem($index)" ng-mouseover="hoverItem($index)" ng-class="{'angucomplete-selected-item': $index == currentIndex}" class="angucomplete-dropdown-item">
            <div ng-bind-html="result.html"></div>
        </div>

    </div>

</div>