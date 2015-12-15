(function() {
    'use strict';

    angular.module('myApp')
        .controller('analyticsController', AnalyticsController);

    AnalyticsController.$inject = ['$localStorage', 'analyticsService', 'dataSourceProvider', 'taskHistoryProvider', 'algorithmsProvider'];

    function AnalyticsController($localStorage, analyticsService, dataSourceProvider, taskHistoryProvider, algorithmsProvider) {

        var anaVm = this;
        anaVm.taskHistory = [];
        anaVm.algorithms = [];
        // populate variables using the resolve providers
        anaVm.datasourceList = dataSourceProvider.data;
        anaVm.columnsList = "";
        anaVm.taskHistory = taskHistoryProvider.data;
        anaVm.algorithms = algorithmsProvider.data;
        anaVm.preprocessMethod = "";
        anaVm.selectedDatasource = "";

        anaVm.updateDatasourceSelection = updateDatasourceSelection;
        anaVm.updateAlgorithmSelection = updateAlgorithmSelection;
        anaVm.updatePreprocessSelection = updatePreprocessSelection;
        anaVm.transformData = transformData;

        function updateAlgorithmSelection() {
            if(anaVm.selectAlgorithm !== 'Select') {
                //ToDo: iterate over the algorithm list to find the selected algorithm and get its parameters

            }
        }

        function updatePreprocessSelection() {
            if(anaVm.selectPreprocessMethod !== 'Select') {
                if(anaVm.selectPreprocessMethod === 'Transformation') {
                    anaVm.preprocessMethod = anaVm.selectPreprocessMethod;
                }
                else{
                    alert("Feature not available yet");
                    anaVm.preprocessMethod = "";
                }
            }
        }

        /**
         * creates a new task for data transformation
         */
        function transformData () {
            if(anaVm.preprocessMethod !== "" && anaVm.selectedDatasource !== "") {
                analyticsService.transformDataTask(anaVm.selectedDatasource).then(function(response) {
                    if(!response.data.isError) {
                        console.log(response);
                        anaVm.taskHistory.data.push(response.data);
                    }
                });
            }
            else {
                alert("Select a valid preprocessing method and a data source");
            }
        }

        function updateDatasourceSelection() {
            var dataSourceList = anaVm.datasourceList.data;
            anaVm.columnsList = "";
            anaVm.selectedDatasource = "";
            if(anaVm.selectDatasource !== "Select") {
                anaVm.selectedDatasource = anaVm.selectDatasource;
                for(var i=0; i < dataSourceList.length; i++) {
                    if(anaVm.selectDatasource === dataSourceList[i].filename) {
                        anaVm.columnsList = dataSourceList[i].columns;
                    }
                }
            }
        }

    }
})();