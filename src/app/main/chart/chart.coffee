angular.module 'oekoKostenrechner'
  .config ($stateProvider)->
    $stateProvider
      .state 'main.chart',
        templateUrl: 'app/main/chart/chart.html'
        controller: 'MainChartController'
        controllerAs: 'chart'
