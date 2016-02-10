angular.module 'oekoKostenrechner'
  .config ($stateProvider)->
    $stateProvider
      .state 'main.chart',
        templateUrl: 'app/main/chart/chart.html'
        controller: 'MainChartController'
        controllerAs: 'chart'
      .state 'main.chart.tco',
        params:
          type: value: 'spline'
      .state 'main.chart.co2', {}
