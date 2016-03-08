angular.module 'oekoKostenrechner'
  .controller 'MainVehicleController', (vehicle, index, processor, DynamicInput, $scope, $uibModalInstance)->
    'ngInject'
    new class MainVehicleController
      constructor: ->
        @contexts         = ['vehicle', 'presets']
        @presets          = angular.copy Vehicle.presets
        @vehicle          = angular.copy vehicle
        @index            = index
        # Settins edited by the user
        @frozenSettings   = {}
        @listedSettings   = do processor.getListedSettings
        # Create a dictionnary of inputs
        @inputs         = {}
        @inputs[s.id]   = new DynamicInput(s, @vehicle) for s in processor.settings
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
        $scope.$watch 'modal.frozenSettings', =>
          # Update vehicle values
          @vehicle.computeCosts @frozenSettings if @vehicle.computeCosts?
          # Create values object
          @values = {} unless @values?
          # Refresh value list from
          @values[id] = @inputs[id].getValues @vehicle for id of @inputs
        # Deep watch vehicle changes
        , yes
      # A setting has been edited
      editSetting: (setting, value)=>
        @frozenSettings[setting] = value
      gs: (context, name)=>
        (value)=>
          if value?
            @frozenSettings[name] = @[context][name]  = value
          @[context][name]
      # If the given setting is visible
      isSettingVisible: (setting)=>
        # No specific condition
        return yes if setting.specifictoenergytype is null
        # The setting is related to a specific enery type
        _.map( setting.specifictoenergytype.split(','), _.trim).indexOf( @vehicle.energy_type ) > -1
      # If any setting within the group is visible
      isGroupVisible: (group)=> _.some group.settings, @isSettingVisible
      saveVehicle: =>
        angular.extend vehicle, @vehicle
        angular.extend Vehicle.presets, @presets
        do @close
      close: =>
        $uibModalInstance.close @vehicle
