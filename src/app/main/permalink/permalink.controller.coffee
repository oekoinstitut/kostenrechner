angular.module 'oekoKostenrechner'
  .controller 'MainPermalinkController', ($state, $stateParams, $scope)->
    'ngInject'
    new class MainPermalinkController
      constructor: ->
        vehicles = angular.fromJson($stateParams.vehicles).splice 0, 2
        # Empty main vehicles array
        $scope.$parent.main.vehicles = []
        # Create a vehicle for each object
        $scope.$parent.main.addVehicle vehicle for vehicle in vehicles
        # Redirect to the chart
        $state.go 'main.chart'
