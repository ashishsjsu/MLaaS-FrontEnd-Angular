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
        caseStudyObject.getMeanStatistics = getMeanStatistics;
        caseStudyObject.getSplineData = getSplineData;
        caseStudyObject.getConfusionMatrix = getConfusionMatrix;


        /**
         * Get the confusion matrix for an experiment with the given values for recall and f measure
         * @param recall
         * @param fmeasure
         */
        function getConfusionMatrix(recall, fmeasure) {
            var url = '/stats/randomforest/cmatrix?recall=' + recall + '&fmeasure=' + fmeasure;
            return $http.get(url);
        }

        /**
         * Get results from Random Forest model to plot the spline chart of F measure vs recall
         */
        function getSplineData() {
            var url = "stats/randomforest/chart?type=spline";
            return $http.get(url);
        }

        /**
         * Get mean and standard deviation for the dataset columns
         * @param casestudy
         * @returns {*}
         */
        function getMeanStatistics(casestudy) {
            var url = "/stats/mean/";
            if(casestudy === 'drawbridge') {
                url = url + 'drawbridge';
            }
            return $http.get(url);
        }

        /**
         * Get raw statistics for files in given casestudy
         * @param casestudy
         * @returns {*}
         */
        function getRawStatistics (casestudy) {
            var url = "/stats/raw/";
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