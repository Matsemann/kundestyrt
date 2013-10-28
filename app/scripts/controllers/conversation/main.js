'use strict';

angular.module('kundestyrtApp')
  .controller('ConversationCtrl', ['$scope', 'conversation', 'Conversation', '$location', '$anchorScroll', '$timeout', function ($scope, conversation, Conversation, $location, $anchorScroll, $timeout) {
        $scope.conversation = conversation;
        $scope.msg = {text: ''};

        scrollToBottom();

        $scope.send = function() {
            Conversation.send($scope.msg.text, conversation._id).then(function(c) {
                if(c) {
                    $scope.conversation = c;
                    $scope.msg.text = '';
                    scrollToBottom();
                }
            });
        };

        // Needs to wrapped inside a timeout so that it is put in the end of the event queue and happens after the DOM is updated
        function scrollToBottom()  {
            $timeout(function () {
                $location.hash('newMessageBox');
                $anchorScroll();
            }, 0);
        }
  }]);
