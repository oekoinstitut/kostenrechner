angular.module 'oekoKostenrechner'
  .controller 'MainChartController', ($scope, $state, processor)->
    'ngInject'
    new class MainChartController
      constructor: ->
        # Shortcut to the vehicles created by the user
        @vehicles = $scope.$parent.main.vehicles
        # X-axis available options
        @xAxisOptions = do processor.getXAxisSettings
        # Get default X-axis value
        @xAxis = @xAxisOptions[0]
        @yAxis = 'TCO'
        @type  = 'line'
        # Always redirect to child state
        $state.go 'main.chart.evolution'
