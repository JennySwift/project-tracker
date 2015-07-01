<?php namespace App\Http\Controllers;

use App\Http\Requests;
use App\Http\Controllers\Controller;
//use App\Services\Autocomplete\FoodsAndRecipesAutocomplete;
use App\Models\Payee;
use Illuminate\Http\Request;
use DB;
use Auth;

/**
 * Class AutocompleteController
 * @package App\Http\Controllers\Search
 */
class AutocompleteController extends Controller {

    public function payers(Request $request)
    {
        $typing = '%' . $request->get('typing') . '%';
        $payee = Payee::find(Auth::user()->id);
        return $payee->payers()->where('name', 'LIKE', $typing)->get();
    }

    /**
     * Select rows from both foods and recipes table.
     * @param Request $request
     * @return mixed
     */
    public function autocompleteMenu(Request $request)
    {
        $typing = '%' . $request->get('typing') . '%';
        $foods = $this->foods($typing);
        $recipes = $this->recipes($typing);

        //Specify whether the menu item is a food or recipe
        foreach ($foods as $food) {
            $food->type = 'food';
        }
        foreach ($recipes as $recipe) {
            $recipe->type = 'recipe';
        }
        
        $menu = $foods->merge($recipes);
        $menu = $menu->sortBy(function($item)
        {
            return $item->name;
        })->reverse()->reverse();

        return $menu;
    }

    /**
     *
     * @param Request $request
     * @return mixed
     */
    public function autocompleteFood(Request $request)
    {
        $typing = '%' . $request->get('typing') . '%';
        return $this->foods($typing);
    }

    /**
     *
     * @param $typing
     * @return mixed
     */
    private function foods($typing)
    {
        $foods = Food::where('user_id', Auth::user()->id)
            ->where('name', 'LIKE', $typing)
            ->with('defaultUnit')
            ->with('units')
            ->get();
           
        return $foods;
    }

    /**
     *
     * @param $typing
     * @return mixed
     */
    private function recipes($typing)
    {
        $recipes = Recipe::where('user_id', Auth::user()->id)
            ->where('name', 'LIKE', $typing)
            ->get();

        return $recipes;
    }

    /**
     *
     * @param Request $request
     * @return mixed
     */
    public function autocompleteExercise(Request $request)
    {
        $exercise = '%' . $request->get('exercise') . '%';
    
        $exercises = Exercise
            ::where('name', 'LIKE', $exercise)
            ->where('user_id', Auth::user()->id)
            ->select('id', 'name', 'description', 'default_unit_id', 'default_quantity')
            ->get();

        return $exercises;
    }



    /**
     * Valentin's code
     */

    /**
     * Selects rows from both foods and recipes table for autocomplete
     * @param Request                   $request
     * @param FoodsAndRecipesAutocomplete $autocomplete
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function foodsAndRecipes(Request $request, FoodsAndRecipesAutocomplete $autocomplete)
    {
        // You can just use the Request object here and get rid of these two lines
        // include(app_path() . '/inc/functions.php');
        // $typing = json_decode(file_get_contents('php://input'), true)["typing"];

        // For this part, since you are doing some "Autocomplete Search" on multiple models, the best approach would
        // be to create a autocomplete search service, you can use the app/Services directory for that.
        // To use a given service, just typehint it as a parameter to the method and Laravel will build it for you
        return $autocomplete->search($request->get('typing'));
    }

}
