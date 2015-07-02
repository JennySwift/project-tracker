app.factory('ProjectsFactory', function ($http) {
    return {

        /**
         * select
         */

        showProject: function ($project) {
            var $url = $project.path;

            return $http.get($url);
        },

        /**
         * insert
         */

        insertProject: function ($new_project) {
            var $url = '/projects';
            var $new_payer;
            var $payer_email;

            if ($new_project.new_payer.email !== '') {
                //It is a new payer
                $new_payer = true;
                $payer_email = $new_project.new_payer.email;
            }
            else {
                $new_payer = false;
                $payer_email = $new_project.previous_payer.email;
            }

            var $data = {
                new_payer: $new_payer,
                payer_email: $payer_email,
                description: $new_project.description,
                rate: $new_project.rate
            };

            return $http.post($url, $data);
        },
        startProjectTimer: function ($project_id) {
            var $url = 'insert/startProjectTimer';
            var $data = {
                project_id: $project_id
            };

            return $http.post($url, $data);
        },
        stopProjectTimer: function ($project_id) {
            var $url = 'update/stopProjectTimer';
            var $data = {
                project_id: $project_id
            };

            return $http.post($url, $data);
        },
        addPayer: function () {
            var $url = 'insert/payer';
            var $payer_email = $("#new-payer-email").val();
            var $data = {
                payer_email: $payer_email
            };

            return $http.post($url, $data);
        },

        /**
         * update
         */

        markAsPaid: function ($payer_id) {
            var $url = 'update/markAsPaid';
            var $data = {
                payer_id: $payer_id
            };

            return $http.post($url, $data);
        },
        confirmNewProject: function ($project) {
            var $url = $project.path;

            return $http.put($url);
        },
        /**
         * Todo: This could do with some work. Just doing a post request for now.
         * @param $project
         * @returns {*}
         */
        declineNewProject: function ($project) {
            var $url = 'update/declineNewProject';
            var $data = {
                project: $project
            };

            return $http.post($url, $data);
        },

        /**
         * delete
         */
        dismissNotification: function ($notification) {
          var $url = $notification.path;

          return $http.delete($url);
        },
        removePayer: function ($payer_id) {
            var $url = 'delete/payer';
            var $data = {
                payer_id: $payer_id
            };

            return $http.post($url, $data);
        },
        deleteProject: function ($project) {
            var $url = $project.path;

            return $http.delete($url);
        },
        deleteTimer: function ($timer) {
            var $url = $timer.path;

            return $http.delete($url);
        }
    };
});
