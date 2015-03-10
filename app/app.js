


var app = angular.module('coreModelViewer',
['config',
 'core-directives',
 'mv-controllers',
 'ui.router',
 'kbase-rpc',
 'ModelViewer'])
.config(['$locationProvider', '$stateProvider', '$httpProvider', '$urlRouterProvider',
    function($locationProvider, $stateProvider, $httpProvider, $urlRouterProvider) {


    $locationProvider.html5Mode(false);

    $stateProvider
        .state('home', {
            url: "/",
            templateUrl: 'app/views/home.html'
        }).state('genomes', {
            url: "/genomes/",
            templateUrl: 'app/views/genomes.html',
        }).state('models', {
            url: "/models/",
            templateUrl: 'app/views/models.html',
        }).state('modelsByWS', {
            url: "/models/:ws",
            templateUrl: 'app/views/modelsws.html',
            //controller: 'ModelsByWS'
        }).state('media', {
            url: "/media/",
            templateUrl: 'app/views/media.html',
        }).state('fba', {
            url: "/fba/",
            templateUrl: 'app/views/fbas.html',
        })
        .state('fbaByWS', {
            url: "/fba/:ws",
            templateUrl: 'app/views/fbaws.html',
            controller: 'FBAByWS'
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

        .state('proto', {
            url: "/proto",
            templateUrl: 'app/views/proto.html'
        })

        .state('compare', {
            url: "/compare",
            templateUrl: 'app/views/compare.html',
            controller: 'Compare',
            resolve: {
              'GetRefs': ['ModelViewer', function(ModelViewer){
                return ModelViewer.getRefs;  // wait for refs to be retrieved
              }]
            }
        })



    $urlRouterProvider.when('', '/models/')
                      .when('#', '/models/');

}])

.run(['$rootScope', '$state', '$stateParams', '$location',
    function($rootScope, $state, $stateParams, $location) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    kb = new KBCacheClient();
}]);
