angular.module 'oekoKostenrechner'
  .controller 'MainChartTableController', ($scope, processor, MAIN)->
    'ngInject'
    new class MainChartTableController
      constructor: ->
