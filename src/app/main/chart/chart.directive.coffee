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
                # Refresh colors
                colors: do @generateColors
                # Previous data column (only the one that disapeared)
                unload: _.difference _.map(@chart.data(), 'id'), _.map(cols, 0)
          # Deep watch vehicles
          , yes
        generateColumns: ->
          for vehicle in scope.vehicles
            [vehicle.id, 0, Math.random() * 10, Math.random() * 20, Math.random() * 30]
        generateColors: =>
          colors = {}
          for vehicle in scope.vehicles
            colors[vehicle.id] = vehicle.color
          colors
        generateChart: =>
          @chart = c3.generate
            bindto: element[0]
            interaction:
              enabled: no
            padding:
              right: 20
              top: 20
            legend:
              hide: true
            colors: do @generateColors
            data:
              type: scope.type
              columns: do @generateColumns
        constructor: ->
          # Bind watcher on scope attributes
          do @bindWatchers
          # Generate the chart
          do @generateChart
