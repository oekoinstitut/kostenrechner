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
    link: (scope, attr, elm)->
      console.log scope
