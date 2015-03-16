
angular.module('mv-controllers', [])
.controller('MainCtrl',
    ['$scope', 'ModelViewer',
    function($scope, MV) {

    $scope.MV = MV;

}])

.controller('SelectedData', ['$scope', '$mdDialog',
function($scope, $dialog) {

    $scope.openFBAView = function(ev, item) {
        $dialog.show({
            templateUrl: 'views/dialogs/fba.html',
            targetEvent: ev,
            controller: ['$scope', '$http', 'ModelViewer',
                function($scope, $http, MV) {
                $scope.MV = MV;
                $scope.item = item;

                MV.getRelatedObjects([{workspace: item.model.ws, name: item.model.name}], 'KBaseFBA.FBA')
                    .then(function(fbas) {
                        $scope.fbas = fbas;
                    })


                $scope.cancel = function(){
                    $dialog.hide();
                }
                $scope.select = function(item){

                }
            }]
        })
    }

}])

.controller('Compare', ['$scope', 'ModelViewer', function($scope, MV) {
    $scope.MV = MV;

    // default tab
    $scope.tab = 'Heatmap';


    // input model for selected FBAS; gives names;
    $scope.selectedFBAs = {};

    // related fba resultsl displayed in dropdowns in UI
    var fbas = [];
    for (var i=0; i< MV.models.length; i++) {
        var m = MV.models[i];
        fbas.push( MV.getRelatedFBAS(m.workspace, m.name) );
    }

    $scope.relatedFBAs = fbas;


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


    if ($stateParams.ws === 'coremodels_ATP') {
        var params = {workspaces: [$stateParams.ws],
                                    includeMetadata: 1};
    } else if ($stateParams.ws === 'coremodels') {
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

  .controller('AppCtrl', ['$scope', '$log', function ($scope, $log) {
    var tabs = [
        { title: 'One', content: "Tabs will become paginated if there isn't enough room for them."},
        { title: 'Two', content: "You can swipe left and right on a mobile device to change tabs."},
        { title: 'Three', content: "You can bind the selected tab via the selected attribute on the md-tabs element."},
        { title: 'Four', content: "If you set the selected tab binding to -1, it will leave no tab selected."},
        { title: 'Five', content: "If you remove a tab, it will try to select a new one."},
        { title: 'Six', content: "There's an ink bar that follows the selected tab, you can turn it off if you want."},
        { title: 'Seven', content: "If you set ng-disabled on a tab, it becomes unselectable. If the currently selected tab becomes disabled, it will try to select the next tab."},
        { title: 'Eight', content: "If you look at the source, you're using tabs to look at a demo for tabs. Recursion!"},
        { title: 'Nine', content: "If you set md-theme=\"green\" on the md-tabs element, you'll get green tabs."},
        { title: 'Ten', content: "If you're still reading this, you should just go check out the API docs for tabs!"}
    ];



    $scope.tabs = tabs;
    $scope.selectedIndex = 2;
    $scope.$watch('select!=edIndex', function(current, old){
      if ( old && (old = current)) $log.debug('Goodbye ' + tabs[old].title + '!');
      if ( current )                $log.debug('Hello ' + tabs[current].title + '!');
    });
    $scope.addTab = function (title, view) {
      view = view || title + " Content View";
      tabs.push({ title: title, content: view, disabled: false});
    };
    $scope.removeTab = function (tab) {
      for (var j = 0; j < tabs.length; j++) {
        if (tab.title === tabs[j].title) {
          $scope.tabs.splice(j, 1);
          break;
        }
      }
    };
}]);
