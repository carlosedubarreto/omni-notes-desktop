var ONApp;

(function () {
    'use strict';

    var _templateBase = 'app/scripts';

    ONApp = angular.module('ONApp', [
        'ngRoute',
        'ngMaterial',
        'ngAnimate',
        "ngAria",
        'ngMdIcons',
        'colorpicker.module',
        'LocalStorageModule',
        'cfp.hotkeys',
        'ngFileUpload',
        'nsPopover',
        'angularMoment'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: _templateBase + '/list/list.html'
                });
            $routeProvider.otherwise({
                redirectTo: '/'
            });
        }]);
})();
