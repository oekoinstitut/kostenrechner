angular.module 'oekoKostenrechner'
  .controller 'MainPageController', (content, $state, $rootScope)->
    'ngInject'
    new class MainPageController
      constructor: ->
        @content = content
        # Language change
        $rootScope.$on '$translateChangeSuccess', (ev, use)->
          # Reload the state to update content
          $state.go 'main.page', use, reload: no if $state.current.name is 'main.page'
