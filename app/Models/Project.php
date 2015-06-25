<?php namespace App\Models;

use Auth;
use App\Repositories\ProjectsRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Response;

/**
 * Class Project
 * @package App\Models\Projects
 */
class Project extends Model {

    /**
     * @var array
     */
    protected $fillable = ['description', 'rate_per_hour'];

    /**
     * @var array
     */
    protected $appends = ['price', 'formatted_price', 'total_time', 'total_time_formatted', 'path'];

    /**
     * @var array
     */
    protected $with = ['payer', 'payee'];

    /**
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function payer()
    {
        return $this->belongsTo('App\User');
    }

    /**
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function payee()
    {
        return $this->belongsTo('App\User');
    }

    /**
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function timers()
    {
        return $this->hasMany('App\Models\Timer');
    }

    /**
     * Return the URL of the project
     * it needs to be called getFieldAttribute
     * @return string
     */
    public function getPathAttribute()
    {
        return route('projects.show', $this->id);
    }

    /**
     * Return the price for the project
     * This method needs to be called getFieldAttribute
     * @return string
     */
    public function getPriceAttribute()
    {
        // @TODO Try to abstract this logic, since you are using it in multiple places
//        $rate = $this->rate_per_hour;
//        $time = $this->total_time;
//        $price = 0;
//
//        if ($time['seconds'] > 30) {
//            $time['minutes'] = $time['minutes'] + 1;
//        }
//
//        $price+= $rate * $time['hours'];
//        $price+= $rate / 60 * $time['minutes'];

        //Get the ids of the timers that belong to the project
        $timer_ids = Timer::where('project_id', $this->id)->lists('id');

        //Get the sum of all the timers that belong to the project
        $price = Timer::whereIn('id', $timer_ids)->sum('price');

        /**
         * @VP:
         * Why is sum returning a string here? I want it to be a decimal.
         */

        return $price;
    }

    /**
     * Format price to two decimal places for displaying to the user
     * @return float|int|mixed
     */
    public function getFormattedPriceAttribute()
    {
        //return $this->price;
        return number_format($this->price, 2);
    }

    /**
     * Return the total time for the project
     * This method needs to be called getFieldAttribute
     * @return string
     */
    public function getTotalTimeAttribute()
    {
        $hours = 0;
        $minutes = 0;
        $seconds = 0;

        //I am using ->timers()->get() instead of ->timers to prevent
        //all the timers from being attached to the project (unnecessary data)
        foreach ($this->timers()->get() as $timer) {
            //Calculate hours, minutes and seconds
            $hours+= $timer->time->h;
            $minutes+= $timer->time->i;
            $seconds+= $timer->time->s;
        }

        //Stop total seconds from going above 59
        if ($seconds > 59) {
            $minutes+= floor($seconds / 60);
            $seconds = $seconds % 60;
        }

        //Stop total minutes from going above 59
        if ($minutes > 59) {
            $hours+= floor($minutes / 60);
            $minutes = $minutes % 60;
        }

        $time = [
            'hours' => $hours,
            'minutes' => $minutes,
            'seconds' => $seconds
        ];

        return $time;
    }

    /**
     *
     * @return array
     */
    public function getTotalTimeFormattedAttribute()
    {
        $formatted = [
            'hours' => sprintf("%02d", $this->total_time['hours']),
            'minutes' => sprintf("%02d", $this->total_time['minutes']),
            'seconds' => sprintf("%02d", $this->total_time['seconds'])
        ];

        return $formatted;
    }

    /**
     * Fetch only when current user is payee
     * This method needs to start with "scope" and then the name of the
     * method in CamelCase.
     * The query parameter is passed automatically to the method by Laravel
     * Any other parameter that you would create, you will have to pass them yourself to the method.
     *
     * @see http://laravel.com/docs/5.1/eloquent#query-scopes
     * @param $query
     * @return mixed
     */
    public function scopeWhereUserIsPayee($query)
    {
        // Get the current user
        $user = Auth::user();

        // Limit the query to records where the user is payee
        $query->wherePayeeId($user->id);

        // Return the query
        return $query;
    }

}

