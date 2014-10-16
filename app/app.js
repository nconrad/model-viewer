


var app = angular.module('coreModelViewer', 
    ['core-directives', 'ui.router', 'ngTable'])
        .config(['$locationProvider', '$stateProvider', '$httpProvider', '$urlRouterProvider',
    function($locationProvider, $stateProvider, $httpProvider, $urlRouterProvider) {


    $locationProvider.html5Mode(false);  

    $stateProvider
         .state('genomes', {
            url: "/genomes/",
            templateUrl: 'app/views/genomes.html',
            controller: 'Ctrl'
        }).state('models', {
            url: "/models/",
            templateUrl: 'app/views/models.html',
            controller: 'Ctrl'
        }).state('modelsws', {
            url: "/models/:ws",
            templateUrl: 'app/views/modelsws.html',
            controller: 'Ctrl'
        }).state('media', {
            url: "/media/",
            templateUrl: 'app/views/media.html',
            controller: 'Ctrl'
        }).state('fba', {
            url: "/fba/",
            templateUrl: 'app/views/fba.html',
            controller: 'Ctrl'
        })

        // object views
        .state('modelPage', {
            url: "/models/:ws/:name",
            templateUrl: 'app/views/modelPage.html',
            controller: 'ObjectPage'
        }).state('mediaPage', {
            url: "/media/:ws/:name",
            templateUrl: 'app/views/mediaPage.html',
            controller: 'ObjectPage'
        }).state('fbaPage', {
            url: "/fba/:ws/:name",
            templateUrl: 'app/views/fbaPage.html',
            controller: 'ObjectPage'
        })

        .state('genome', {
            url: "/genomes/:ws/:name/:tab",
            templateUrl: 'app/views/genomePage.html',
            controller: 'ObjectPage'
        })

        .state('compare', {
            url: "/compare",
            templateUrl: 'app/views/compare.html',
            controller: 'Compare'
        })    

    $urlRouterProvider.when('', '/models/')
                      .when('/', '/models/')
                      .when('#', '/models/');

}]);




app.run(function ($rootScope, $state, $stateParams, $location) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    kb = new KBCacheClient();
});
