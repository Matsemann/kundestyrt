'use strict';

(function(undefined) {
    angular.module('kundestyrtApp').factory('AuthInterceptor', ['$q', '$injector', '$rootScope', 'BaseUrl', function($q, $injector, $rootScope, BaseUrl) {

        return {
            responseError: function(response) {
                if(response.status === 401 && response.config.url !== BaseUrl + 'login') {
                    var $http = $injector.get('$http'); // trick to avoid circular dependency.
                    var config = response.config;
                    if(!$rootScope.$user) {
                        var deferred = $q.defer();
                        $rootScope.$login(deferred);
                        return deferred.promise.then(function() {
                            return $http(config);
                        });
                    }
                }

                return $q.reject(response);
            }
        };
    }]);
})();