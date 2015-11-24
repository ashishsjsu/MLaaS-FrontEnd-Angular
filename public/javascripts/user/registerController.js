/**
 * Created by Neeraj on 11/17/2015.
 */

angular
    .module('myApp')
    .controller('registerController', RegisterController);

RegisterController.$inject = ['$state', 'userService'];

function RegisterController ($state, userService) {
    var vm = this;
    vm.user = {};
    vm.interests = [];
    vm.tags = [];
    vm.readonly = false;

    vm.registerUser = registerUser;
    vm.newInterest = newInterest;
    vm.roInterests = angular.copy(vm.interests);

    function newInterest (chip) {
        return {
            name: chip,
            type: 'unknown'
        };
    };

    function registerUser (){
        userService.register(vm.user).then(function(response) {
            if(response.status === 200) {
                angular.copy(response.data, userService.user);
                userService.token = response.data.token;
                $state.go('home');
            } else {
                response.errorMessage;
            }
        });
    };
}