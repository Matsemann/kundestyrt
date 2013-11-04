'use strict';

(function(undefined) {
    angular.module('kundestyrtApp').factory('Users', ['$http', 'BaseUrl', function($http, BaseUrl) {
        return {
            getUsers: function() {
                return $http.get(BaseUrl + 'api/users').then(
                    function(xhr) {
                        return xhr.data.rows;
                    });
            },


            getUser: ['id', function(id) {
                return $http.get(BaseUrl + 'api/users/' + id).then(function(xhr) {
                    return xhr.data;
                });
            }],

            save: function(user) {
                if(user._id) { // update
                    return $http.put(BaseUrl + 'api/users/' + user._id, user);
                } else { // save new
                    return $http.post(BaseUrl + 'api/users', user);
                }
            },

            delete: function(user) {
                if(user._id) { // delete
                    return $http.delete(BaseUrl + 'api/users/' + user._id +'/'+ user._rev);
                } else {
                    console.log('services/users.js: Error! Can not delete user that does not exist.');
                    return null; //vil nok krasje
                }
            }
        };
    }]);
})();