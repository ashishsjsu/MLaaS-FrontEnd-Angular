angular
    .module('myApp')
    .config(configure);

configure.$inject = ['$stateProvider', '$urlRouterProvider'];

function configure($stateProvider, $urlRouterProvider){
    $stateProvider.state('login', {
        url: '/login',
        templateUrl: '/partials/login.ejs',
        controller: 'loginController'
    });
    $stateProvider.state('register', {
        url: '/register',
        templateUrl: '/partials/register.ejs',
        controller: 'registerController',
        controllerAs: 'registerVm'
    });
    $stateProvider.state('home', {
        url: '/home',
        templateUrl: '/partials/home.ejs',
        controller: 'homeController',
        controllerAs: 'homeVm',
        resolve: {
            isAuthenticated: isAuthenticated,
            dataSourceProvider: getDatasourceList,
            taskHistoryProvider: getTaskHistoryList
        }
    });
    $stateProvider.state('analytics', {
       url: '/analytics',
       templateUrl: '/partials/analytics.ejs',
       controller: 'analyticsController',
       controllerAs: 'anaVm',
       resolve: {
           //isAuthenticated: isAuthenticated,
           dataSourceProvider: getDatasourceList,
           taskHistoryProvider: getTaskHistoryList,
           algorithmsProvider: getAlgorithmsList,
           taskHistoryProvider: getTaskHistoryList
       }
    });

    $stateProvider.state('casestudy', {
        url: '/casestudy',
        templateUrl: '/partials/casestudy.ejs',
        controller: 'caseStudyController',
        controllerAs: 'caseStudyVm',
        resolve: {
            rawStatsProvider: getRawStats
        }
    });

    $urlRouterProvider.otherwise('login');
}


isAuthenticated.$inject = ['$localStorage', '$location'];

function isAuthenticated($localStorage, $location) {
    if($localStorage.user) {
        return true;
    } else {
        $location.path('/login');
    }
}

/**
 * Get the list of datasources for a user
 * @type {string[]}
 */
getDatasourceList.$inject = ['homeService'];

function getDatasourceList(homeService) {
    return homeService.getDatasourceList();
}

/**
 * Get the history of tasks for a user
 * @type {string[]}
 */
getTaskHistoryList.inject = ['homeService'];
function getTaskHistoryList(homeService) {
    return homeService.getTaskHistoryList();
}

/**
 * Get a list of algorithms available for analytics
 * @type {string[]}
 */
getAlgorithmsList.$inject = ['analyticsService'];
function getAlgorithmsList(analyticsService) {
    return analyticsService.getAlgorithmsList();
}

/**
 * Get rw statistics for drawbridge data
 * @type {string[]}
 */
getRawStats.$inject = ['caseStudyService'];
function getRawStats(caseStudyService) {
    return caseStudyService.getRawStatistics('drawbridge');
}