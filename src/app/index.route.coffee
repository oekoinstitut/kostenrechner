angular.module 'oekoKostenrechner'
  .config ($stateProvider, $urlRouterProvider) ->
    'ngInject'
    $urlRouterProvider.otherwise '/'
