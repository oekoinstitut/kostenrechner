angular.module 'oekoKostenrechner'
  .controller 'MainFormController', ($scope, $timeout, $state, processor, DynamicInput)->
    'ngInject'
    new class MainFormController
      constructor: ->
        # Vehicle that the user is creating
        @newVehicle = {}
        # Step' values
        @values = {}
        # Input' inputs
        @inputs = {}
        # Force values related to a step to refresh
        @setActiveStepIdx 0
      # We store active step's values to avoid infinite digest
      refreshStep: =>
        # Create a dictionnary of inputs
        @inputs[s.id] = new DynamicInput(s) for s in processor.settings
        # Refresh value list from
        @values[id] = @inputs[id].getValues @newVehicle for id of @inputs
        # rzSlider doesn't like to be rendered into an hidden element
        $timeout (->$scope.$broadcast 'reCalcViewDimensions'), 300
      # Add the new vehicle to the list
      addVehicle: =>
        $scope.$parent.main.addVehicle @newVehicle
        # Reset newVehicle to be able to create another vehicle
        @newVehicle = {}
        # Force values related to a step to refresh
        @setActiveStepIdx 0
        # Go to the chart
        $state.go 'main.chart'
      # Count steps
      getStepsCount: => @getSteps().length
      # List of steps from Form instance
      getSteps: ->
        return @steps if @steps?
        # Use step from the processor's settings
        @steps = do processor.getPreliminarySettings
      isStepActive: (step, index)=> index is do @getActiveStepIdx and @values[step.id]?
      getStepType: (step)=> @inputs[step.id].getType()
      getStepValues: (step)=>
        _.extend @values[step.id],
          translate: (v)-> v + ' ' + step.unit
      # Shortcuts on the active step
      getActiveStep: => @getSteps()[@activeStepIdx]
      getActiveStepIdx: => @activeStepIdx
      setActiveStepIdx: (idx)=>
        @activeStepIdx = idx
        # Force values related to a step to refresh
        do @refreshStep
      # Allow or not navigation
      hasNextStep: => @activeStepIdx < @getStepsCount() - 1
      hasPreviousStep: => @activeStepIdx > 0
      # Go to the next step and refresh step's values
      nextStep: =>
        if do @hasNextStep
          @setActiveStepIdx @activeStepIdx + 1
        else
          do @addVehicle
      # Go to the previous step and refresh step's values
      previousStep: =>
        unless @hasPreviousStep()
          # Go to the chart
          $state.go 'main'
        else
          @setActiveStepIdx @activeStepIdx - 1
