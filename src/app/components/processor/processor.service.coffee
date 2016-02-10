angular.module 'oekoKostenrechner'
  .service 'Processor', (DynamicInput)->
    class Processor
      constructor: (@settings)->
        # Processor settings
