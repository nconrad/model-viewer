
angular.module('mv-controllers', [])
.controller('MainCtrl',
    ['$scope', 'ModelViewer',
    function($scope, MV) {

    $scope.MV = MV;

    $scope.updateCompare = function() {
        $scope.$broadcast('updateCompare');
    }
}])

.controller('SelectedModels', ['$scope', function($scope) {

    $scope.MV = ModelViewer;
    $scope.models = ModelViewer.models;

}])

.controller('Compare', ['$scope', 'ModelViewer', function($scope, ModelViewer) {

    $scope.MV = ModelViewer;

    // default tab
    $scope.tab = 'Selected';

    // selected models
    $scope.models = ModelViewer.models;
    console.log('models', $scope.models)

    // input model for selected FBAS; gives names;
    $scope.selectedFBAs = {};

    // related fba results
    var fbas = [];
    for (var i=0; i<$scope.models.length; i++) {
        var m = $scope.models[i];
        fbas.push( ModelViewer.getRelatedFBAS(m.workspace, m.name) );
    }

    $scope.relatedFBAs = fbas;


    $scope.updateView = function($index, ws, name) {
        $scope.$broadcast('updateCompare', $scope.selectedFBAs);
    }


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


    if ($stateParams.ws == 'coremodels_ATP') {
        var params = {workspaces: [$stateParams.ws],
                                    includeMetadata: 1};
    } else if ($stateParams.ws == 'coremodels') {
        var params = {workspaces: [$stateParams.ws],
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
