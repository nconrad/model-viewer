




app.controller('Ctrl', function($scope, $stateParams, $filter, ngTableParams, ModelList) {

    $scope.ML = ModelList; 

}).controller('SelectedModels', function($scope, $stateParams, $filter, ngTableParams, ModelList) {

    $scope.ML = ModelList;
    $scope.models = ModelList.models;

}).controller('Compare', function($scope, ModelList) {

    $scope.ML = ModelList;
    $scope.models = ModelList.models;

}).controller('ObjectPage', function($scope, $stateParams) {

    $scope.ws = $stateParams.ws;
    $scope.name = $stateParams.name;

    $scope.tab = $stateParams.tab;
    console.log($scope.ws,$scope.name,$scope.tab)
})




app.service('ModelList', function() {
    var key = "selectedModels";

    var self = this;

    // models that are displayed in sidebar
    var current = localStorage.getItem(key);
    this.models = (current ? angular.fromJson(current) : []);

    this.add = function(ws, name) {
        self.models.push({workspace: ws, name: name});
        localStorage.setItem(key, angular.toJson(self.models));
    }

    this.rm = function(i) {
        self.models.splice(i, 1);
        localStorage.setItem(key, angular.toJson(self.models));        
    }

    this.rmAll = function() {
        console.log('called')
        self.models.splice(0, self.models.length);
        localStorage.setItem(key, '[]')
    }



})