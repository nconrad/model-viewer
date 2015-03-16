

angular.module('ModelViewer', [])
.service('ModelViewer', ['$http', '$rootScope', function($http, $rootScope) {
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

    this.add = function(item) {
        // model has the form {ws: 'foo', name: bar}
        // similary for fba
        self.models.push(item);
        localStorage.setItem(key, angular.toJson(self.models));
        $rootScope.$broadcast('MV.event.change');
        //self.updateRefs();
    }

    this.addBulk = function(models) {
        self.models = self.models.concat(models);
        localStorage.setItem(key, angular.toJson(self.models));
        //self.updateRefs();
    }

    this.rm = function(item) {
        for (var i=0; i<self.models.length; i++) {
            if ( angular.equals(self.models[i], item) )
                self.models.splice(i, 1);
        }

        //self.models.splice(i, 1);
        localStorage.setItem(key, angular.toJson(self.models));
        $rootScope.$broadcast('MV.event.change');
        //self.updateRefs();
    }

    this.rmAll = function() {
        console.log('called')
        self.models.splice(0, self.models.length);
        localStorage.setItem(key, '[]');
        this.referencing = {};
    }

    this.isSelected = function(item) {
        for (var i=0; i<this.models.length; i++) {
            console.log('***', this.models[i])
            if (angular.equals(this.models[i], item))
                return true;
        }

        return false;
    }


    this.getRelatedObjects = function(objs, type) {
        console.log('objs/type', objs,type)
        return $http.rpc('ws', 'list_referencing_objects', objs)
                    .then(function(res) {
                        console.log('response', res)
                        var items = res[0]

                        var related = [];
                        for (var i=0; i<items.length; i++) {
                            var item = items[i][2]

                            if (item.split('-')[0] !== type) continue;

                            related.push(items[i])
                        }

                        console.log('related', related)
                        return related;
                    })
    }


    this.updateRefs = function() {
        var params = angular.fromJson(angular.toJson(self.models));

        console.log('updating refs for', params)
        return $http.rpc('ws', 'list_referencing_objects', params).then(function(refs) {
            console.log('returned refs are', refs)
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


                    if (kind === "FBA")
                        self.referencing[ws+'/'+name].FBAS.push({ref: ref[6]+'/'+ref[0], name: ref[1] });
                    else if (kind === "Gapfilling")
                        self.referencing[ws+'/'+name].Gapfillings.push({ref: ref[6]+'/'+ref[0], name: ref[1] });
                }
            }

            return self.referencing;

        }).catch(function(e){
            console.error('updating refs failed:', e.error.message)
        })
    }

    this.getRelatedFBAS = function(ws, name) {
        if (!self.referencing[ws+'/'+name]) return;
        return self.referencing[ws+'/'+name].FBAS;
    }


    this.updateModelData = function() {
        console.log('calling')
        return $http.rpc('ws','get_objects', self.models).then(function(d){
            var models = [];
            for (var i in d) models.push(d[i].data);

            self.modelData = models;

            return self.modelData;
        });
    }

    //if (this.models.length)
   //     this.getRefs = this.updateRefs();

}])