angular.module 'oekoKostenrechner'
  .config ($stateProvider) ->
    $stateProvider
      .state 'main.permalink',
        url: 'permalink?vehicles'
        controller: 'MainPermalinkController'
        controllerAs: 'permalink'
