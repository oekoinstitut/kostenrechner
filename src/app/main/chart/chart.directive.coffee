angular.module 'oekoKostenrechner'
  .directive 'chart', ->
    'ngInject'
    restrict: 'EA'
    scope:
      x: "="
      y: "="
      vehicles: "="
      type: "="
      processor: "="
    link: (scope, element, attr)->
      new class Chart
        bindWatchers: ->
          scope.$watch 'type', (type, old)=> @chart.transform type if old?
          scope.$watch 'vehicles', (vehicles, old)=>
            # Are we initializing the data
            if old?
              # Current data columns
              cols = do @generateColumns
              # Load new data
              @chart.load
                columns: cols
                # Previous data column (only the one that disapeared)
                unload: _.difference _.map(@chart.data(), 'id'), _.map(cols, 0)
          # Deep watch vehicles
          , yes
        generateColumns: ->
          for vehicle in scope.vehicles
            ["Vehicle #{vehicle.id}", 0, Math.random() * 10, Math.random() * 20, Math.random() * 30]
        generateChart: =>
          @chart = c3.generate
            bindto: element[0]
            padding:
              right: 20
              top: 20
            data:
              type: scope.type
              columns: do @generateColumns
        constructor: ->
          # Bind watcher on scope attributes
          do @bindWatchers
          # Generate the chart
          do @generateChart
