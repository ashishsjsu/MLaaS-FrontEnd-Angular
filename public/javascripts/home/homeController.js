/**
 * Created by ashishnarkhede on 11/17/15.
 */
(function () {
    'use strict';

    angular.module('myApp')
        .controller('homeController', HomeController);

    HomeController.$inject = ['$scope', '$localStorage', 'homeService', 'dataSourceProvider', 'taskHistoryProvider']

    function HomeController(scope, localStorage, homeService, dataSourceProvider, taskHistoryProvider){

        var self = this;

        // populate variables using the resolve providers
        self.datasourceList = dataSourceProvider.data;
        self.taskHistory = taskHistoryProvider.data;
        // variables
        self.myFile = undefined;
        self.progressVisible = false;
        self.progress = undefined;
        self.selectDatasource = "Select";
        self.sampleData = null; //keep it null, don't change to undefined
        self.rawStatistics = undefined;
        self.chartConfig = {};
        self.chartData = [];

        // functions
        self.uploadMedia = uploadMedia;
        self.postUploadCleanup = postUploadCleanup;
        self.getDatasourceList = getDatasourceList;
        self.showSampleData = showSampleData;
        self.configureHighchartsPie = configureHighchartsPie;
        self.generateRawStatistics = generateRawStatistics;
        self.plotRawStatistics = plotRawStatistics;
        self.getResults = getResults;



        plotRawStatistics();
        console.log(self.datasourceList);

        /**
         * This function gets the results of a task from the status url provided
         * @param statusurl
         */
        function getResults(statusUrl){
            homeService.getTaskResults(statusUrl).then(function(response){
                var result = JSON.parse(response.data.result);
                var object = {};
                for (var key in result) {
                    if (result.hasOwnProperty(key)) {
                        object[key] = result[key];
                    }
                }
                self.rawStatistics = object;
                plotRawStatistics(object);
            });
        }

        /**
         * This method generates statistics for the raw data uploaded by the user
         */
        function generateRawStatistics() {
            console.log(self.selectDatasource);
            if(self.selectDatasource !== "Select" || self.selectDatasource !== null){
                homeService.getRawDataStatistics(self.selectDatasource).then(function(response){
                    if(!response.data.isError && response.status == 200){
                        angular.copy(response.data.data, self.rawStatistics);
                    }
                    else{
                        console.log("Error: " + response.data);
                    }
                });
            }
        }

        /**
         * This method creates a highchart's pie chart based on raw statistics results
         */
        function plotRawStatistics(results) {
            self.configureHighchartsPie();
            var points = [];
            angular.forEach(results, function(item, key) {

                var point = {
                    'name': key,
                    'y': item
                }
                points.push(point);

            });
            self.chartConfig.series.push({data: points});

        }

        /**
         * Configuration for highchart's pie chart
         */
        function configureHighchartsPie() {
            self.chartConfig = {
                options: {
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    }
                },
                title: {
                    text: 'Raw Statistics - Unique values in each column'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            },
                            connectorColor: 'silver'
                        }
                    }
                },
                series: [{
                    name: 'Raw Statistics',
                    data: [
                        /* { name: 'Microsoft Internet Explorer', y: 56.33 },
                         {
                         name: 'Chrome',
                         y: 24.03,
                         sliced: true,
                         selected: true
                         },
                         { name: 'Firefox', y: 10.38 },
                         { name: 'Safari', y: 4.77 }, { name: 'Opera', y: 0.91 },
                         { name: 'Proprietary or Undetectable', y: 0.2 } */
                    ]
                }]
            }

        }

        /**
         * This method shows a sample of data from the data source selected
         * @param elem
         */
        function showSampleData(elem) {
            console.log(elem.datasource.filename);
            var filename = elem.datasource.filename;
            var fileurl = "https://cmpe295b-sjsu-bigdatasecurity.s3.amazonaws.com/" + filename;
            parsePartialFile(fileurl);
        }

        function parsePartialFile(datasource) {
            // this function is being used to read files from AWS S3
            Papa.parse(datasource, {
                preview: 10,
                header: true,
                download: true,
                error: function(err, file, inputElem, reason)
                {
                    console.log(err);
                    console.log(reason);
                    // executed if an error occurs while loading the file,
                    // or if before callback aborted for some reason
                },
                complete: function(results) {
                    // bind sample data to scope
                    self.sampleData = results;
                    // this forces an angular digest loop and hence table is updated immediately
                    scope.$apply();
                }
            });
        }

        /**
         * This method retrieves a list of data source for currently logged in user
         */
        function getDatasourceList() {
            homeService.getDatasourceList().then(function(response) {
                console.log(response);
                if(response.status === 200) {
                    angular.copy(self.datasourceList, self.datasourceList);
                }
                else{
                    console.log("Error: " + response.data);
                }
            });
        }

        /**
         * This method uploads the media into AWS S3 bucket
         */

        function uploadMedia() {
            var signedURL;
            var file;
            file = self.myFile;
            if(file !== undefined){
                //get a signed S3 request for the file selected by user
                homeService.getSignedS3Request(file).then(function(response){
                    //if signed request is received successfully
                    if(response.status === 200){
                        signedURL = response.data.signed_request;
                        console.log(response.data);
                        // upload the file with the signed request
                        var xhr = new XMLHttpRequest();
                        // define event listeners to track update status and progress
                        xhr.upload.addEventListener("progress", uploadProgress, false);
                        xhr.addEventListener("load", uploadComplete, false);
                        xhr.addEventListener("error", uploadFailed, false);
                        xhr.addEventListener("abort", uploadCanceled, false);
                        // open a PUT request to upload the file
                        xhr.open("PUT", signedURL);
                        // make the file publically downloadable
                        xhr.setRequestHeader('x-amz-acl', 'public-read');
                        //disable the submit while file is being uploaded
                        // set the progress bar value to zero in case user uploads multiple files back to back
                        self.progress = 0;

                        xhr.onload = function() {
                            //if file upload request is completed successfully
                            if (xhr.status === 200) {
                                console.log("File upload complete");
                                self.postUploadCleanup(file);
                            }
                        };
                        xhr.onerror = function() {
                            alert("Could not upload file.");
                        };

                        self.progressVisible = true;
                        console.log(signedURL);
                        xhr.send(file);

                    }
                    else {
                        console.log(response);
                    }
                });
            }

        }

        /**
         * This is a utility function to carry out all the
         * @param file: the file uploaded
         */
        function postUploadCleanup(file) {
            //update the datasource dropdown list to reflect the new datasource
            var item = { username: localStorage.user.username, filename: file.name, columns: []};
            self.datasourceList.data.push(item);
            // parse a sample of the file and show it as table
            parsePartialFile(file);
            // call factory method to update the file metadata
            homeService.parsePartialFile(file);
        }

        /**
         * This method updates the file upload progress whenever the progress length is computable
         * @param evt
         */
        function uploadProgress(evt) {
            scope.$apply(function(){
                if (evt.lengthComputable) {
                    self.progress = Math.round(evt.loaded * 100 / evt.total);
                } else {
                    self.progress = 'unable to compute'
                }
            })
        }

        /**
         * Upload complete handler notifies once file upload is completed successfully
         * @param evt
         */
        function uploadComplete(evt) {
            /* This event is raised when the server send back a response */
            console.log(evt.target.responseText);
        }

        /**
         * Upload failed handler notifies if file upload fails
         * @param evt
         */
        function uploadFailed(evt) {
            alert("There was an error attempting to upload the file.");
        }

        /**
         * Upload canceled handler notifies in case the upload is canceled
         * @param evt
         */
        function uploadCanceled(evt) {
            scope.$apply(function(){
                self.progressVisible = false;
            })
            alert("The upload has been canceled by the user or the browser dropped the connection.");
        }
    }
})();