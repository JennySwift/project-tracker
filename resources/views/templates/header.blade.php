
<ul id="navbar" style="z-index:1000">
    <li id="menu-dropdown" class="dropdown">
        <a href="#" class="dropdown-toggle fa fa-bars" data-toggle="dropdown"><span class="caret"></span></a>
        <ul class="dropdown-menu" role="menu">
            <li><a href="/auth/logout">Logout <?php echo Auth::user()->name; ?></a></li>
            <li><a href="#" style="cursor:default">branch:master</a></li>
            <li><a href="/credits">credits</a></li>
        </ul>
    </li>

    <li id="menu-dropdown" class="dropdown">
        <a href="#" class="dropdown-toggle fa fa-clock-o" data-toggle="dropdown"><span class="caret"></span></a>
        <ul class="dropdown-menu" role="menu">
            <li><a href="{{route('payee')}}">Payee</a></li>
            <li><a href="{{route('payer')}}">Payer</a></li>
        </ul>
    </li>

    <li>
        <span>[[me.name]]</span>
        <img ng-src="[[me.gravatar]]" class="gravatar">
    </li>

</ul>

