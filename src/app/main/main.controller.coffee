angular.module 'oekoKostenrechner'
  .controller 'MainController', ($state, processor, MAIN)->
    'ngInject'
    new class MainController
      constructor: ->
        @processor = processor
        @listedSettings = do processor.getListedSettings
        $state.go 'main.chart'
        # Vehicles created by the user
        @vehicles = []
        # Dummy vehicles
        for i in [0..2]
          @addVehicle
            "acquisition_year": 2014 + Math.round(Math.random()*10)
            "car_type": ["klein", "mittel", "groß"][i]
            "energy_type": ["benzin", "diesel", "BEV"][i]
      hasNoParent: (setting)-> setting.parentid is '' or isNaN setting.parentid
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
