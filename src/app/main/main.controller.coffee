angular.module 'oekoKostenrechner'
  .controller 'MainController', ($state, $translate, $uibModal, processor, MAIN)->
    'ngInject'
    new class MainController
      constructor: ->
        @processor = processor
        @listedSettings = do processor.getListedSettings
        # Vehicles created by the user
        @vehicles = processor.vehicles
        # do @addDefaultVehicles
        # @openVehicle @vehicles[0], 0
        # $state.go 'main.chart.tco'
      # Get/Set current language
      use: $translate.use
      addDefaultVehicles: ->
        @vehicles = []
        # Dummy vehicles
        @addVehicle
          "acquisition_year": (new Date).getFullYear()
          "car_type": "mittel"
          "energy_type": "diesel"
          "mileage": 18000
        @addVehicle
          "acquisition_year": (new Date).getFullYear()
          "car_type": "mittel"
          "energy_type": "BEV"
          "mileage": 18000
          "reichweite": 170
      updateComputedCosts: =>
        vehicle.computeCosts() for vehicle in @vehicles
      openVehicle: (vehicle, index)->
        @vehicleModal = $uibModal.open
          animation: no
          size: 'lg'
          templateUrl: 'app/main/vehicle/vehicle.html'
          controller: 'MainVehicleController'
          controllerAs: 'modal'
          resolve:
            vehicle:   -> vehicle
            index:     -> index
            processor: -> processor
        @vehicleModal.result.then @updateComputedCosts
      hasNoParent: (setting)->
        setting.parentid is null or isNaN setting.parentid
      filterSetting: (vehicle)=>
        (setting)=>
          # No specific condition
          (setting.specifictoenergytype is null or
          # The setting is related to a specific enery type
          _.map( setting.specifictoenergytype.split(','), _.trim).indexOf( vehicle.energy_type ) > -1 ) and
          # The setting has no parent and is not related to a preset
          vehicle[setting.name]? and @hasNoParent setting and setting.context is 'vehicle'
      removeVehicle: (index)=> @vehicles.splice index, 1
      getVehicleColor: (n)-> MAIN.COLORS[(n-1) % MAIN.COLORS.length]
      getVehicleOpts: (vehicle)->
        energy_type: $translate.instant vehicle.energy_type
        car_type:  $translate.instant vehicle.car_type
      addVehicle: (params)=>
        vehicle = new Vehicle params
        # Create a uniq id for this vehiclle
        vehicle.id = do _.uniqueId
        # Create a color for this vehiclle
        vehicle.color = @getVehicleColor vehicle.id
        # Add the vehicle to the list
        @vehicles.push vehicle
