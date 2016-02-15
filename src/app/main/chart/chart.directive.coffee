angular.module 'oekoKostenrechner'
  .directive 'chart', (DynamicInput)->
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
        TRANSITION_DURATION: 600
        FLOOR_YEAR: 2014
        CEIL_YEAR: 2025
        bindWatchers: ->
          scope.$watch 'x', (x, old)=>
            return unless old?
            # Load new data
            @chart.load
              columns: do @generateColumns
              # Enhance the chart with d3
              done: @enhanceChart
          scope.$watch 'type', (type, old)=>
            return unless old?
            @chart.transform type
            # Enhance the chart with d3
            do @enhanceChart
          scope.$watch 'vehicles', (vehicles, old)=>
            # New data columns
            cols = do @generateColumns
            # Columns to load or unload
            toUnload = _.difference _.map(@chart.data(), 'id'), _.map(cols, 0)
            toLoad = _.difference _.map(cols, 0), _.map(@chart.data(), 'id')
            # Stop if there is nothing to add or remove
            return unless toUnload.length + toLoad.length
            # Load new data
            @chart.load
              columns: cols
              # Refresh colors
              colors: do @generateColors
              # Previous data column (only the one that disapeared)
              unload: toUnload
              # Enhance the chart with d3
              done: @enhanceChart
          # Deep watch vehicles
          , yes
        getVehicleDisplay: (vehicle)->
          display = scope.processor.findDisplay xaxis: scope.x, yaxis: scope.y
          # Extract display for this vehicle
          vehicle[display.name] if display?
        getXValues: =>
          if scope.x is 'holding_time'
            y for y in [@FLOOR_YEAR..@CEIL_YEAR]
          else
            setting = scope.processor.getSettingsBy(name: scope.x)[0]
            input = new DynamicInput setting
            input.getValues().range
        getVehicleValues: (vehicle, component)=>
          # Use xValues to fill empty tick
          xValues = do @getXValues
          # Find the value for this vehicle
          display = @getVehicleDisplay vehicle
          # Iterate over xValues' ticks
          for tick in xValues
            display[component][tick]?.total_cost or null
        generateColumns: =>
          series = [ _.concat(['x'], do @getXValues) ]
          # For each vehicle...
          for vehicle in scope.vehicles
            # Draw the 3 components of a vehicle
            for component in ['contra', 'pro', 'mittel']
              values = @getVehicleValues vehicle, component
              series.push(_.concat [vehicle.id + '-' + component], values)
          series
        generateColors: ->
          colors = {}
          for v in scope.vehicles
            for c in ['contra', 'pro']
              colors[v.id + '-' + c] = v.color
            colors[v.id + '-' + 'mittel'] = 'white'
          colors
        generateChart: =>
          @chart = c3.generate
            # Enhance the chart with d3
            onrendered: => do @enhanceChart if @chart?
            bindto: element[0]
            interaction:
              enabled: no
            padding:
              right: 20
              top: 20
            legend:
              show: no
            point:
              show: no
            transition:
              duration: @TRANSITION_DURATION
            data:
              x: 'x'
              type: scope.type
              colors: do @generateColors
              columns: do @generateColumns
        setupAreas: =>
          # First time we create areas
          if not @svg? or not @areasGroup?
            # Create a D3 elemnt
            @svg = d3.select(element[0]).select('svg')
            # Select the existing c3 chart
            @areasGroup = @svg.select '.c3-chart'
              # Create a group
              .insert 'g', ':first-child'
              # Name it accordingly
              .attr 'class', 'd3-chart-areas'
        getArea: =>
          d3.svg.area()
            .x (d)=> @chart.internal.x d.x
            .y0 (d)=> @chart.internal.y d.pro
            .y1 (d)=> @chart.internal.y d.contra
        enhanceChart: =>
          do @setupAreas
          # Disabled areas on bar chart
          vehicles = if scope.type is 'spline' then scope.vehicles else []
          # Within the same group... append a path
          areas = @areasGroup.selectAll('path.d3-chart-area').data vehicles
          areas.enter()
            .append 'path'
            # Name the path after the current group
            .attr 'class', (d)-> 'd3-chart-area d3-chart-area-' + d.id
          # And bind values to the group
          areas.datum (d)=>
              datum = []
              # Value from chart's data
              pro    = (@chart.data d.id + "-pro")[0].values
              contra = (@chart.data d.id + "-contra")[0].values
              # Merge data into an array
              for i of pro
                # Without null values
                if pro[i].value?
                  # Each spline of the array contains data for both groups
                  # and the value on x
                  datum.push pro: pro[i].value, contra: contra[i].value, x: pro[i].x
              datum
            # Colorize area using the current vehicle's color
            .style 'fill', (d, i)-> vehicles[i].color
          # Update old elements
          areas.transition()
            .duration @TRANSITION_DURATION
            # Bind area object to the path
            .attr 'd', do @getArea
          # Remove useless element
          areas.exit()
            .transition()
              .duration @TRANSITION_DURATION
              .style 'opacity', 0
              .remove()

        constructor: ->
          # Bind watcher on scope attributes
          do @bindWatchers
          # Generate the chart
          do @generateChart
