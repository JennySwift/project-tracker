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
        return $this->hasMany('App\Models\Projects\Project', 'payee_id');
    }

}