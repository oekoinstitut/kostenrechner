angular.module 'oekoKostenrechner'
  .service 'Form', ->
    class Form
      constructor: (@settings)->
      # Processor settings
      getSteps: =>
        _.chain @settings
          .filter preliminary: yes
          .orderBy (s)-> - s.importancerank
          .value()
