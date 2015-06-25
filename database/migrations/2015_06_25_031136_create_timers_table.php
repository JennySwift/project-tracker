<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTimersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('timers', function(Blueprint $table)
        {
            $table->increments('id');
            $table->integer('project_id')->unsigned()->index();
            $table->timestamp('start');
            $table->timestamp('finish')->nullable();
            $table->decimal('price', 10, 2)->index()->nullable();
            $table->boolean('paid')->default(0)->nullable()->index();
            $table->timestamp('time_of_payment')->nullable()->index();

            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('timers');
    }
}
