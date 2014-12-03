

angular.module('coreModelViewer')
.service('ModelList', function() {
    var key = "selectedModels";

    var self = this;

    // models that are displayed in sidebar
    var current = localStorage.getItem(key);
    this.models = (current ? angular.fromJson(current) : []);

    this.add = function(ws, name) {
        self.models.push({workspace: ws, name: name});
        localStorage.setItem(key, angular.toJson(self.models));
        console.log(self.models)
    }

    this.addBulk = function(models) {
        self.models = self.models.concat(models);
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