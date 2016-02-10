angular.module 'oekoKostenrechner'
  .config ($stateProvider) ->
    $stateProvider
      .state 'main.form',
        templateUrl: 'app/main/form/form.html'
        controller: 'MainFormController'
        controllerAs: 'form'
