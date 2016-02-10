angular.module 'oekoKostenrechner'
  .service 'Processor', (DynamicInput)->
    class Processor
      constructor: (@settings)-> # Processor settings
      getSettingsBy: (filter)=>
        _(@settings)
          .filter(filter)
          .sortBy('importancerank')
          .reverse()
          .value()
      # Some settings can be seen on list
      getPreliminarySettings: => @getSettingsBy preliminary: yes
      # Some settings can be seen on list
      getListedSettings: => @getSettingsBy shownonthelist: yes
      # Some settings can be used as x axis
      getXAxisSettings: => @getSettingsBy canbeonxaxis: yes
