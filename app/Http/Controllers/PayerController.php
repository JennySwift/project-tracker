<?php namespace App\Http\Controllers;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Models\Payer;
use JavaScript;
use Auth;

use Illuminate\Http\Request;

/**
 * Class PayerController
 * @package App\Http\Controllers\Projects
 */
class PayerController extends Controller {

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }
}