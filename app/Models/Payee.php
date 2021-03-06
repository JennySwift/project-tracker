<?php namespace App\Models;

use App\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * Class Payee
 * @package App\Models\Projects
 */
class Payee extends User
{

    /**
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function payers()
    {
        return $this->belongsToMany('App\User', 'payee_payer', 'payee_id', 'payer_id');
    }

    /**
     * Get all the projects where the user is the payee
     */
    public function projects()
    {
        return $this->hasMany('App\Models\Project', 'payee_id');
    }

    /**
     * Get all the projects where the user is the payee
     * and the project has been confirmed
     */
    public function confirmedProjects()
    {
        return $this->hasMany('App\Models\Project', 'payee_id')
            ->where('status', 'confirmed');
    }

    /**
     * Get all the projects where the user is the payee
     * and the project has been declined
     */
    public function declinedProjects()
    {
        return $this->hasMany('App\Models\Project', 'payee_id')
            ->where('status', 'declined');
    }


    public static function addPayer($payer_email)
    {
        // @TODO This step could be improved to remove the double-query effect
        $user = Auth::user();
        $payee = Payee::findOrFail($user->id);

        $payer = Payer::whereEmail($payer_email)->firstOrFail();

        $payee->payers()->attach($payer->id);
        $payee->save();

        return $payee->payers;
    }

}
