'use strict';

(function(undefined) {
    angular.module('kundestyrtApp').factory('Users', ['$http', function($http) {
        return {
            getUsers: function() {
                return $http.get('/api/users').then(
                    function(xhr) {
                        return xhr.data.rows;
                    });
            },


            getUser: ['id', function(id) {
                return $http.get('/api/users/' + id).then(function(xhr) {
                    return xhr.data;
                });
            }],

            save: function(user) {
                                                                    console.log('scipts/services/users.js - user._id = '+user._id);
                if(user._id) { // update
                    return $http.put('/api/users/' + user._id, user);
                } else { // save new
                    return $http.post('/api/users', user);
                }
            },

            delete: function(user) {
                if(user._id) { // delete
                    return $http.delete('/api/users/' + user._id +'/'+ user._rev);
                } else {
                    console.log('services/users.js: Error! Can not delete user that does not exist.');
                    return null; //vil nok krasje
                }
            }
        };
    }]);
})();