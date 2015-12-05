(function(){
    'use strict';

    angular.module('myApp')
        .factory('analyticsService', analyticsService);

    analyticsService.$inject = ['$http', '$localStorage'];

    function analyticsService($http, $localStorage) {

        var analyticsObject = {};

        analyticsObject.getAlgorithmsList = getAlgorithmsList;

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