angular.module 'oekoKostenrechner'
  .controller 'MainVehicleController', (vehicle, index, processor, DynamicInput, $scope, $uibModalInstance)->
    'ngInject'
    new class MainVehicleController
      constructor: ->
        @contexts       = ['vehicle', 'presets']
        @presets        = Vehicle.presets
        @vehicle        = angular.copy vehicle
        @index          = index
        @listedSettings = do processor.getListedSettings
        # Create a dictionnary of inputs
        @inputs         = {}
        @inputs[s.id]   = new DynamicInput(s) for s in processor.settings
        # Cluster settings by groups
        @groups         = _.groupBy @listedSettings, 'group'
        # Create an array of group (instead of an object)
        @groups         = _.reduce @groups, (res, settings, name)->
          res.push
            name: name
            settings: settings
            # Groups are ordered using there smallest importancerank
            importancerank: _.min(settings, 'importancerank').importancerank
          res
        , []
        # Update values when the vehicle change
        $scope.$watch '[modal.vehicle,modal.presets]', =>
          # Create values object
          @values = {} unless @values?
          # Refresh value list from
          @values[id] = @inputs[id].getValues @vehicle for id of @inputs


          # Update vehicle values
          # do @vehicle.computeCosts if @vehicle.computeCosts?
        # Deep watch vehicle changes
        , yes
      saveVehicle: =>
        angular.extend vehicle, @vehicle
        do @close
      close: =>
        $uibModalInstance.close @vehicle
