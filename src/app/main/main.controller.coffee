angular.module 'oekoKostenrechner'
  .controller 'MainController', ($state, processor)->
    'ngInject'
    new class MainController
      constructor: ->
        @listedSettings = do processor.getListedSettings
        # Vehicles created by the user
        @vehicles = [
          {
            "acquisition_year": 2014,
            "mileage": 30000,
            "car_type": "klein",
            "energy_type": "hybrid"
          }
        ]
        $state.go 'main.chart'

      hasNoParent: (setting)-> setting.parentid is '' or isNaN setting.parentid
      removeVehicle: (index)=> @vehicles.splice index, 1
