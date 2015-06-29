<?php

use App\Models\Notification;
use App\Models\Project;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Notification::truncate();

        $project = Project::where('payee_id', 4)
            ->where('payer_id', 1)
            ->first();

//        dd($project->rate_per_hour);

//        $data = [
//            'payee_id' => 4,
//            'payer_id' => 1,
//            'project' => $project,
//            'message' => 'John would like to start a new project with you, with the description \'' . $project->description . ',\' and at $' . $project->rate_per_hour . '/hour. Is this ok?'
//        ];
//
//        Notification::create([
//            'user_id' => 1,
//            'message' => 'John would like to start a new project with you, with the description "something", and at $40/hour. Is this ok?'
//        ]);
    }

}

