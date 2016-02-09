angular.module 'oekoKostenrechner'
  .config ($stateProvider) ->
    $stateProvider
      .state 'main',
        url: '/'
        templateUrl: 'app/main/main.html'
        controller: 'MainController'
        controllerAs: 'main'
        resolve:
          settings: ($http)->
            'ngInject'
            # Get processor settings
            $http.get 'assets/settings.json'
              # Extract the data subset
              .then (d)-> d.data
          processor: (settings, Processor)->
            'ngInject'
            new Processor settings
