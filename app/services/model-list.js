

angular.module('ModelViewer', [])
.service('ModelViewer', ['$http', '$q', '$rootScope',
function($http, $q, $rootScope) {
    var key = "selectedModels";

    var self = this;

    // models that are displayed in sidebar
    var current = localStorage.getItem(key);
    this.models = (current ? angular.fromJson(current) : []);

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

    this.rm = function(item, broadcast) {
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

    this.swapItem = function(index, newItem) {
        self.models[index] = newItem;
        localStorage.setItem(key, angular.toJson(self.models));
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

    this.getRelatedFBAs = function(objs) {
        return self.getRelatedObjects(objs, 'KBaseFBA.FBA')
                   .then(function(d) {
                        var items = [];

                        for (var i=0; i<d.length; i++) {
                            var obj = d[i],
                                meta = d[i][10];

                            items.push({name: obj[1],
                                        ws: obj[7],
                                        media: obj['media'],
                                        objective: (meta['Objective'] === '10000000' ?
                                                        0 : meta['Objective']),
                                        rxnCount: meta['Number reaction variables'],
                                        cpdCount: meta['Number compound variables'],
                                        maximized: meta['Maximized'] ? 'true' : 'false',
                                       })

                        }

                        return items;
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



}])