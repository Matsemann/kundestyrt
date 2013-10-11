'use strict';

angular.module('kundestyrtApp', ['ng', 'ngResource', 'fgmt'])
  .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    function serviceResolve(service, method) {
      return [service, function(s) {
        return s[method];
      }];
    }

    var f = {
      conversationList: {
        controller: 'ConversationListCtrl',
        templateUrl: '/views/conversation/list.html',
        resolve: {
          conversations: serviceResolve('Conversation', 'list')
        }
      },
      conversation: {
        controller: 'ConversationCtrl',
        templateUrl: '/views/conversation/main.html',
        resolve: {
          conversation: serviceResolve('Conversation', 'get')
        }
      },
      inquiryMessages: {
        controller: 'InquiryMessagesCtrl',
        templateUrl: '/views/conversation/messages.html',
        resolve: {
          conversation: serviceResolve('Conversation', 'get')
        }
      },
      newConversation: {
        controller: 'NewConversationCtrl',
        templateUrl: '/views/conversation/new.html',
        resolve: {
          users: serviceResolve('Contacts', 'getUsers'),
          groups: serviceResolve('Groups', 'getGroups')
        }
      },
      noteList: {
        controller: 'NoteListCtrl',
        templateUrl: '/views/note/list.html',
        resolve: {
          notes: serviceResolve('Notes', 'getNotes')
        }
      },
      note: {
        controller: 'NoteCtrl',
        templateUrl: '/views/note/main.html',
        resolve: {
          note: serviceResolve('Notes', 'getNote')
        }
      },
      noteEdit: {
        controller: 'NoteEditCtrl',
        templateUrl: '/views/note/edit.html',
        resolve: {
          note: serviceResolve('Notes', 'getNote')
        }
      },
      noteNew: {
        controller: 'NoteNewCtrl',
        templateUrl: '/views/note/edit.html',
        resolve: {}
      },
      groupList: {
        controller: 'GroupListCtrl',
        templateUrl: '/views/group/list.html',
        resolve: {
          groups: serviceResolve('Groups', 'getGroups')
        }
      },
      groupEdit: {
        controller: 'GroupEditCtrl',
        templateUrl: '/views/group/edit.html',
        resolve: {
          group: serviceResolve('Groups', 'getGroup'),
          users: serviceResolve('Contacts', 'getUsers')
        }
      },
      groupNew: {
        controller: 'GroupEditCtrl',
        templateUrl: '/views/group/edit.html',
        resolve: {
          group: function(){}, // no group
          users: serviceResolve('Contacts', 'getUsers')
        }
      }
    };

    $routeProvider
      .when('/', {
        redirectTo: '/conversation'
      })
      .when('/conversation', {
        fragments: [f.conversationList]
      })
      .when('/conversation/new', {
        fragments: [f.conversationList, f.newConversation]
      })
      .when('/conversation/:id', {
        fragments: [f.conversationList, f.conversation]
      })
      .when('/conversation/:id/:sub', {
        fragments: [f.conversationList, f.conversation, f.inquiryMessages]
      })
      .when('/notes', {
        fragments: [f.noteList]
      })
      .when('/notes/new', {
        fragments: [f.noteList, f.noteNew]
      })
      .when('/notes/:id', {
        fragments: [f.noteList, f.note]
      })
      .when('/notes/:id/edit', {
        fragments: [f.noteList, f.noteEdit]
      })
      .when('/groups', {
        fragments: [f.groupList]
      })
      .when('/groups/new', {
        fragments: [f.groupList, f.groupNew]
      })
      .when('/groups/:id', {
        fragments: [f.groupList, f.groupEdit]
      })
      .otherwise({
        redirectTo: '/'
      });
  }]).run(['$rootScope', '$location', function($rootScope, $location) {
    $rootScope.$isActive = function(location) {
      if(location.substring(location.length - 1) === '%') {
        var start = location.substring(0, location.length - 1);
        return $location.path().substring(0, start.length) === start;
      }

      return location === $location.path();
    };

    $rootScope.$goTo = function(location) {
      $location.path(location);
    };
  }]).directive('inputGroupSingular', function() {
    return {
      restrict: 'C',
      link: function(scope, elm, ctrls) {
        /*jshint unused:false */
        elm.children().on('focus', function() {
          elm.addClass('focus');
        }).on('blur', function() {
          elm.removeClass('focus');
        });
      }
    };
  });

if(!Date.prototype.toISOString) {
  (function() {
    function pad(number) {
      var r = String(number);
      if(r.length === 1) {
        r = '0' + r;
      }
      return r;
    }

    Date.prototype.toISOString = function() {
      return this.getUTCFullYear()
        + '-' + pad( this.getUTCMonth() + 1 )
        + '-' + pad( this.getUTCDate() )
        + 'T' + pad( this.getUTCHours() )
        + ':' + pad( this.getUTCMinutes() )
        + ':' + pad( this.getUTCSeconds() )
        + '.' + String( (this.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
        + 'Z';
    };
  })();
}