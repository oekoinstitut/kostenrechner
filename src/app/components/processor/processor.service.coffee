angular.module 'oekoKostenrechner'
  .service 'Processor', ->
    class Processor
      constructor: (@settings)->
        # Processor settings
