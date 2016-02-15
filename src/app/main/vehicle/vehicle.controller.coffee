angular.module 'oekoKostenrechner'
  .controller 'MainVehicleController', (vehicle, index, processor, DynamicInput, $scope)->
    'ngInject'
    new class MainVehicleController
      constructor: ->
        @vehicle        = vehicle
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
            # Groups are ordered using there bigest importancerank
            importancerank: _.max(settings, 'importancerank').importancerank
          res
        , []
        $scope.$watch 'modal.vehicle', ->
          # Refresh value list from
          @values[id]     = @inputs[id].getValues @newVehicle for id of @inputs
        # Deep watch vehicle change
        , yes
