

angular.module('ModelViewer', [])
.service('ModelViewer', function($http) {
    var key = "selectedModels";

    var self = this;

    // models that are displayed in sidebar
    var current = localStorage.getItem(key);
    this.models = (current ? angular.fromJson(current) : []);

    // models for things in compare view
    this.referencing = {};
    this.selectedFBAs = [];

    // actual data cache
    this.modelData = [];

    this.add = function(ws, name) {
        self.models.push({workspace: ws, name: name});
        localStorage.setItem(key, angular.toJson(self.models));
        self.updateRefs();
    }

    this.addBulk = function(models) {
        self.models = self.models.concat(models);
        localStorage.setItem(key, angular.toJson(self.models));
        self.updateRefs();           
    }

    this.rm = function(i) {
        self.models.splice(i, 1);
        localStorage.setItem(key, angular.toJson(self.models));
        self.updateRefs();          
    }

    this.rmAll = function() {
        console.log('called')
        self.models.splice(0, self.models.length);
        localStorage.setItem(key, '[]');
        this.referencing = {};
    }


    this.updateRefs = function() {
        console.log('updating refs')

        var params = angular.fromJson(angular.toJson(self.models));
        return $http.rpc('ws', 'list_referencing_objects', params).then(function(refs) {
            for (var i=0; i< self.models.length; i++) {
                var model = self.models[i];
                var ws = model.workspace;
                var name = model.name;

                self.referencing[ws+'/'+name] = {FBAS: [], Gapfillings: []};
                //self.models[i].refs = {}

                var referencing = refs[i];
                for (var j=0; j< referencing.length; j++) {
                    var ref = referencing[j];
                    var kind = ref[2].split('-')[0].split('.')[1];


                        //self.referencing[ws+'/'+name] = {FBA: ref[6]+'/'+ref[0]};
                        //self.referencing[ws+'/'+name] = {Gapfilling: ref[6]+'/'+ref[0]};
                    if (kind == "FBA")
                        self.referencing[ws+'/'+name].FBAS.push({ref: ref[6]+'/'+ref[0], name: ref[1] });
                        //self.models[i].refs.FBA = ref[6]+'/'+ref[0];
                    else if (kind == "Gapfilling")
                        self.referencing[ws+'/'+name].Gapfillings.push({ref: ref[6]+'/'+ref[0], name: ref[1] });
                        //self.models[i].refs.Gapfilling = ref[6]+'/'+ref[0];

                }
            }


            console.log('self.referencing', self.referencing)
        })
    }

    this.getRelatedFBAS = function(ws, name) {
        return self.referencing[ws+'/'+name].FBAS;
    }


    this.updateModelData = function() {
        return $http.rpc('ws','get_objects', self.models).then(function(d){
            var models = [];
            for (var i in d) models.push(d[i].data);

            self.modelData = models;
            console.log('model data', self.modelData)
            return self.modelData;
        });
    }




})