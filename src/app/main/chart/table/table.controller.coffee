angular.module 'oekoKostenrechner'
  .controller 'MainChartTableController', ($translate)->
    'ngInject'
    new class MainChartTableController
      number: (d)->
        # Available format method
        format = de: 'formatDeDe', en: 'formatEnUs'
        # Choose format according to the current language
        d3_format[ format[do $translate.use]  ].format(',') d
