angular.module "oekoKostenrechner"
  .animation ".slide", ->
    beforeAddClass: (element, className, done)->
      if className is "ng-hide"
        jQuery(element).show().slideUp(600, done)
      null
    removeClass: (element, className, done)->
      if className is "ng-hide"
        jQuery(element).hide().slideDown(600, done)
      null
