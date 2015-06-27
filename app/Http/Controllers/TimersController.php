<?php namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests;
use App\Models\Payee;
use App\Models\Payer;
use App\Models\Project;
use App\Models\Timer;
use App\Repositories\ProjectsRepository;
use App\Transformers\Timer\MarkAsPaidTransformer;
use App\Transformers\Timer\StopProjectTimerTransformer;
use Auth;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use League\Fractal\Manager;
use League\Fractal\Resource\Item;
use League\Fractal\Serializer\ArraySerializer;
use Pusher;

/**
 * Class TimersController
 * @package App\Http\Controllers\Projects
 */
class TimersController extends Controller
{

    /**
     * Create a new controller instance.
     *
     * @param ProjectsRepository $projectsRepository
     */
    public function __construct(ProjectsRepository $projectsRepository)
    {
        $this->projectsRepository = $projectsRepository;
    }

    /**
     * Mark all timers that belong to the user (payee),
     * and are with a certain payer, as paid
     *
     * WARNING: Be careful, method not Restful! (Should be PUT /timers/{timer})
     *
     * @param Request $request
     */
    public function markAsPaid(Request $request)
    {
        $payer = Payer::findOrFail($request->get('payer_id'));
        $payee = Payee::find(Auth::user()->id);

        $project_ids = $payee->projects()
            ->where('payer_id', $payer->id)
            ->lists('id');

        Timer::whereIn('project_id', $project_ids)
            ->where('paid', 0)
            ->update([
                'paid' => 1,
                'time_of_payment' => Carbon::now()
            ]);

        // @TODO Return collection of timers that have been modified
    }

    /**
     * Insert a new timer for a project.
     * Return all the projects,
     * as well as the project that is currently displaying in the project popup
     *
     * WARNING: Be careful, method not Restful! Should be a POST request to /projects/{project}/timers
     * and return the timer newly created :) (So it should be in a ProjectTimersController,
     * store method, not the TimersController). You could also use Model Binding on projects to fetch the project model right away and pass
     * it as a parameter.
     *
     * @param Request $request
     * @return array
     */
    public function startProjectTimer(Request $request)
    {
        $project = Project::find($request->get('project_id'));
        $timer = Timer::create([
            'project_id' => $project->id,
            'start' => Carbon::now()->toDateTimeString()
        ]);

//        Currently:
//        {
//            'project_id': 1,
//            ...
//        }
//
//        Ideal:
//        {
//            'project' => {
//                'id' => 1,
//                'path'
//            }
//        }

        //Pusher
        $pusher = new Pusher(env('PUSHER_PUBLIC_KEY'), env('PUSHER_SECRET_KEY'), env('PUSHER_APP_ID'));

        $data = [
            'payer_id' => $project->payer_id,
            'message' => Auth::user()->name . ' has started a new timer on the project ' . $project->description
        ];

        $pusher->trigger('timerChannel', 'startTimer', $data);

        return $this->responseCreated($timer);
    }

    /**
     * Stop the timer (update it).
     * Return all the projects,
     * as well as the project that is currently displaying in the project popup
     * @param Request $request
     * @return mixed
     */
    public function stopProjectTimer(Request $request)
    {
        // Fetch the required data
        $project = Project::find($request->get('project_id'));
        $last_timer_id = Timer::where('project_id', $project->id)->max('id');
        $timer = Timer::find($last_timer_id);

        // Update the data (Price will be zero if time is less than 30 seconds)
        $timer->finish = Carbon::now()->toDateTimeString();
        $timer->save();

        $timer->calculatePrice();

        //Pusher
        $pusher = new Pusher(env('PUSHER_PUBLIC_KEY'), env('PUSHER_SECRET_KEY'), env('PUSHER_APP_ID'));

        $data = [
            'payer_id' => $project->payer_id,
            'message' => Auth::user()->name . ' has stopped the timer on the project ' . $project->description . '.'
        ];

        $pusher->trigger('timerChannel', 'stopTimer', $data);

        // Create the fractal manager
        // @TODO: You could extract the next two lines to a ServiceProvider
        $fractal = new Manager();
        $fractal->setSerializer(new ArraySerializer);

        // Create an item with fractal
        $resource = new Item($timer, new StopProjectTimerTransformer);
        // $this->createItem(Model, transofrmer)
        // $this->createCollection(Model, transofrmer)

        // Send a response
        return response()->json($fractal->createData($resource)->toArray());

//        return $this->responseOk($timer);
    }

//    /**
//     *
//     * @param $start
//     * @param $finish
//     * @return bool|\DateInterval
//     */
//    private function calculateTimerTime($start, $finish)
//    {
//        $carbon_start = Carbon::createFromFormat('Y-m-d H:i:s', $start);
//        $carbon_finish = Carbon::createFromFormat('Y-m-d H:i:s', $finish);
//        $time = $carbon_finish->diff($carbon_start);
//
//        return $time;
//    }

//    /**
//     *
//     * @param $time
//     * @param $rate
//     * @return float|int
//     */
//    private function getTimerPrice($time, $rate)
//    {
//        $price = 0;
//
//        if ($time->s > 30) {
//            $time->i = $time->i + 1;
//        }
//        $price += $rate * $time->h;
//        $price += $rate / 60 * $time->i;
//
//        return $price;
//    }

    /**
     * Delete a timer
     * @param Request $request
     * @param $id
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    public function destroy(Request $request, $id)
    {
        $timer = Timer::findOrFail($id);

        $timer->delete();

        return $this->responseNoContent();
    }
}