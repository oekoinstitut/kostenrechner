angular.module 'oekoKostenrechner'
  .controller 'MainController', ($scope, $timeout, processor, DynamicInput, DYNAMIC_INPUT)->
    'ngInject'
    new class MainController
      constructor: ->
        @vehicle = {}
        @activeStepIdx = 0
        @started = no
        @types = DYNAMIC_INPUT
        # Step values
        @values = {}
        @inputs = {}
      # Start the quiz
      start: =>
        @started = yes
        # Force values related to a step to refresh
        do @refreshStep
      # We store active step's values to avoid infinite digest
      refreshStep: =>
        # Create a dictionnary of inputs
        @inputs[s.id] = new DynamicInput(s) for s in processor.settings
        # Refresh value list from
        @values[id] = @inputs[id].getValues @vehicle for id of @inputs
        # rzSlider doesn't like to be rendered into an hidden element
        $timeout (->$scope.$broadcast 'reCalcViewDimensions'), 300
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
      # Allow or not navigation
      hasNextStep: => @activeStepIdx < @getStepsCount() - 1
      hasPreviousStep: => @activeStepIdx > 0
      # Go to the next step and refresh step's values
      nextStep: =>
        if do @hasNextStep
          @activeStepIdx++
          # Force values related to a step to refresh
          do @refreshStep
      # Go to the previous step and refresh step's values
      previousStep: =>
        unless @hasPreviousStep()
          @started = no
        else
          @activeStepIdx--
          # Force values related to a step to refresh
          do @refreshStep
