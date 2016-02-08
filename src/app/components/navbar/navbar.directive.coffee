angular.module 'oekoKostenrechner'
  .directive 'navbar', ->
    restrict: 'E'
    templateUrl: 'app/components/navbar/navbar.html'
    controller: 'NavbarController'
