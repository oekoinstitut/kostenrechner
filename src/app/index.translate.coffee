angular.module 'oekoKostenrechner'
  .config ($translateProvider)->
    'ngInject'
    $translateProvider
      .useStaticFilesLoader
        prefix: 'assets/locales/',
        suffix: '.json'
      .registerAvailableLanguageKeys ['en', 'de'],
        'en_US': 'en',
        'en_UK': 'en',
        'en-US': 'en',
        'en-UK': 'en',
        'de_DE': 'de',
      .determinePreferredLanguage ->
        lang = navigator.language or navigator.userLanguage
        avalaibleKeys = [
          'en_US', 'en_UK', 'en-UK', 'en-US', 'en',
          'de_DE', 'de-DE', 'de'
        ]
        if avalaibleKeys.indexOf(lang) is -1 then 'en' else lang
      .fallbackLanguage ['en', 'de']
      .useCookieStorage()
      .useSanitizeValueStrategy null
