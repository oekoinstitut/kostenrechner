angular.module 'oekoKostenrechner'
  .config ($stateProvider)->
    $stateProvider
      .state 'main.chart.table',
        templateUrl: 'app/main/chart/table/table.html'
        controller: 'MainChartTableController'
        controllerAs: 'table'
