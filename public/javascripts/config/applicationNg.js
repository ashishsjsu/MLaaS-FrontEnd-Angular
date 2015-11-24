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
            dataSourceProvider: getDatasourceList
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

getDatasourceList.$inject = ['homeService'];

function getDatasourceList(homeService) {
    return homeService.getDatasourceList();
}