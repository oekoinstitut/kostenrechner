angular.module 'oekoKostenrechner'
  .controller 'MainController', ->
    'ngInject'
    new class MainController
      constructor: ->
        # Vehicles created by the user
        @vehicles = []
