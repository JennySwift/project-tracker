<?php 

namespace App\Transformers\Timer;

use App\Models\Timer;
use League\Fractal\TransformerAbstract;

/**
 * Class StopProjectTimerTransformer
 * @package App\Transformers\Timer
 */
class StopProjectTimerTransformer extends TransformerAbstract
{
    /**
     * Transform :)
     * @param Timer $timer
     * @return array
     */
    public function transform(Timer $timer) {
        return [
            'id' => (int) $timer->id,
            'start' => $timer->formattedStart,
            'finish' => $timer->formattedFinish,
            'price' => $timer->calculatePrice(),
            'time' => $timer->formattedTime,
            'project' => [
                'id' => $timer->project->id,
                'price' => $timer->project->price,
                'time' => $timer->project->totalTimeFormatted
            ],
            'payer' => [
                'id' => $timer->project->payer->id,
                'owed' => $timer->project->payer->owedToUser
            ]
        ];
    }

}