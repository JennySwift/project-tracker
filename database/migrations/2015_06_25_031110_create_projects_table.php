<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProjectsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('projects', function(Blueprint $table)
        {
            $table->increments('id');
            $table->integer('payee_id')->unsigned()->index();
            $table->integer('payer_id')->unsigned()->nullable()->index();
            $table->string('description');
            $table->decimal('rate_per_hour', 10, 2)->nullable();
            $table->boolean('confirmed')->default(0)->index();
            $table->timestamps();

            $table->foreign('payer_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('payee_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('projects');
    }
}
