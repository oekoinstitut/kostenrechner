angular.module 'oekoKostenrechner'
  .controller 'MainController', ($scope, processor, DYNAMIC_INPUT)->
    'ngInject'
    new class MainController
      constructor: ->
        @vehicle = {}
        @activeStepIdx = 0
        @started = no
      # Start the quiz
      start: =>
        @started = yes
        do @updateStepValues
      # Count steps
      getStepsCount: => @getSteps().length
      # List of steps from Form instance
      getSteps: ->
        # Use step from the processor's settings
        _.chain processor.settings
          # Only keeps settings that are explicitely
          # made for the preliminary steps
          .filter preliminary: yes
          # Order the list using the importancerank DESC
          .orderBy (s)-> - s.importancerank
          .value()
      isStepActive: (step, index)=> index is do @getActiveStepIdx
      isStepType: (step, type)-> step.input.getType() is DYNAMIC_INPUT[type]
      # Shortcuts on the active step
      getActiveStep: => @getSteps()[@activeStepIdx]
      getActiveStepIdx: => @activeStepIdx
      getActiveStepValues: => @activeStepValues
      # We store active step's values to avoid infinite digest
      updateStepValues: => @activeStepValues = @getActiveStep().input.getValues @vehicle
      # Allow or not navigation
      hasNextStep: => @activeStepIdx < @getStepsCount() - 1
      hasPreviousStep: => @activeStepIdx > 0
      # Go to the next step and refresh step's values
      nextStep: =>
        if do @hasNextStep
          @activeStepIdx++
          do @updateStepValues
      # Go to the previous step and refresh step's values
      previousStep: =>
        unless @hasPreviousStep()
          @started = no
        else
          @activeStepIdx--
          do @updateStepValues
