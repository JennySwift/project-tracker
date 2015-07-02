<?php namespace App\Http\Controllers;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Models\Payer;
use App\User;
use JavaScript;
use Auth;

use App\Models\Payee;
use Illuminate\Http\Request;

/**
 * Class PayeeController
 * @package App\Http\Controllers\Projects
 * @TODO These methods shouldn't exist at all, these actions should be triggered automatically by
 * @TODO another event (like first project or first contact)
 */
class PayeeController extends Controller {

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
     * Add a new payer for the user (payee)
     * so that the user can create a project with that person as payer.
     * Return the user's payers
     *
     * Actually I've moved the method to the Payee model so I may not need it here at all.
     *
     * // @TODO Should be a PUT request to /users/{user}/payers/{payer} and return the payer object.
     *
     * @param Request $request
     * @return mixed
     */
    public function addPayer(Request $request)
    {
        $payer_email = $request->get('payer_email');

        return Payee::addPayer($payer_email);
    }

    /**
     * Remove a relationship between a payee and a payer,
     * and all associated projects
     * @TODO Should be a DELETE method to /users/{user}/payers/{payer}
     * @param Request $request
     * @return mixed
     */
    public function removePayer(Request $request)
    {
        $payer = Payer::findOrFail($request->get('payer_id'));
        $payee = Payee::find(Auth::user()->id);
        //Remove the relationship between the payee and the payer
        //from the payee_payer table
        $payee->payers()->detach($payer->id);
        $payee->save();

        //Remove projects the payee had with the payer
        /**
         * @VP:
         * Is there some way I could do this instead in the migrations file,
         * like with cascade on delete?
         * @JS:
         * Nope.
         */
        $payee->projects()->where('payer_id', $payer->id)->delete();
    }
}