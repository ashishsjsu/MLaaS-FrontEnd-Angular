/**
 * Created by ashishnarkhede on 12/5/15.
 */

(function() {
    'use strict';

    angular.module('myApp')
        .controller('caseStudyController', CaseStudyController);

    CaseStudyController.$inject = ['$scope', '$localStorage', 'caseStudyService', 'rawStatsProvider'];

    function CaseStudyController ($scope, $localStorage, caseStudyService, rawStatsProvider) {
        var caseStudyVm = this;
        caseStudyVm.chartConfig = {};

        caseStudyVm.rawStatistics = rawStatsProvider.data.data;
        caseStudyVm.meanStatistics = {};
        caseStudyVm.deviceNoPlotValues = caseStudyVm.rawStatistics[0].noplotvalues[0];
        caseStudyVm.cookieNoPlotValues = caseStudyVm.rawStatistics[1].noplotvalues[0];
        caseStudyVm.cMatrix = {};

        caseStudyVm.splineChart = {};
        caseStudyVm.splineData = null;
        caseStudyVm.init = init;

        caseStudyVm.getPrecisionChartData = getPrecisionChartData;
        caseStudyVm.handleSplineClick = handleSplineClick;
        caseStudyVm.getConfusionMatrix = getConfusionMatrix;
        caseStudyVm.getMeanStatistics = getMeanStatistics;
        caseStudyVm.getDeviceRawStatistics = getDeviceRawStatistics;
        caseStudyVm.getCookieRawStatistics = getCookieRawStatistics;
        caseStudyVm.getFmeasureRecallSpline = getFmeasureRecallSpline;
        caseStudyVm.configureHighchartsNgPie = configureHighchartsNgPie;
        caseStudyVm.configureHighchartsLineNg = configureHighchartsLineNg;
        caseStudyVm.configureHighchartsSplineNg = configureHighchartsSplineNg;

        init();

        function init() {
            angular.element('#sectionMoreInfo').css('visibility', 'hidden').css('min-height','0').css('height', '0');
            angular.element('#sectionSpline').css('visibility', 'hidden').css('min-height','0').css('height', '0');
            angular.element('#confusionMatrix').css('visibility', 'hidden').css('min-height','0').css('height', '0');
        }

        /**
         * Get data to plot line chart of precision vs. # of estimators
         */
        function getPrecisionChartData() {
            var precision = [];
            var accuracy = [];
            var data = $localStorage.splineData;
            for(var i=0; i<splineData.length; i++){
                angular.forEach(splineData[i], function(item, key){
                    if(key === 'precision'){
                        precision.push(item);
                    }
                    if(key === 'accuracy') {
                        accuracy.push(item);
                    }
                });
            }

            var chart = configureHighchartsLineNg(precision, accuracy);
            return chart;
        }

        /**
         * Get the confusion matrix for an experiment with the given values for recall and f measure
         * @param recall
         * @param fmeasure
         */
        function getConfusionMatrix(recall, fmeasure) {
            caseStudyService.getConfusionMatrix(recall, fmeasure).then(function(response){
                if(!response.data.isError) {
                    angular.element('#confusionMatrix').css('visibility', 'visible').css('min-height', '250px').css('height', 'auto');
                    console.log(response.data);
                    caseStudyVm.cMatrix = response.data.data[0];
                }
            });
        }

        /**
         * function to handle click event when a point onn spline chart is clicked
         */
        function handleSplineClick() {
            var point = this;
            //alert(point.x + " " + point.y);
            getConfusionMatrix(point.x, point.y);
        }

        /**
         * Get the data to plot spline chart of F measure vs recall
         */
        function getFmeasureRecallSpline() {

            angular.element('#sectionSpline').css('visibility', 'visible').css('min-height', '250px').css('height', 'auto');
            caseStudyVm.section3 = "partials/casestudy-section3.html";
            angular.element('#btnShowCharts').css('display', 'none');

            caseStudyService.getSplineData().then(function(response){
               if(!response.data.isError) {
                   var recall = 0;
                   var fmeasure = 0;
                   var maxDepth = 0;
                   var points = [];
                   var splineData = response.data.data;
                   caseStudyVm.splineData = splineData;
                   //store the data in localStorage for further use
                   $localStorage.splineData = splineData;

                   for(var i=0; i<splineData.length; i++){
                       angular.forEach(splineData[i], function(item, key){
                           if(key === 'recall'){
                               recall = item;
                           }
                           if(key === 'f1') {
                               fmeasure = item;
                           }
                           if(key === 'max_depth') {
                                maxDepth = item;
                           }
                       });
                       var point = [recall, fmeasure, {'max_depth':maxDepth} ];
                       points.push(point);
                   }

                   var chart = configureHighchartsSplineNg(points);
                   caseStudyVm.splineChart = chart;
                   // custom formatter function for tooltip
                   chart.options.tooltip.formatter = label;
                   // attach a function to handle point clicks on the chart
                   chart.series[0].point.events.click = caseStudyVm.handleSplineClick;
                   return chart;

               }
            });
        }

        /**
         * Custom tooltip formatter for the spline chart
         * @returns {string}
         */
        function label() {
            var point = this;
            var splineData = caseStudyVm.splineData;
            var flag = false;
            var max_depth = 20;
            var estimators = 100;

            for(var i=0; i<splineData.length; i++){
                flag = false;

                if(splineData[i].recall === point.x && splineData[i].f1 === point.y) {
                    max_depth = splineData[i].max_depth;
                    estimators = splineData[i].estimators;
                    break;
                }
            }

            var toolTip = " Recall: " + point.x + "<br> F measure: " + point.y  + "<br> Max depth: " + max_depth + "<br> Estimators: " +  estimators;
            return toolTip;
        }

        /**
         * Get mean, standard deviation for the drawbridge data
         */
        function getMeanStatistics() {
            // display the section
            angular.element('#sectionMoreInfo').css('visibility', 'visible').css('min-height', '250px').css('height', 'auto');
            caseStudyVm.section2 = 'partials/casestudy-section2.html';

            caseStudyService.getMeanStatistics('drawbridge').then(function(response) {
                if(!response.data.isError) {
                    caseStudyVm.meanStatistics = response.data.data;
                    angular.element('#btnShowMore').css('display', 'none');
                }
            });
        }

        /**
         * Get raw statistics for device data
         * @returns {*}
         */
        function getDeviceRawStatistics() {

            var rawStatsObj = caseStudyVm.rawStatistics[0].values[0];
            var points = [];
            angular.forEach(rawStatsObj, function(item, key) {

                var point = {
                    'name': key,
                    'y': item
                }
                points.push(point);

            });

            var chart = configureHighchartsNgPie(points);
            return chart;

        }

        /**
         * Get raw statistics for cookies file
         * @returns {*}
         */
        function getCookieRawStatistics() {

            var rawStatsObj = caseStudyVm.rawStatistics[1].values[0];
            var points = [];
            angular.forEach(rawStatsObj, function(item, key) {

                var point = {
                    'name': key,
                    'y': item
                }
                points.push(point);

            });

            var chart = configureHighchartsNgPie(points);
            return chart;
        }


        function configureHighchartsNgPie(data) {
            var chartConfig = {
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
                    data: data
                }]
            }
            return chartConfig;
        }

        function configureHighchartsLineNg(precision, accuracy) {
            var chartConfig = {
                options: {
                    chart: {
                        type: 'line'
                    }
                },
                xAxis: {
                    categories: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
                    title: {
                        text: 'Estimators'
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Score in %'
                    }
                },
                series: [{
                    name: 'Accuracy',
                    data: accuracy
                },
                    {
                        name: 'Precision',
                        data: precision
                    }],
                title: {
                    text: 'Precision, Accuracy vs. # of Estimators'
                },
                loading: false
            }

            return chartConfig;
        }

        function configureHighchartsSplineNg(data) {
            var chartConfig = {
                options: {
                    chart: {
                        type: 'spline',
                        zoomType: 'x',
                        inverted: false
                    },
                    spline: {
                        marker: {
                            enabled: true
                        }
                    },
                    tooltip: {
                        formatter: ""
                    }

                },
                title: {
                    text: 'F1 score for three different values of max depth'
                },
                subtitle: {
                    text: ''
                },
                xAxis: {
                    reversed: false,
                    title: {
                        enabled: true,
                        text: 'recall'
                    },
                    labels: {
                        formatter: function () {
                            return this.value + '%';
                        }
                    },
                    maxPadding: 0.05,
                    showLastLabel: true
                },
                yAxis: {
                    title: {
                        text: 'F measure'
                    },
                    labels: {
                        formatter: function () {
                            return this.value;
                        }
                    },
                    lineWidth: 2
                },
                legend: {
                    enabled: true
                },
                series: [{
                    data: data,
                    marker: {
                        enabled: true
                    },
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: ""
                        }
                    }
                }]
            }

            return chartConfig;
        }

        caseStudyVm.getDeviceRawStatistics = getDeviceRawStatistics();
        caseStudyVm.getCookieRawStatistics = getCookieRawStatistics();
    }

})();