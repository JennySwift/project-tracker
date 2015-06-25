<?php

use App\Models\Payer;
use App\Models\Project;
use App\Models\Timer;

/**
 * Views
 */

//test
//Route::any('/test', function()
//{
//    $pusher = new Pusher(env('PUSHER_PUBLIC_KEY'), env('PUSHER_SECRET_KEY'), env('PUSHER_APP_ID'));
//
//    $channel = 'testChannel';
//    $event = 'testEvent';
//    $data = ['It works!'];
//
//    $pusher->trigger($channel, $event, $data);
//});

Route::get('/test', function()
{
    return Project::find(2);
});

//Projects
//Route::get('projects', ['as' => 'projects', 'uses' => 'PagesController@index']);
Route::get('payee', ['as' => 'payee', 'uses' => 'PagesController@payee']);
Route::get('payer', ['as' => 'payer', 'uses' => 'PagesController@payer']);

//Credits
Route::get('/credits', function()
{
    return view('credits');
});

/**
 * Laravel 5.1 Authentication
 * Not sure if I'm supposed to use these.
 * They are from the 5.1 docs but it seems to work without them.
 */

// Authentication routes...
//Route::get('auth/login', 'Auth\AuthController@getLogin');
//Route::post('auth/login', 'Auth\AuthController@postLogin');
//Route::get('auth/logout', 'Auth\AuthController@getLogout');

// Registration routes...
//Route::get('auth/register', 'Auth\AuthController@getRegister');
//Route::post('auth/register', 'Auth\AuthController@postRegister');

/**
 * Authentication
 */

Route::group(['prefix' => 'auth', 'namespace' => 'Auth'], function(){

    Route::group(['middleware' => 'guest'], function(){
        // Login
        Route::get('login', ['as' => 'auth.login', 'uses' => 'AuthController@getLogin']);
        Route::post('login', ['as' => 'auth.login.store', 'before' => 'throttle:2,60', 'uses' => 'AuthController@postLogin']);

        // Register
        Route::get('register', ['as' => 'auth.register', 'uses' => 'AuthController@getRegister']);
        Route::post('register', ['as' => 'auth.register.store', 'uses' => 'AuthController@postRegister']);
    });

    Route::group(['middleware' => 'auth'], function(){
        // Logout
        Route::get('logout', ['as' => 'auth.logout', 'uses' => 'AuthController@getLogout']);
    });

});

Route::controllers([
    // 'auth' => 'Auth\AuthController',
    'password' => 'Auth\PasswordController',
]);

/**
 * Bindings
 */

/**
 * Resources
 */

Route::resource('projects', 'ProjectsController', ['only' => ['show', 'store', 'destroy']]);
Route::resource('payee', 'PayeeController', ['only' => ['store', 'destroy']]);
Route::resource('payer', 'PayerController', ['only' => ['store', 'destroy']]);
Route::resource('timers', 'TimersController', ['only' => ['destroy']]);

/**
 * Ajax
 */

/**
 * Projects
 */

Route::post('insert/startProjectTimer', 'TimersController@startProjectTimer');
// @TODO Should be in a UserPayeeController (Route::resource('users.payees'))
// http://laravel.com/docs/5.0/controllers#restful-resource-controllers
Route::post('insert/payer', 'PayeeController@addPayer');
// Same as insert/payer but destroy method this time :)
Route::post('delete/payer', 'PayeeController@removePayer');
Route::post('update/markAsPaid', 'TimersController@markAsPaid');
Route::post('update/stopProjectTimer', 'TimersController@stopProjectTimer');






