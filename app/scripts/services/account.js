'use strict';

(function(undefined) {
    angular.module('kundestyrtApp').factory('Account', ['$http', 'BaseUrl', function($http, BaseUrl) {
        return {
            login: function(username, password) {
                return $http.post(BaseUrl + 'login', {
                    username: username,
                    password: password
                });
            },

            editPassword: function(oldPw, newPw) {
                return $http.post(BaseUrl + 'password', { //POST? Or rather PUT?
                    'old': oldPw,
                    'new': newPw
                });
            }
        };
    }]);
})();