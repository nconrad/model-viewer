
angular.module('mv-controllers', [])
.controller('MainCtrl',
    ['$scope', 'ModelViewer',
    function($scope, MV) {

    $scope.MV = MV;

}])

.controller('SelectedData', ['$scope', '$mdDialog',
function($scope, $dialog) {

    $scope.openFBAView = function(ev, $index, item) {
        $dialog.show({
            templateUrl: 'views/dialogs/fba.html',
            targetEvent: ev,
            controller: ['$scope', '$http', 'ModelViewer',
                function($scope, $http, MV) {
                $scope.MV = MV;
                $scope.item = item;
                $scope.selectedIndex = $index;

                MV.getRelatedFBAs([{workspace: item.model.ws, name: item.model.name}])
                    .then(function(fbas) {
                        for (var i=0; i<fbas.length; i++) {
                            if ( $scope.item.fba.name === fbas[i].name &&
                                 $scope.item.fba.ws === fbas[i].ws)

                                 $scope.activeFBAIndex = i;
                        }
                        $scope.fbas = fbas;
                    })

                $scope.selectFBA = function($index, newFBA) {
                    var newItem = {model: {name: item.model.name, ws: item.model.ws },
                                   fba: {name: newFBA.name, ws: newFBA.ws},
                                   org: item.org,
                                   media: newFBA.media};


                    MV.swapItem($scope.selectedIndex, newItem);
                    $scope.activeFBAIndex = $index;
                    $scope.item = newItem;
                    $dialog.hide();
                    angular.element(ev.target).parent().fadeOut(150)
                           .fadeIn(200)
                }

                $scope.cancel = function(){
                    $dialog.hide();
                }

                $scope.select = function(item){

                }
            }]
        })
    }


}])

.controller('Compare', ['$state', '$scope', 'ModelViewer', '$stateParams',
function($state, $scope, MV, $stateParams) {
    $scope.MV = MV;

    // map table
    $scope.predicate = 'id';
    $scope.reverse = false;

    $scope.loading = true;
    MV.getMaps().then(function(d) {
        $scope.loading = false;
        $scope.maps = d;
    })
}])

.controller('ObjectPage',
    ['$scope', '$stateParams',
    function($scope, $stateParams) {

    $scope.ws = $stateParams.ws;
    $scope.name = $stateParams.name;

    $scope.tab = $stateParams.tab;

}])

.controller('FBAByWS', function() {

})

.controller('ModelsByWS',
    ['$scope', '$stateParams', '$http', '$log', 'ModelViewer',
    function($scope, $stateParams, $http, $log, ModelViewer) {
    $scope.ML = ModelViewer;
    $scope.filterOptions = {
            filterText: '',
            useExternalFilter: false,
            showFilter: true
          };

    $scope.gridOptions = {//enableFiltering: true,
                          //enableRowSelection: true,
                          //enableSelectAll: false,
                          filterOptions: $scope.filterOptions,
                          showColumnMenu: true,
                          columnDefs: [
                               {field: "name",
                                displayName: "Name",
                                cellTemplate:
                                        '<div class="ui-grid-cell-contents">'+
                                        '<a ui-sref="modelPage({ws: '+"'"+'coremodels'+"'"+', name: row.entity[col.field]})">'+
                                            '{{row.entity[col.field]}}'+
                                        '</a> '+
                                        '<a ng-click="ML.add({{row.entity.ws}}, {{row.entity.name}})" class="btn btn-default btn-xs pull-right">add model</a>'+
                                        '</div>'},
                                //{field: "blah", displayName: "new"}
                            ]};

    $scope.selectedCount = 0;

    $scope.gridOptions.onRegisterApi = function (gridApi) {
        $scope.gridApi = gridApi;
    }


    var params;
    if ($stateParams.ws === 'coremodels_ATP') {
        params = {workspaces: [$stateParams.ws],
                  includeMetadata: 1};
    } else if ($stateParams.ws === 'coremodels') {
        params = {workspaces: [$stateParams.ws],
                  type: 'KBaseFBA.FBAModel',
                  includeMetadata: 1};
}


    $scope.loading = true;
    $http.rpc('ws', 'list_objects', params)
        .then(function(d) {
            $scope.loading = false;
            var data = [];
            for (var i in d) {
                var ws = d[i][7];
                var name = d[i][1]
                data.push({name: name, blah: 'blah', ws:ws});
            }

            $scope.gridOptions.data = data;
        })

}])

.controller('CompareTabs', ['$scope', '$log', '$timeout', 'ModelViewer', '$compile',
function ($scope, $log, $timeout, MV, $compile) {
    var tabs = [
        { title: 'Heatmap'},
        { title: 'Pathways'}
    ];

    $scope.tabs = tabs;
    $scope.selectedIndex = 0;

    $scope.addTab = function (map) {
        // if is already open, go to it
        for (var i=0; i<tabs.length; i++) {
            if (tabs[i].map === map.id) {
                $scope.selectedIndex = i
                return;
            }
        }

        tabs.push({ title: map.name.slice(0,10)+'...',
                    removable: true,
                    map: map.id});

        $timeout(function() {
            $scope.selectedIndex = tabs.length-1;
            $scope.loadMap(map); //fixme!
        })

        $scope.$on('MV.event.change', function() {
            console.log('updating')
            MV.updateData().then(function() {
                $scope.loadMap(map);
            })
        })
    };

    $scope.removeTab = function (tab) {
        for (var j = 0; j < tabs.length; j++) {
            if (tab.title === tabs[j].title) {
                $scope.tabs.splice(j, 1);
                break;
            }
        }
    };

    $scope.loadMap = function(map) {
        $scope.loadingMap = true;
        $('#'+map.id).find('.path-container').remove();
        $('#'+map.id).append('<div class="path-container">')
        $('#'+map.id).find('.path-container').kbasePathway({models: MV.data.FBAModel,
                                    fbas: MV.data.FBA,
                                    map_ws: 'nconrad:paths',
                                    map_name: map.id,
                                    cb: function() {
                                        $scope.$apply(function() {
                                            $scope.loadingMap = false;
                                        })
                                    }});
    }
}]);
