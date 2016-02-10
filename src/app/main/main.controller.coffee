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
        @addVehicle
          "acquisition_year": 2014,
          "mileage": 30000,
          "car_type": "klein",
          "energy_type": "hybrid"
        @addVehicle
          "acquisition_year": 2012,
          "mileage": 20000,
          "car_type": "klein",
          "energy_type": "hybrid"
      hasNoParent: (setting)-> setting.parentid is '' or isNaN setting.parentid
      removeVehicle: (index)=> @vehicles.splice index, 1
      getColor: (n)-> MAIN.COLORS[n % MAIN.COLORS.length]
      addVehicle: (vehicle)=>
        # Create a uniq id for this vehiclle
        vehicle.id = do _.uniqueId
        # Create a color for this vehiclle
        vehicle.color = @getColor vehicle.id
        # Add the vehicle to the list
        @vehicles.push vehicle
