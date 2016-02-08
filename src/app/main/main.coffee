angular.module 'oekoKostenrechner'
  .config ($stateProvider) ->
    $stateProvider
      .state 'main',
        url: '/'
        templateUrl: 'app/main/main.html'
        controller: 'MainController'
        controllerAs: 'main'
