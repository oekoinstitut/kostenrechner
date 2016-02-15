angular.module 'oekoKostenrechner'
  .controller 'MainVehicleController', (vehicle, index, processor)->
    'ngInject'
    new class MainVehicleController
      constructor: ->
        @vehicle        = vehicle
        @index          = index
        @listedSettings = do processor.getListedSettings
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
        console.log @groups
