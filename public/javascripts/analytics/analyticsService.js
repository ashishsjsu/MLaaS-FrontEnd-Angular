(function(){
    'use strict';

    angular.module('myApp')
        .factory('analyticsService', analyticsService);

    analyticsService.$inject = ['$http', '$localStorage'];

    function analyticsService($http, $localStorage) {

        var analyticsObject = {};

        analyticsObject.getAlgorithmsList = getAlgorithmsList;
        analyticsObject.transformDataTask = transformDataTask;

        /**
         * create a new task for data transformation
         * @param file
         * @returns {*}
         */

        function transformDataTask(file) {

            var url = "/tasks?type=transformation";
            return $http.post(url, {filename: file});
        }

        /**
         * Get a list of algorithms available for analytics
         * @returns {*}
         */
        function getAlgorithmsList() {

          return  $http.get('/algorithms').then(getAlgorithmsResponse);
        }

        function getAlgorithmsResponse(response) {
            if(!response.data.isError) {
                angular.copy(response.data, analyticsObject.algorithmsList);
            }
            else{
                console.log(err);
            }
            return response;
        }

        return analyticsObject;
    }
})();