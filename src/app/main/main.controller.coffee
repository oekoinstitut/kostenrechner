angular.module 'oekoKostenrechner'
  .controller 'MainController', ($state)->
    'ngInject'
    new class MainController
      constructor: ->
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
