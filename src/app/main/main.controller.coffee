angular.module 'oekoKostenrechner'
  .controller 'MainController', ($state, $translate, processor, MAIN)->
    'ngInject'
    new class MainController
      constructor: ->
        @processor = processor
        @listedSettings = do processor.getListedSettings
        # Vehicles created by the user
        @vehicles = []
      # Get/Set current language
      use: $translate.use
      addDefaultVehicles: ->
        # Dummy vehicles
        for i in [0..1]
          @addVehicle
            "acquisition_year": 2014 + Math.round(Math.random()*10)
            "car_type": ["klein", "mittel", "groß"][i]
            "energy_type": ["benzin", "diesel", "BEV"][i]
      hasNoParent: (setting)->
        setting.parentid is '' or isNaN setting.parentid
      filterSetting: (vehicle)=>
        (setting)=>
          vehicle[setting.name]? and @hasNoParent setting
      removeVehicle: (index)=> @vehicles.splice index, 1
      getVehicleColor: (n)-> MAIN.COLORS[n % MAIN.COLORS.length]
      addVehicle: (params)=>
        vehicle = new Vehicle params
        # Create a uniq id for this vehiclle
        vehicle.id = do _.uniqueId
        # Create a color for this vehiclle
        vehicle.color = @getVehicleColor vehicle.id
        # Add the vehicle to the list
        @vehicles.push vehicle
