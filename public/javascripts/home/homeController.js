/**
 * Created by ashishnarkhede on 11/17/15.
 */
(function () {
    'use strict';

    angular.module('myApp')
        .controller('homeController', HomeController);

    HomeController.$inject = ['$scope','homeService', 'dataSourceProvider']

    function HomeController(scope, homeService, dataSourceProvider){

        var self = this;
        self.myFile = undefined;
        self.progressVisible = false;
        self.progress = undefined;
        //the datasource list is initially populated by resolve function
        self.datasourceList = dataSourceProvider.data;
        self.selectDatasource = "Select";
        self.sampleData = null; //keep it null, don't change to undefined
        self.chartConfig = {};
        self.chartData = [];
        self.uploadMedia = uploadMedia;
        self.getDatasourceList = getDatasourceList;
        self.showSampleData = showSampleData;
        self.generateRawStatistics = generateRawStatistics;
        self.plotRawStatistics = plotRawStatistics;


        console.log(self.datasourceList);
        function generateRawStatistics() {
            console.log(self.selectDatasource);
            if(self.selectDatasource !== "Select" || self.selectDatasource !== null){
                // homeService.generateRawStatistics(self.selectDatasource);
            }
        }

        /**
         * This method creates a highchart's pie chart based on raw statistics results
         */
        function plotRawStatistics(results) {

            console.log(results);
            /*
            angular.forEach(results.data, function(item, key) {

                var point = {
                    'name': item,
                    'y': results[item]
                }

            });*/

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
                    text: 'Browser market shares. January, 2015 to May, 2015'
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
                    name: 'Brands',
                    data: [
                        { name: 'Microsoft Internet Explorer', y: 56.33 },
                        {
                            name: 'Chrome',
                            y: 24.03,
                            sliced: true,
                            selected: true
                        },
                        { name: 'Firefox', y: 10.38 },
                        { name: 'Safari', y: 4.77 }, { name: 'Opera', y: 0.91 },
                        { name: 'Proprietary or Undetectable', y: 0.2 }
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
            // this function is being used to read files from AWS S3
            Papa.parse(fileurl, {
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
                    //ToDO: bind an object to scope and create a table by iterating over the elements in the object
                    //populatePartialTable(results.meta.fields, results.data);
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
                                // parse the samples of file once upload is completed
                                homeService.parsePartialFile(file);
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