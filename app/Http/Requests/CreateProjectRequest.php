<?php namespace App\Http\Requests;

use App\Http\Requests\Request;

/**
 * Class CreateProjectRequest
 * @package App\Http\Requests\Projects
 * @see http://laravel.com/docs/5.1/validation#form-request-validation
 */
class CreateProjectRequest extends Request {

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     * @see http://laravel.com/docs/5.1/validation#available-validation-rules
     * @return array
     */
    public function rules()
    {
        return [
            'payer_email' => 'required|email',
            'description' => 'required',
            'rate' => 'required|numeric'
        ];
    }

}

