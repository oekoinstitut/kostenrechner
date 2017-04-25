angular.module 'oekoKostenrechner'
  .config ($translateProvider)->
    'ngInject'
    $translateProvider
      .useStaticFilesLoader
        prefix: 'assets/locales/',
        suffix: '.json'
      .registerAvailableLanguageKeys ['de', 'en'],
        'de_DE': 'de',
        'en_US': 'en',
        'en_UK': 'en',
        'en-US': 'en',
        'en-UK': 'en'
      .fallbackLanguage 'de'
      .useCookieStorage()
      .useSanitizeValueStrategy null
