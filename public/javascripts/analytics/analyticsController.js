(function() {
    'use strict';

    angular.module('myApp')
        .controller('analyticsController', AnalyticsController);

    AnalyticsController.$inject = ['$localStorage', 'homeService', 'dataSourceProvider', 'taskHistoryProvider'];

    function AnalyticsController($localStorage, homeService, dataSourceProvider, taskHistoryProvider, algorithmsProvider) {

        var anaVm = this;
        anaVm.taskHistory = [];
        anaVm.algorithms = [];
        // populate variables using the resolve providers
        anaVm.datasourceList = dataSourceProvider.data;
        anaVm.taskHistory = taskHistoryProvider.data;
        anaVm.algorithms = algorithmsProvider.data;

        anaVm.updateAlgorithmSelection = updateAlgorithmSelection;

        function updateAlgorithmSelection() {
            if(anaVm.selectAlgorithm !== 'Select') {
                //ToDo: iterate over the algorithm list to find the selected algorithm and get its parameters

            }
        }

    }
})();