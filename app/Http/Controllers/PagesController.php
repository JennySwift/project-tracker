<?php namespace App\Http\Controllers;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Models\Payee;
use App\Models\Payer;
use Carbon\Carbon;
use JavaScript;
use Auth;

use Illuminate\Http\Request;

/**
 * Class PagesController
 * @package App\Http\Controllers
 */
class PagesController extends Controller {

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     *
     * @return \Illuminate\View\View
     */
    public function payee()
    {
        $payee = Payee::find(Auth::user()->id);

        JavaScript::put([
            'payee_projects' => $payee->projects->toArray(),
            'payers' => $payee->payers->toArray(),
        ]);

        return view('payee');
    }

    /**
     *
     * @return \Illuminate\View\View
     */
    public function payer()
    {
        //I got an error with the package if
        //I didn't put $pusher_public_key into a variable first
        $pusher_public_key = env('PUSHER_PUBLIC_KEY');
        $payer = Payer::find(Auth::user()->id);

        JavaScript::put([
            'payer_projects' => $payer->projects->toArray(),
            'payees' => $payer->payees->toArray(),
            'me' => Auth::user(),
            'pusher_public_key' => $pusher_public_key
        ]);

        return view('payer');
    }

}