angular.module 'oekoKostenrechner'
  .service 'Processor', (DynamicInput)->
    class Processor
      constructor: (@settings, @display)->
        # The @settings object define every variables
        # The @display defines variables combinations that can be calculated
      getSettingsBy: (filter)=>
        _(@settings)
          .filter(filter)
          .sortBy('importancerank')
          .reverse()
          .value()
      # Only returns settings names
      getSettingsNames: => _.map @settings, 'name'
      # Some settings can be seen on list
      getPreliminarySettings: => @getSettingsBy preliminary: yes
      # Some settings can be seen on list
      getListedSettings: => @getSettingsBy shownonthelist: yes
      # Some settings can be used as x axis
      getXAxisSettings: => @getSettingsBy canbeonxaxis: yes
      # Find the display for the given query
      findDisplay: (query)=> _.find @display, query
