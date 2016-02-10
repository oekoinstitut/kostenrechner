angular.module 'oekoKostenrechner'
  .controller 'MainController', ($scope, $timeout, processor, DynamicInput)->
    'ngInject'
    new class MainController
      constructor: ->
        # Vehicles created by the user
        @vehicles = []
        # Vehicle that the user is creating
        @newVehicle = {}
        # Index of the current step
        @activeStepIdx = 0
        # True when the form is stared
        @started = no
        # Step' values
        @values = {}
        # Input' inputs
        @inputs = {}
      # Start the quiz
      start: =>
        @started = yes
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
        @vehicles.push @newVehicle
        # Reset the newVehicle var
        @newVehicle = {}
        # Go to the begining
        do @start
      # Count steps
      getStepsCount: => @getSteps().length
      # List of steps from Form instance
      getSteps: ->
        return @steps if @steps?
        # Use step from the processor's settings
        @steps = _.chain processor.settings
          # Only keeps settings that are explicitely
          # made for the preliminary steps
          .filter preliminary: yes
          # Order the list using the importancerank DESC
          .orderBy (s)-> - s.importancerank
          .value()
      isStepActive: (step, index)=> index is do @getActiveStepIdx and @values[step.id]?
      getStepType: (step)=> @inputs[step.id].getType()
      getStepValues: (step)=> @values[step.id]
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
          @started = no
        else
          @setActiveStepIdx @activeStepIdx - 1
