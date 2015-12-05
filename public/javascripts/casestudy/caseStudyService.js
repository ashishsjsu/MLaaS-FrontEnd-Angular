/**
 * Created by ashishnarkhede on 12/5/15.
 */

(function () {
    'use strict';

    angular.module('myApp')
        //upload service for file uploads
        .factory('caseStudyService', caseStudyService);

    caseStudyService.$inject = ['$http', '$localStorage'];

    function caseStudyService($http, $localStorage) {

        var caseStudyObject = {
            rawStatistics: []
        };

        caseStudyObject.getRawStatistics = getRawStatistics;

        /**
         * Get raw statistics for files in given casestudy
         * @param casestudy
         * @returns {*}
         */
        function getRawStatistics (casestudy) {
            var url = "/stats/";
            if(casestudy === 'drawbridge') {
                url = url + 'drawbridge';
            }

            return $http.get(url).then(getRawStatsResponse);
        }

        function getRawStatsResponse(response) {
            if(!response.isError) {
                angular.copy(response.data.data, caseStudyObject.rawStatistics);
            }
            else {
                console.log("Error: " + response.data);
            }
            return response;
        }


        return caseStudyObject;
    }

})();