angular.module 'oekoKostenrechner'
  .config ($stateProvider)->
    $stateProvider
      .state 'main.page',
        templateUrl: 'app/main/page/page.html'
        controller: 'MainPageController'
        controllerAs: 'page'
        url: 'page/:slug'
        params:
          language:
            value: null
        resolve:
          content: ($stateParams, $http, $translate)->
            'ngInject'
            # Build the markdown path
            path = [
              'assets/markdowns',
              # Look into the right directory
              $stateParams.slug,
              # Choose the right language
              ( $stateParams.language or $translate.proposedLanguage() or $translate.use() ) + '.md'
            ].join('/')
            # Return a promise
            $http.get(path).then (res)-> res.data
