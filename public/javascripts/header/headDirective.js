/**
 * Created by Neeraj on 11/21/2015.
 */
angular
    .module('myApp')
    .directive('bodyHeader', BodyHeader);

BodyHeader.$inject = ['$rootScope', '$state', 'userService', '$localStorage'];

function BodyHeader($rootScope, $state, userService, $localStorage) {
    function headController (){
        var headVm = this;
        var mainSidebar = false;
        var controlSidebar = false;

        headVm.search = search;
        headVm.newProblem = newProblem;
        headVm.logout = logout;
        headVm.toggleMainSidebar = toggleMainSidebar;
        headVm.toggleControlSidebar = toggleControlSidebar;

        function toggleMainSidebar() {

            $rootScope.$broadcast('toggle-main-sidebar', !mainSidebar);
        }

        function toggleControlSidebar() {
            $rootScope.$broadcast('toggle-control-sidebar', !controlSidebar);
        }

        function search(){
            headVm.searchArr = [];
            headVm.searchArr.push(headVm.inStr);
            feedService.getFeeds($localStorage.user.token, headVm.searchArr, 0).then(function (response){
                $rootScope.$broadcast('searchFeed', response);
            });
        }

        function newProblem(){
            alert('problem');
            $state.go('problem');
        }

        function logout(){
            if(userService.logout()) {
                $state.go('login');
            }
        }
    }

    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/partials/header.ejs',
        controller: headController,
        controllerAs: 'headVm',
        bindToController: true
    }
}
