angular.module 'oekoKostenrechner'
  .controller 'MainPageController', (content, $state, $rootScope)->
    'ngInject'
    new class MainPageController
      constructor: ->
        @content = content
        # Language change
        $rootScope.$on '$translateChangeSuccess', ->
          # Reload the state to update content
          $state.go $state.current, {}, reload: yes
