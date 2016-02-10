angular.module 'oekoKostenrechner'
  .controller 'MainChartController', ($scope)->
    'ngInject'
    new class MainChartController
      constructor: ->
        # Shortcut to the vehicles created by the user
        @vehicles = $scope.$parent.main.vehicles
