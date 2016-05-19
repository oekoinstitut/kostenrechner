angular.module 'oekoKostenrechner'
  .config ($stateProvider) ->
    $stateProvider
      .state 'main',
        url: '/'
        templateUrl: 'app/main/main.html'
        controller: 'MainController'
        controllerAs: 'main'
        resolve:
          language: ($translate)->
            'ngInject'
            $translate.onReady()
          settings: ($http)->
            'ngInject'
            # Get processor settings
            $http.get 'assets/settings.json'
          display: ($http)->
            'ngInject'
            # Get processor display
            $http.get 'assets/display.json'
          processor: (settings, display, Processor)->
            'ngInject'
            new Processor settings.data, display.data
