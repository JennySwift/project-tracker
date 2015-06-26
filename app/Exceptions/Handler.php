<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Redirect;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that should not be reported.
     *
     * @var array
     */
    protected $dontReport = [
        HttpException::class,
    ];

    /**
     * Report or log an exception.
     *
     * This is a great spot to send exceptions to Sentry, Bugsnag, etc.
     *
     * @param  \Exception  $e
     * @return void
     */
    public function report(Exception $e)
    {
        return parent::report($e);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Exception  $e
     * @return \Illuminate\Http\Response
     */
    public function render($request, Exception $e)
    {
        // Throttle package exception handler
        if ($e instanceof TooManyRequestsHttpException) {
            return Redirect::back()
                ->withInput($request->only('email', 'remember'))
                ->withErrors([
                    'email' => 'Too many failed login attempts!',
                ]);
        }

        // Model not found exception handler (app-wide)
        if ($e instanceof ModelNotFoundException) {

            // Build a "fake" instance of the model which was not found
            // and fetch the shortname of the class
            // Ex.: If we have a App\Models\Projects\Project model
            // Then if would return Project
            $model = (new \ReflectionClass($e->getModel()))->getShortName();

            // Return the 404 response :)
            return response([
                'error' => "{$model} not found.",
                'status' => Response::HTTP_NOT_FOUND
            ], Response::HTTP_NOT_FOUND);
        }

        return parent::render($request, $e);
    }
}









