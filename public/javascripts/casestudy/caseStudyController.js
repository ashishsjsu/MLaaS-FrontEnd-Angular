/**
 * Created by ashishnarkhede on 12/5/15.
 */

(function() {
    'use strict';

    angular.module('myApp')
        .controller('caseStudyController', CaseStudyController);

    CaseStudyController.$inject = ['$localStorage', 'caseStudyService', 'rawStatsProvider'];

    function CaseStudyController ($localStorage, caseStudyService, rawStatsProvider) {
        var caseStudyVm = this;
        caseStudyVm.chartConfig = {};

        caseStudyVm.rawStatistics = rawStatsProvider.data.data;
        caseStudyVm.meanStatistics = {};
        caseStudyVm.deviceNoPlotValues = caseStudyVm.rawStatistics[0].noplotvalues[0];
        caseStudyVm.cookieNoPlotValues = caseStudyVm.rawStatistics[1].noplotvalues[0];


        caseStudyVm.init = init;
        //caseStudyVm.plotRawStatistics = plotRawStatistics;
        //caseStudyVm.configureHighchartsPie = configureHighchartsPie;

        caseStudyVm.getMeanStatistics = getMeanStatistics;

        caseStudyVm.getDeviceRawStatistics = getDeviceRawStatistics;
        caseStudyVm.getCookieRawStatistics = getCookieRawStatistics;
        caseStudyVm.configureHighchartsNgPie = configureHighchartsNgPie;

        init();

        function init() {
            angular.element('.boxMoreInfo').css('display', 'block');
        }


        function getMeanStatistics() {
            angular.element('.boxMoreInfo').css('display', 'block');

            caseStudyService.getMeanStatistics('drawbridge').then(function(response) {
                if(!response.data.isError) {
                    caseStudyVm.meanStatistics = response.data.data;
                }
            });
        }

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

        caseStudyVm.getDeviceRawStatistics = getDeviceRawStatistics();
        caseStudyVm.getCookieRawStatistics = getCookieRawStatistics();
    }

})();