

angular.module('ModelViewer', [])
.service('ModelViewer', ['$http', '$q', '$rootScope',
function($http, $q, $rootScope) {
    var key = "selectedModels";

    var self = this;

    // models that are displayed in sidebar
    var current = localStorage.getItem(key);
    this.models = (current ? angular.fromJson(current) : []);
    console.log('stored items', this.models)

    // models for things in compare view
    this.referencing = {};
    this.selectedFBAs = [];

    // actual data cache
    this.data = {};


    this.add = function(item) {
        // model has the form {ws: 'foo', name: bar}
        // similary for fba
        self.models.push(item);
        localStorage.setItem(key, angular.toJson(self.models));
        $rootScope.$broadcast('MV.event.change');
    }

    this.addBulk = function(models) {
        self.models = self.models.concat(models);
        localStorage.setItem(key, angular.toJson(self.models));
        $rootScope.$broadcast('MV.event.change');
    }

    this.rm = function(item) {
        for (var i=0; i<self.models.length; i++) {
            if ( angular.equals(self.models[i], item) )
                self.models.splice(i, 1);
        }

        localStorage.setItem(key, angular.toJson(self.models));
        $rootScope.$broadcast('MV.event.change');
    }

    this.rmAll = function() {
        self.models.splice(0, self.models.length);
        localStorage.setItem(key, '[]');
        this.referencing = {};
        $rootScope.$broadcast('MV.event.change');
    }

    this.isSelected = function(item) {
        for (var i=0; i<this.models.length; i++) {
            if (angular.equals(this.models[i], item))
                return true;
        }

        return false;
    }

    this.getRelatedObjects = function(objs, type) {
        return $http.rpc('ws', 'list_referencing_objects', objs)
                    .then(function(res) {
                        var items = res[0];

                        var related = [];
                        for (var i=0; i<items.length; i++) {
                            var item = items[i];

                            if (item[2].split('-')[0] !== type) continue;

                            related.push(items[i]);
                        }

                        return related;
                    })
    }


    // This uses this.models (organized by type)
    // and updates this.data
    // Format:    {model: [{ws: ws, name: name}, ...],
    //             fba: [{ws: ws, name: name}, ...]}
    //
    // - Is type-independent (should work for transcriptomic data)
    //
    this.updateData = function() {
        var items = angular.copy(self.models);

        var objIDs = [];
        for (var i=0; i<items.length; i++) {
            var item = items[i];

            for (var type in item) {
                var ws = item[type].ws,
                    name = item[type].name;

                if ( !(type in objIDs) )
                    objIDs[type] = [];

                objIDs[type].push({workspace: ws, name: name})
            }
        }

        var proms = [];
        for (var type in objIDs) {
            proms.push( $http.rpc('ws','get_objects', objIDs[type]) )
        }

        return $q.all(proms).then(function(d) {

                    var data = {};
                    for (var i=0; i<proms.length; i++) {
                        var set = d[i];

                        for (var j=0; j<set.length; j++) {
                            var obj = set[j];
                            var type = obj.info[2].split('-')[0].split('.')[1];

                            if (!(type in data)) data[type] = [];

                            data[type].push(obj.data);
                        }
                    }

                    self.data = data;

                    return self.data
               });
    }

    this.getMaps = function() {
        return $http.rpc('ws', 'list_objects', {workspaces: ['nconrad:paths'], includeMetadata: 1})
                    .then(function(res) {
                        var maps = [];
                        for (var i in res) {
                            maps.push({id: res[i][1],
                                       name: res[i][10].name,
                                       rxnCount: res[i][10].reaction_ids.split(',').length,
                                       cpdCount: res[i][10].compound_ids.split(',').length,
                                       source: 'KEGG'
                                      })
                        }
                        return maps;
                    })
    }


    this.getMaps = function() {
        return $http.rpc('ws', 'list_objects', {workspaces: ['nconrad:paths'], includeMetadata: 1})
                    .then(function(res) {
                        var maps = [];
                        for (var i in res) {
                            maps.push({id: res[i][1],
                                       name: res[i][10].name,
                                       rxnCount: res[i][10].reaction_ids.split(',').length,
                                       cpdCount: res[i][10].compound_ids.split(',').length,
                                       source: 'KEGG'
                                      })
                        }

                        return maps;
                    })
    }


    /*
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
    }*/

    //if (this.models.length)
   //     this.getRefs = this.updateRefs();

}])