# @src http://stackoverflow.com/a/14996261
angular.module 'oekoKostenrechner'
  .directive 'selectOnClick', ($window)->
    'ngInject'
    restrict: 'A'
    link: (scope, element)->
      element.on 'click', ->
        if not $window.getSelection().toString()
          # Required for mobile Safari
          @setSelectionRange 0, @value.length
