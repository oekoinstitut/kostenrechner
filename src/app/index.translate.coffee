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
      .determinePreferredLanguage ->
        lang = 'de'
        avalaibleKeys = [
          'de_DE', 'de-DE', 'de',
          'en_US', 'en_UK', 'en-UK', 'en-US', 'en'
        ]
        if avalaibleKeys.indexOf(lang) is -1 then 'de' else lang
      .fallbackLanguage 'de'
      .useCookieStorage()
      .useSanitizeValueStrategy null
