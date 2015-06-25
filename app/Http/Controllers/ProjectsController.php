<?php namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests;
use App\Http\Requests\CreateProjectRequest;
use App\Models\Payee;
use App\Models\Project;
use App\Repositories\ProjectsRepository;
use Auth;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use JavaScript;

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

//        $payer_email = $request->get('payer_email');
//        $description = $request->get('description');
//        $rate = $request->get('rate');

        // @TODO Remember to update your Angular app to add the new project to the array of projects
        // @TODO Fix the error handling in Angular now that you have validation (check for status code 422)
        return $this->projectsRepository->createProject(
            $request->get('payer_email'),
            $request->get('description'),
            $request->get('rate')
        );

//        $payee = Payee::find(Auth::user()->id);
//
//        return $payee->projects;
    }

    /**
     * Delete a project (only when user is the payee)
     * @param $id
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    public function destroy($id)
    {
//        try{
        /**
         * @see http://laravel.com/docs/5.0/errors#handling-errors
         */
        $project = Project::whereUserIsPayee()->findOrFail($id);
//        }
//        catch(ModelNotFoundException $e) {
//            return response([
//                'error' => 'Model not found.',
//                'status' => Response::HTTP_NOT_FOUND
//            ], Response::HTTP_NOT_FOUND);
//        }

//        if(is_null($project)) {
//            return response([
//                'error' => 'Project not found.',
//                'status' => 404
//            ], 404);
//        }

        $project->delete();

        return response(null, Response::HTTP_NO_CONTENT);
    }
}
