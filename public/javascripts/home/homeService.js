/**
 * Created by ashishnarkhede on 11/19/15.
 */
(function () {
    'use strict';

    angular.module('myApp')
        //upload service for file uploads
        .factory('homeService', homeService);

    homeService.$inject = ['$http', '$localStorage'];

    function homeService($http, $localStorage){

        var homeObject = {
            datasourceList: [],
            taskHistoryList: []
        };

        homeObject.getSignedS3Request = getSignedS3Request;
        homeObject.getDatasourceList = getDatasourceList;
        homeObject.parsePartialFile = parsePartialFile;
        homeObject.updateFileMetadata = updateFileMetadata;
        homeObject.getRawDataStatistics = getRawDataStatistics;
        homeObject.getTaskHistoryList = getTaskHistoryList;
        homeObject.getTaskResults = getTaskResults;


        /**
         * This method retrieves results for a task provided task tracking url is valid
         */
        function getTaskResults(statusUrl) {
            var url = statusUrl;
            return $http.get(url);
        }

        /**
         * This method retrieves task history list for a user
         */
        function getTaskHistoryList() {
            var url = "/tasks?user=" + $localStorage.user.username;
            return $http.get(url).then(getTaskHistoryResponse);
        }

        /**
         * This method makes a request to server to generate statistics on the raw dataset
         */
        function getRawDataStatistics(datasource) {
            var url = "/tasks?type=rawstatistics";
            return $http.post(url, {filename: datasource});
        }

        /**
         * This method retrieves a list of data sources for currently logged in user
         */
        function getDatasourceList() {
            var url = '/datasource/?user=' + $localStorage.user.username;
            return $http.get(url).then(getDatasourceResponse);
        }

        /**
         * This method parses the file uploaded and extracts column names from the file
          * @param file uploaded
         */
        function parsePartialFile(file) {
            Papa.parse(file, {
                // base config to use for each file
                preview: 10,
                header: true,
                before: function(file, inputElem)
                {
                    // executed before parsing each file begins;
                    // what you return here controls the flow
                },
                error: function(err, file, inputElem, reason)
                {
                    console.log(err);
                    console.log(reason);
                    // executed if an error occurs while loading the file,
                    // or if before callback aborted for some reason
                },
                complete: function(results)
                {
                    console.log(results);
                    var columns = [];
                    for(var field in results.meta.fields) {
                        columns.push(field);
                    }
                    console.log(columns);
                    // create a file object to be saved
                    var metadata = {
                        'username': $localStorage.user.username,
                        'filename': file.name,
                        'columns': JSON.stringify(results.meta.fields), // meta.fields contains column names
                        //fileurl : fileurl,
                        'date': new Date()
                    }

                    // once file is parsed, save the metadata in user's profile
                    updateFileMetadata(file, metadata);
                }
            });
        }

        /**
         * This method updates the fie info and the metadata for the file uploaded by the user
         * @param file
         * @param metadata
         */
        function updateFileMetadata(file, metadata) {
            var url = "/datasource";
            $http.post(url, metadata).then(function(response){
                if(response.status === 200) {
                    console.log(response.data.data);
                }
                else {
                    console.log("error500: " + response.data.data);
                }
            })
        }

        /**
         * This method gets the signed s3 request from the server
         *
         * @param file object
         * @returns {*|{get}}
         */
        function getSignedS3Request(file) {

            var url = '/datasource/upload/sign_request?filename=' + file.name + '&filetype=' + file.type;
            // just return the call, use then in controller
            return $http.get(url);
        }

        /**
         * returns response from getDatasourceList service
         * @param response
         */
        function getDatasourceResponse(response) {
            if(response.status === 200) {
                angular.copy(response.data, homeObject.datasourceList);
            }
            else{
                console.log("Error: " + response.data);
            }

            return response;
        }

        /**
         * returns response from getTaskHistoryService
         * @param response
         */
        function getTaskHistoryResponse(response) {
            if(!response.data.isError) {
                //copy list of task objects into an array
                angular.copy(response.data, homeObject.taskHistoryList);
            }
            else {
                console.log("Error: " + response.data);
            }
            return response;
        }

        return homeObject;
    }//homeservice

})();