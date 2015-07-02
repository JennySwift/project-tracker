<?php namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests;
use App\Http\Requests\CreateProjectRequest;
use App\Models\Notification;
use App\Models\Payee;
use App\Models\Project;
use App\Repositories\ProjectsRepository;
use Auth;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use JavaScript;
use Debugbar;
use Pusher;
use Symfony\Component\Debug\Debug;

/**
 * Class ProjectsController
 * @TODO Model binding could make the show and destroy methods even simpler :)
 * @package App\Http\Controllers\Projects
 */
class ProjectsController extends Controller
{

    /**
     * @var ProjectsRepository
     */
    protected $projectsRepository;

    /**
     * Create a new controller instance.
     *
     * @param ProjectsRepository $projectsRepository
     * @return void
     */
    public function __construct(ProjectsRepository $projectsRepository)
    {
        $this->projectsRepository = $projectsRepository;

        $this->middleware('auth');
    }

    /**
     * Show a specific project
     * @param $id
     * @return mixed
     */
    public function show($id)
    {
        // $project = Project::with('timers')->findOrFail($id);

        // This return the first project in the database, not the project with the $id.
        // Query methods (with, first, find, where, etc.) should be called from the facade (Project::)
        // not on the object ($project)
        // return $project->with('timers')->first();

        return Project::with('timers')->findOrFail($id);
    }

    /**
     * Insert a new project
     * Return projects
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function store(CreateProjectRequest $request)
    {
        $payer_email = $request->get('payer_email');

        //Check if the email is for a new payer, rather than a previous payer of the payee.
        //If it is, add the row to the payee_payer pivot table before creating the project.
        //Todo: If it is a new payer, do the appropriate validation errors
        //todo: (different for if the new payer email field is blank vs the previous payer input)
        if ($request->get('new_payer')) {
            Payee::addPayer($payer_email);
        }

        //Create the project
        return $this->projectsRepository->createProject(
            $payer_email,
            $request->get('description'),
            $request->get('rate')
        );
    }

    /**
     * Update the project.
     * Set confirmed to 1.
     * @param $id
     * @return mixed
     */
    public function update($id)
    {
        $project = Project::find($id);
        $project->status = 'confirmed';
        $project->save();

        $message = $project->payer->name . ' has confirmed your project ' . $project->description . '!';

        //Create a notification in the database for the payee, in case they are not currently logged in
        $notification = new Notification([
            'message' => $message
        ]);

        $notification->user()->associate($project->payee->id);
        $notification->save();




        //Pusher
        $pusher = new Pusher(env('PUSHER_PUBLIC_KEY'), env('PUSHER_SECRET_KEY'), env('PUSHER_APP_ID'));

        $data = [
            'payee_id' => $project->payee->id,
            'notification' => $notification,
            'project' => $project
        ];

        $pusher->trigger('channel', 'confirmProject', $data);

        return $project;
    }

    /**
     * Todo: This could do with some work I guess.
     * @param Request $request
     */
    public function declineNewProject(Request $request)
    {
        //Find the project
        $id = (int) $request->get('project')['id'];
        $project = Project::find($id);
        $project->status = 'declined';
        $project->save();

//        //Pusher
        $pusher = new Pusher(env('PUSHER_PUBLIC_KEY'), env('PUSHER_SECRET_KEY'), env('PUSHER_APP_ID'));

        $data = [
            'payee_id' => $project->payee->id,
            'project' => $project,
            'message' => $project->payer->name . ' has rejected your project ' . $project->description . '!'
        ];

        $pusher->trigger('channel', 'declineProject', $data);
    }

    /**
     * Delete a project (only when user is the payee)
     * @param $id
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    public function destroy($id)
    {
        $project = Project::whereUserIsPayee()->findOrFail($id);

        $project->delete();

        return response(null, Response::HTTP_NO_CONTENT);
    }
}
