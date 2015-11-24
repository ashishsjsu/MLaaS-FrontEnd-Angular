/**
 * Created by Neeraj on 11/17/2015.
 */

angular
    .module('myApp')
    .controller('loginController', LoginController);

LoginController.$inject = ['$state', 'userService', '$mdDialog'];

function LoginController($state, userService, $mdDialog) {
    var userVm = this;
    userVm.user = {};
    userVm.status = 'a';
    userVm.login = login;
    userVm.isError = false;


    function login () {
        userService.signin(userVm.user.username, userVm.user.password).then(signinPromise);
    }

    function signinPromise(response) {
        if(!response.data.isError) {
            userVm.isError = false;
            $state.go('home');
        } else {
            userVm.isError = true;
        }
    }
}