<?php namespace App\Models;

use App\User;
use Illuminate\Database\Eloquent\Model;
use App\Models\Timer;

/**
 * Class Payer
 * @package App\Models\Projects
 */
class Payer extends User {

    /**
     * Get all the projects where the user is the payer
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function projects()
    {
        return $this->hasMany('App\Models\Project', 'payer_id');
    }

    /**
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function payees()
    {
        return $this->belongsToMany('App\User', 'payee_payer', 'payer_id', 'payee_id');
    }
}
