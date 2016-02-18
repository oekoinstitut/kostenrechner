angular.module 'oekoKostenrechner'
  .directive "formChange", ($parse)->
    restrict: 'A'
    require: "form"
    priority: -1
    link: (scope, element, attrs)->
      cb = $parse attrs.formChange
      element.on "change", (ev)->
        scope.$apply ->
          # Create a new scope
          newScope = do scope.$new
          # Find the input that changed
          modelElm = angular.element ev.target
          # Extract the 'form-change-model' attribute from this input
          modelExp = modelElm.attr 'form-change-model'
          # Evaluate this input's model expression using its own scope
          newScope.$value = if modelExp? then $parse(modelExp) modelElm.scope() else null
          # Call the form expression
          cb newScope
  .directive "formChangeModel", ($parse)->
    restrict: 'A'
    priority: 1000
    require: "^^formChange"
