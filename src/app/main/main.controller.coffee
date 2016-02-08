angular.module 'oekoKostenrechner'
  .controller 'MainController', (processor, form)->
    'ngInject'
    new class MainController
      constructor: ->
        @activeStep = 0
      # List of steps from Form instance
      getSteps: form.getSteps
      isStepActive: (step, index)=> index is do @getActiveStep
      getActiveStep: => @activeStep
      hasNextStep: => @activeStep < @getSteps().length - 1
      nextStep: => @activeStep++ if do @hasNextStep
