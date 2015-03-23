

angular.module('coreModelViewer',
['config',
 'core-directives',
 'mv-controllers',
 'ui.router',
 'kbase-rpc',
 'ngMaterial',
 'ModelViewer'])
.config(['$locationProvider', '$stateProvider', '$httpProvider', '$urlRouterProvider',
    function($locationProvider, $stateProvider, $httpProvider, $urlRouterProvider) {


    $locationProvider.html5Mode(false);

    $stateProvider
        .state('home', {
            url: "/",
            templateUrl: 'views/home.html'
        })

        .state('modelList', {
            url: "/models/",
            templateUrl: 'views/model-list.html',
        })

        /*
        .state('genomes', {
            url: "/genomes/",
            templateUrl: 'views/genomes.html',
        })*/

        .state('media', {
            url: "/media/",
            templateUrl: 'views/media.html',
        }).state('fba', {
            url: "/fba/",
            templateUrl: 'views/fbas.html',
        })
        .state('fbaByWS', {
            url: "/fba/:ws",
            templateUrl: 'views/fbaws.html',
            controller: 'FBAByWS'
        })

        // object views
        .state('modelPage', {
            url: "/models/:ws/:name",
            templateUrl: 'views/modelPage.html',
            controller: 'ObjectPage'
        }).state('mediaPage', {
            url: "/media/:ws/:name",
            templateUrl: 'views/mediaPage.html',
            controller: 'ObjectPage'
        }).state('fbaPage', {
            url: "/fba/:ws/:name",
            templateUrl: 'views/fbaPage.html',
            controller: 'ObjectPage'
        }).state('genome', {
            url: "/genomes/:ws/:name/:tab",
            templateUrl: 'views/genomePage.html',
            controller: 'ObjectPage'
        })

        .state('proto', {
            url: "/proto",
            templateUrl: 'views/proto.html'
        })

        .state('compare', {
            url: "/compare",
            templateUrl: 'views/compare.html',
            controller: 'Compare',
            /*resolve: {
              'GetRefs': ['ModelViewer', function(ModelViewer){
                return ModelViewer.getRefs;  // wait for refs to be retrieved
              }]
            }*/
        })
        /*.state('compare.tab', {
            url: "^/compare/:tab",
        })*/

    $urlRouterProvider.when('', '/models/')
                      .when('#', '/models/');

}])
.config(['$mdThemingProvider', function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('cyan')
        .accentPalette('light-blue');
}])

.run(['$rootScope', '$state', '$stateParams', '$location',
    function($rootScope, $state, $stateParams, $location) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    $rootScope.$on('$stateChangeSuccess',
        function(event, toState, toParams, fromState, fromParams){
            $rootScope.$subURL = toState.url.split('/')[1]
        })

    //kb = new KBCacheClient();
}]);
