




app.controller('MainCtrl', function($scope, $stateParams, $filter, ModelViewer) {

    $scope.MV = ModelViewer; 

    $scope.updateCompare = function() {
        console.log('broadcas')
        $scope.$broadcast('updateCompare');
    }


}).controller('SelectedModels', function($scope, $stateParams, $filter, ModelViewer) {

    $scope.MV = ModelViewer;
    $scope.models = ModelViewer.models;

}).controller('Compare', function($scope, ModelViewer, GetRefs) {

    $scope.MV = ModelViewer;

    // default tab
    $scope.tab = 'Heatmap';

    // selected models
    $scope.models = ModelViewer.models;

    // input model for selected FBAS; gives names;
    $scope.selectedFBAs = {}

    // update refs.  view waits for this;
    GetRefs().then(function() {
        $scope.getRelatedFBAS = ModelViewer.getRelatedFBAS;
    })

    $scope.fbas = [];
    $scope.updateView = function($index, ws, name) {
        $scope.$broadcast('updateCompare', $scope.selectedFBAs);
    }


}).controller('ObjectPage', function($scope, $stateParams) {

    $scope.ws = $stateParams.ws;
    $scope.name = $stateParams.name;

    $scope.tab = $stateParams.tab;
    console.log($scope.ws,$scope.name,$scope.tab)
})

.controller('FBAByWS', function($scope, $stateParams) {

})


.controller('ModelsByWS', function($scope, $stateParams, $http, $log, ModelViewer) {
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

})
