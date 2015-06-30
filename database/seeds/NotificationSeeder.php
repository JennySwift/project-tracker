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

//        Notification::create([
//            'user_id' => 4,
//            'message' => 'Jenny has confirmed your project!'
//        ]);
    }

}

