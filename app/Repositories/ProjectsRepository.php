<?php namespace App\Repositories;

use Auth;
use Carbon\Carbon;
use Gravatar;

use App\User;
use App\Models\Project;
use Illuminate\Support\Facades\DB;

/**
 * Class ProjectsRepository
 * @package App\Repositories\Projects
 */
class ProjectsRepository
{
    /**
     *
     * @return array
     */
//    public function getProjectsArrayForCurrentUser()
//    {
//        $user = Auth::user();
//        $payer = $user;
//        $payee = $user;
//
//        return [
//            'payee' => $payee->projects, // This is a Illuminate\Database\Eloquent\Object
//            'payer' => $payer->projects
//        ];
//    }

    /**
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
//    public function getProjectsResponseForCurrentUser()
//    {
//        return response()->json($this->getProjectsArrayForCurrentUser());
//    }

    /**
     * For updating the timers in the project popup,
     * when the user starts and stops a timer.
     * Get the project that the user has selected.
     * @return mixed
     */
//    public function getProject($project_id)
//    {
//        $project = Project::find($project_id)
//            ->with('payee')
//            ->with('payer')
//            ->with('timers')
//            ->first();
//        $project->total_time_user_formatted = $this->formatTimeForUser($project->total_time);
//
//        return $project;
//    }

    /**
     *
     * @param $time
     * @return array
     */
    public function formatTimeForUser($time)
    {
        $formatted = [
            'hours' => sprintf("%02d", $time['hours']),
            'minutes' => sprintf("%02d", $time['minutes']),
            'seconds' => sprintf("%02d", $time['seconds'])
        ];

        return $formatted;
    }

    /**
     *
     * @param $payer_email
     * @param $description
     * @param $rate
     * @return Project
     */
    public function createProject($payer_email, $description, $rate)
    {
        $project = new Project([
            'description' => $description,
            'rate_per_hour' => $rate
        ]);

        // @TODO Check if the user was added as payer before!! :)
        $payer = User::whereEmail($payer_email)->firstOrFail();
        $payee = Auth::user();

        $project->payer()->associate($payer);
        $project->payee()->associate($payee);
        $project->save();

        return $project;
    }
}