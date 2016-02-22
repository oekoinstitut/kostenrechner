angular.module 'oekoKostenrechner'
  .directive 'chart', (DynamicInput, MAIN)->
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
          # Deep watch vehicles
          scope.$watch '[x, y, vehicles, type]', @updateChart, yes
        updateChart: =>
          # New data columns
          cols = do @generateColumns
          # Columns to load or unload
          toUnload = _.difference _.map(@chart.data(), 'id'), _.map(cols, 0)
          # Load new data
          @chart.load
            type: scope.type
            columns: cols
            # Refresh colors and groups
            colors: @generateColors cols
            # categories: @generateXAxis(cols).categories
            # Previous data column (only the one that disapeared)
            unload: toUnload
            # Enhance the chart with d3
            done: @enhanceChart
          # Groups are loaded separetaly
          @chart.groups( @generateGroups cols )
        getVehicleDisplay: (vehicle)->
          x = if scope.type is 'bar' then 'holding_time' else scope.x
          display = scope.processor.findDisplay xaxis: x, yaxis: scope.y
          # Extract display for this vehicle
          vehicle[display.name] if display?
        getXValues: =>
          if scope.type is 'bar'
            # One tick by vehicle
            'Vehicle ' + idx for idx in [1..scope.vehicles.length]
          # Year on x are set manually
          else
            y for y in [@FLOOR_YEAR..@CEIL_YEAR]
        getVehicleValues: (vehicle, component)=>
          # Use xValues to fill empty tick
          xValues = do @getXValues
          # Find the value for this vehicle
          display = @getVehicleDisplay vehicle
          # Iterate over xValues' ticks
          for tick in xValues
            # This vehicle's values are divided into components
            if component?
              display[component][tick]?.total_cost or null
            else
              display[tick] or null
        getRefYear: =>
          refYear = null
          # Collect displays for each vehicle
          displays = ( @getVehicleDisplay vehicle for vehicle in scope.vehicles )
          # We have to find the first common year of the vehicle.
          # First we collect every years in the 'mittel' field of every vehicle.
          years = _.concat.apply(null, _.chain(displays).map('mittel').map(_.keys).value() )
          # Then we find the first year that appear twice
          # so we count the time every year appear.
          countByYear = _.chain(years).map(Number).sort().countBy().value()
          # Look into the count by year to find out.
          for year of countByYear
            # The current year appears as many times as there is vehicles
            if countByYear[year] is scope.vehicles.length
              # So we can take it as referencial
              refYear = year
              # Because the countBy is sorted, we stop asap
              break
          refYear
        generateColumns: =>
          series = [ _.concat(['x'], do @getXValues) ]
          # Spline chart is divided in 3 groups
          if scope.type is 'spline'
            # For each vehicle...
            for vehicle in scope.vehicles
              # Get value by components and year
              if scope.y is 'TCO'
                # Draw the 3 components of a vehicle
                for component in ['contra', 'pro', 'mittel']
                  values = @getVehicleValues vehicle, component
                  series.push(_.concat [vehicle.id + '-' + component], values)
              # Get value by year
              else
                values = @getVehicleValues vehicle
                # Draw a serie by vehicle
                series.push( _.concat ['vehicle-' + vehicle.id], values)
          # Bar chart...
          else
            refYear = do @getRefYear
            values  = {}
            # For this year, we collect variables for each vehicles
            for vehicle in scope.vehicles
              # Target 'mittel' component
              if mittel = @getVehicleDisplay(vehicle).mittel
                # We enclose this part of the code to be able to
                # call it recursivly with variable within an object
                (fn = (obj)->
                  # Now we collect values!
                  for n of obj
                    # Skip 'total' variables
                    continue if n.indexOf('total') is 0
                    # Literal value are taken instantaneously
                    if typeof obj[n] isnt 'object'
                      # Create the array where you'll stores the values for this variable
                      values[n] = [] unless values[n]?
                      values[n].push obj[n]
                    # Recursive lookup to flatten variable object
                    else fn obj[n]
                ) mittel[refYear]
            # Create a serie line for each value
            series = series.concat( _.concat [n], values[n] for n of values)
          series
        generateXAxis: (columns)=>
          type: 'category'
          categories: do @getXValues
        generateColors: (columns)=>
          colors = {}
          if scope.y is 'CO2'
            for v in scope.vehicles
              colors['vehicle-' + v.id] = v.color
          else if scope.y is 'TCO' and scope.type is 'spline'
            for v in scope.vehicles
              for c in ['contra', 'pro']
                colors[v.id + '-' + c] = v.color
              colors[v.id + '-mittel'] = 'white'
          else
            # Do we received data columns?
            columns = do @generateColumns unless columns?
            columns = angular.copy columns
            # One color by key
            for key, idx in _.map(columns.splice(1), 0)
              colors[key] = MAIN.COLORS[idx % MAIN.COLORS.length]
          colors
        generateGroups: (columns)=>
          if scope.type is 'bar'
            # Do we received data columns?
            columns = do @generateColumns unless columns?
            columns = angular.copy columns
            # Every dataset but 'x'
            [ _.map(columns.splice(1), 0) ]
          else
            []
        generateChart: =>
          columns = do @generateColumns
          @chart = c3.generate
            # Enhance the chart with d3
            onrendered: @enhanceChart
            bindto: element[0]
            interaction:
              enabled: yes
            padding:
              right: 20
              top: 20
            legend:
              show: no
            point:
              show: no
            transition:
              duration: @TRANSITION_DURATION
            axis:
              x: @generateXAxis columns
            data:
              x: 'x'
              type: scope.type
              columns: columns
              # We generate those options according to the columns
              colors: @generateColors columns
              groups: @generateGroups columns
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
            .x  (d)=> @chart.internal.x d.x
            .y0 (d)=> @chart.internal.y d.pro
            .y1 (d)=> @chart.internal.y d.contra
        enhanceChart: =>
          # Chart must be ready
          return unless @chart?
          # Prepare areas
          do @setupAreas
          # Disabled areas on bar chart
          vehicles = if scope.type is 'spline' and scope.y is 'TCO' then scope.vehicles else []
          # Within the same group... append a path
          areas = @areasGroup.selectAll('path.d3-chart-area').data vehicles
          areas.enter()
            .append 'path'
            # Name the path after the current group
            .attr 'class', (d)-> 'd3-chart-area d3-chart-area-' + d.id
          # And bind values to the group
          areas.datum( (d)=>
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
          ).style 'fill', (d, i)-> vehicles[i].color
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
