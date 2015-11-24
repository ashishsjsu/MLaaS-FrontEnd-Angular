angular
    .module('myApp')
    .factory('userService', UserService);

UserService.$inject = ['$http', '$localStorage'];

function UserService ($http, $localStorage) {
    var userObject = {
        user: {},
        token: ''
    };

    userObject.signin = signin;
    userObject.register = register;
    userObject.logout = logout;

    /**
     * Sign in service
     *
     * @param email
     * @param password
     * @returns {*|{get}}
     */
    function signin(username, password) {
        var obj = {
            username: username,
            password: password
        };
        return $http.post('/login', obj).then(signinResponse);
    }

    /**
     * New user registering service
     *
     * @param user
     * @returns {*|{get}}
     */
    function register(user) {
        return $http.post('/register', user).then(resgisterResponse);
    }

    /**
     * Response returned after signin service
     *
     * @param response
     * @returns {*}
     */
    function signinResponse(response) {
        if(response.status === 200) {
            angular.copy(response.data.data, userObject.user);
            $localStorage.user = userObject.user;
            console.log($localStorage.user);
            userObject.token = response.data.token;
        } else {
            console.log('error404');
        }
        return response;
    }

    /**
     * Response returned after register service
     *
     * @param response
     * @returns {*}
     */
    function resgisterResponse (response) {
        if(response.status === 200) {
            angular.copy(response.data.data, userObject.user);
            $localStorage.user = userObject.user;
            userObject.token = response.data.token;
        } else {
            console.log('error404');
        }
        return response;
    }

    /**
     * For logging out
     */
    function logout() {
        delete $localStorage.user;
        if($localStorage.user) {
            return false;
        } else {
            return true;
        }
    }

    return userObject;
}
