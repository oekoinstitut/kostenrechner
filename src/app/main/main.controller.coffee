angular.module 'oekoKostenrechner'
  .controller 'MainController', ($state, processor)->
    'ngInject'
    new class MainController
      constructor: ->
        @processor = processor
        @listedSettings = do processor.getListedSettings
        # Vehicles created by the user
        @vehicles = [
          {
            "id": do _.uniqueId,
            "acquisition_year": 2014,
            "mileage": 30000,
            "car_type": "klein",
            "energy_type": "hybrid"
          },
          {
            "id": do _.uniqueId,
            "acquisition_year": 2012,
            "mileage": 20000,
            "car_type": "klein",
            "energy_type": "hybrid"
          }
        ]
        $state.go 'main.chart'
      hasNoParent: (setting)-> setting.parentid is '' or isNaN setting.parentid
      removeVehicle: (index)=> @vehicles.splice index, 1
