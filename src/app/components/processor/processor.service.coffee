angular.module 'oekoKostenrechner'
  .service 'Processor', (DynamicInput)->
    class Processor
      constructor: (@settings)->
        # Processor settings
        @settings = _.each @settings, (setting)->
          # Add an input field to each step
          setting.input = new DynamicInput setting
