<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePayeePayerPivotTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('payee_payer', function(Blueprint $table)
        {
            $table->integer('payee_id')->unsigned()->index();
            $table->integer('payer_id')->unsigned()->index();

            $table->foreign('payee_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('payer_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('payee_payer');
    }
}
