
angular.module('core-directives', []);
angular.module('core-directives')
.directive('kbTables', function() {
    return {
        link: function(scope, elem, attrs) {
            var type = attrs.kbTables,
                ws = attrs.kbTablesWs,
                obj = attrs.kbTablesObj;

            var params = {type: type,
                          ws: ws,
                          obj: obj,
                          options: {showETC: true, urlRouter: urlRouter}
                         };

            // used to support various apps with different frameworks
            function urlRouter(type, ws, name) {
                if (type === "KBaseFBA.FBAModel")
                    return '/app/#/models/'+ws+'/'+name;
                else if (type === "KBaseFBA.FBA")
                    return '/app/#/fba/'+ws+'/'+name;
                else if (type === "KBaseBiochem.Media")
                    return '/app/#/media/'+ws+'/'+name;

                return;
            }


            $(elem).kbaseTabTable(params);
        }
    }
 })

.directive('pathTest', function() {
    return {
        link: function(scope, elem, attrs) {
            angular.element(elem).kbasePathway({model_ws: 'janakakbase:CoreModels-VR-GP',
                                                model_name: 'core_1000565.3_GP',
                                                map_name: 'map00010',
                                                map_ws: 'nconrad:paths'});
        }
    }
 })
.directive('modelList',
    ['$compile', '$stateParams', 'ModelViewer', '$http', '$timeout',
    function($compile, $stateParams, MV, $http, $timeout) {
    return {
        link: function(scope, elem, attr) {
            var workspaces = ['janakakbase:CM-VR'];


            var table;
            var tableElem;

            scope.tableOptions = {columns: [
                                      { sortable: false, title: "", data: function(d){
                                            return '<i class="fa fa-caret-right" style="opacity: 0.5;"></i>';
                                      }},
                                      { title: "Organism", data: function(d){
                                            return d[10].Name;
                                      }},
                                      { title: "ID", data: function(d) {
                                            var name = d[1],
                                                ws = d[7],
                                                path = "modelPage({ws: '"+ws+"', name: '"+name+"'})",
                                                link = '<a ui-sref="'+path+'" >'+name+'</a>';
                                            return link;
                                      }},
                                      { title: "Reactions", data: function(d){
                                            return d[10]['Number reactions']
                                      }},
                                      { title: "Compounds", data: function(d){
                                            return d[10]['Number compounds'];
                                      }}],
                                  order: [[ 1, "asc" ]],
                                  language: {search: "_INPUT_",
                                             searchPlaceholder: 'Search models'}
                                 }

            //var p = $http.rpc('ws', 'list_objects', {workspaces: workspaces, includeMetadata: 1});

            scope.loading = true;
            $http.get('/data/app/modelList.json')
                 .then(function(data) {
                    scope.loading = false;

                    scope.tableOptions.data = data.data;
                    scope.tableOptions.drawCallback = events;

                    tableElem = $('<table class="table">');
                    $(elem).append(tableElem);
                    table = tableElem.DataTable(scope.tableOptions);
                    $compile(tableElem)(scope);
                 })

            function format(d, rowData) {

                var container = $('<div class="fba-table">');

                container.append('<h5>FBA Results</h5>')
                var table = $('<table class="table table-borderless table-hover table-condensed">');
                container.append(table);

                // header
                table.append('<thead>'+
                                '<tr>'+
                                  '<th><i class="fa fa-check-square-o" style="visibility:hidden;"></i></th>'+
                                  '<th>Media</th>'+
                                  '<th>ID</th>'+
                                  '<th>Objective</th>'+
                                  '<th>Rxn Vars</th>'+
                                  '<th>Cpd Vars</th>'+
                                  '<th>Biomass Function</th>'+
                               '</tr>'+
                             '</thead>');

                for (var i=0; i<d.length; i++) {
                    var obj = d[i];
                    var ws = obj.ws,
                        name = obj.name;

                    if (ws === 'core_VR_FBA_Glucose_aerobic')
                        continue;

                    var row = $('<tr data-ws="'+ws+'" data-name="'+name+'" data-media="'+obj.media+'">');

                    // mark anything selected as checked
                    var cb = '<i class="fa fa-square-o"></i>';
                    for (var j=0; j<MV.models.length; j++) {
                        var item = MV.models[j];

                        if (item.fba.ws === ws && item.fba.name === name) {
                            cb = '<i class="fa fa-check-square-o"></i>';
                            break;
                        }
                    }

                    var fbaLink = "fbaPage({ws: '"+ws+"', name: '"+name+"'})",
                        mediaLink = "mediaPage({ws: 'coremodels_media', name: '"+obj.media+"'})";

                    row.append('<td>'+cb+'</td>'+
                               '<td><a ui-sref="'+mediaLink+'">'+obj.media+'</a></td>'+
                               '<td><a ui-sref="'+fbaLink+'">'+name+'</a></td>'+
                               '<td>'+(obj.objective === '10000000' ? 0 : obj.objective)+'</td>'+
                               '<td>'+obj.rxnCount+'</td>'+
                               '<td>'+obj.cpdCount+'</td>'+
                               '<td>'+obj.biomass+'</td>');

                    table.append(row);
                }

                table.find('tbody tr').unbind('hover');
                table.find('tbody tr').hover(function(e) {
                    var checkBox = $(this).find('i');
                    checkBox.css('opacity', 1.0);
                }, function(e) {
                    var checkBox = $(this).find('i');
                    if (!checkBox.hasClass('fa-check-square-o'))
                        checkBox.css('opacity', 0.5);
                })


                table.find('tbody tr').unbind('click');
                table.find('tbody tr').click(function(e) {
                    e.preventDefault();
                    var checkBox = $(this).find('i');

                    var ws = $(this).data('ws'),
                        name = $(this).data('name')
                        media = $(this).data('media');

                    checkBox.toggleClass('fa-square-o fa-check-square-o');

                    var data = {model: {
                                    ws: rowData[7],
                                    name: rowData[1]
                                },
                                fba: {
                                    ws: ws,
                                    name: name
                                },
                                org: rowData[10].Name,
                                media: media};

                    if (checkBox.hasClass('fa-check-square-o')) {
                        checkBox.css('opacity', 1.0);
                        MV.add(data);
                    } else {
                        checkBox.css('opacity', 0.5);
                        MV.rm(data, true);
                    }

                    scope.$apply();
                })

                $compile(container)(scope);
                return container;
            }

            function events() {
                // Add event listener for opening and closing details
                $(elem).find('tbody td').unbind('click')
                $(elem).find('tbody td').click('click', function(e) {
                    var tr = $(this).closest('tr'),
                        row = table.row( tr ),
                        caret = $(this).closest('tr').find('i');

                    var name = row.data()[1],
                        ws = row.data()[7];

                    if ( row.child.isShown() ) {
                        // This row is already open - close it
                        row.child.hide();
                        tr.removeClass('shown');
                        caret.toggleClass('fa-caret-down fa-caret-right')
                    } else {
                        // open row
                        caret.hide()
                        caret.parent().loading('');

                        MV.getRelatedFBAs([{workspace: ws, name: name}])
                            .then(function(data) {
                                caret.parent().rmLoading()
                                caret.show().toggleClass('fa-caret-right fa-caret-down')

                                row.child( format( data, row.data() ) ).show();
                            })

                        tr.addClass('shown');
                    }
                });

                //$(elem).find('tbody tr').tooltip({title: 'click row to show FBAs',
                //                                  placement: 'bottom',
                //                                  delay: {show: 500}});

                // custom hover styling due to row expanding
                $(elem).find('tbody tr').unbind('hover')
                $(elem).find('tbody tr').hover(function() {
                    $(this).find('.fa-caret-right').css('opacity', "1.0")
                    $(this).css('background-color', '#f8f8f8')
                }, function() {
                    $(this).css('background-color', '#fff')
                    $(this).find('.fa-caret-right').css('opacity', "0.5")
                })

                $compile(tableElem)(scope);
            }


            // annoying goodness to keep datatables in sync
            function updateSelectedInView() {
                $(elem).find('.fba-table tbody tr').each(function() {
                    var cb = $(this).find('i');
                    var ws = $(this).data('ws'),
                        name = $(this).data('name');

                    var found = false;
                    for (var i=0; i<MV.models.length; i++) {
                        var item = MV.models[i];

                        if (item.fba.name === name && item.fba.ws === ws) {
                            found = true;
                            break
                        }
                    }

                    if (found) {
                        cb.removeClass('fa-square-o');
                        cb.addClass('fa-check-square-o');
                        cb.css('opacity', 1.0);
                    } else {
                        cb.removeClass('fa-check-square-o');
                        cb.addClass('fa-square-o');
                        cb.css('opacity', 0.5);
                    }
                })
            }

            scope.$on('MV.event.change', function() {
                updateSelectedInView()
            })


        }
    }
}])

.directive('mediaTable', ['$compile', '$http', function($compile, $http) {
    return {
        link: function(scope, elem, attr) {
            var table;

            scope.tableOptions = {columns: [
                                      { title: 'Name', data: function(d) {
                                        var path = "mediaPage({ws: '"+d[7]+"', name: '"+d[1]+"'})";
                                        return '<a ui-sref="'+path+'" >'+d[1]+'</a>';
                                      }}
                                  ],
                                  language: {search: "_INPUT_",
                                             searchPlaceholder: 'Search media'}
                                 }

            elem.loading('', true);
            var prom = $http.rpc('ws', 'list_objects', {workspaces: ['coremodels_media'], includeMetadata: 1})
            prom.then(function(data) {
                elem.rmLoading();

                scope.tableOptions.data = data;
                scope.tableOptions.drawCallback = events;

                var t = $('<table class="table table-hover">');
                $(elem).append(t);
                table = t.dataTable(scope.tableOptions);
                $compile(table)(scope);
            })

            function events() {
                $compile(table)(scope);
            }
        }
    }
}])
.directive('fbaTable',
['$compile', '$stateParams',
function($compile, $stateParams) {
    return {
        link: function(scope, element, attr) {
            var table;

            scope.tableOptions = {columns: [
                                      { title: 'Name', data: function(d) {
                                        var path = "fbaPage({ws: '"+d[7]+"', name: '"+d[1]+"'})";
                                        return '<a ui-sref="'+path+'" >'+d[1]+'</a>';
                                       }},
                                   ]}


            element.loading('', true);
            var prom = kb.ws.list_objects({workspaces: [$stateParams.ws]})
            $.when(prom).done(function(data) {
                element.rmLoading();

                scope.tableOptions.data = data;
                scope.tableOptions.drawCallback = scope.events;

                var t = $('<table class="table table-hover">');
                $(element).append(t);
                table = t.dataTable(scope.tableOptions);
                $compile(table)(scope);
            })

            scope.events = function() {
                // compile template again for datatables
                $compile(table)(scope);
                scope.$apply();
            }


        }
    }
}])
.directive('genomesTable', ['$compile', function($compile) {
    return {
        link: function(scope, element, attr) {

            scope.tableOptions = {columns: [
                                      { title: 'Name', data: function(d) {
                                        var path = "genome({ws: '"+d[7]+"', name: '"+d[1]+"', tab: 'functional'})";
                                        return '<a ui-sref="'+path+'" >'+d[1]+'</a>';
                                       }},
                                   ]}

            element.loading('', true);
            var p1 = kb.ws.list_objects({workspaces: ['coremodels'], type: 'KBaseGenomes.Genome' });
            //var p2 = kb.ws.list_objects({workspaces: ['coremodels'], type: 'KBaseGenomes.ContigSet' });

            $.when(p1).done(function(d) {
                //var data = d1.concat(d2);
                element.rmLoading();

                scope.tableOptions.data = d;

                var t = $('<table class="table table-hover">');
                $(element).append(t);
                var table = t.dataTable(scope.tableOptions);
                $compile(table)(scope);
            })
        }
    }
}])

.directive('contig', ['stateParams', function($stateParams) {
    return {
        link: function(scope, ele, attr) {
            ele.loading()
            //var ref = $stateParams.ws+'/'+$stateParams.name
            var ref = "chenrydemo/kb|g.422"

            var p = kb.ws.get_objects([{ref: ref}])
            $.when(p).done(function(d) {
                ele.rmLoading();

                var data = d[0].data;

                var chart_data = process(data);
                draw(chart_data)
            })

            function process(data) {
                var numbers = []

                var features = data.features

                var max_e = 0;
                for (var i in features) {
                    var f = features[i];

                    var l = f.location;

                    var start = l[0][1], end, direction;
                    if (l[0][2] === '-') {
                        direction = 'left';
                        end = l[0][1];
                        start = end - l[0][3]
                    } else {
                        direction = 'right';
                        start = l[0][1];
                        end = start + l[0][3]
                    }

                    numbers.push({s: start, e: end, direction: direction})

                    if (end > max_e) max_e = end;
                }
                return {numbers: numbers, max: max_e};
            }

            function randomData() {
                var count = 100;
                var max_length = 10;

                var numbers = [];
                for (var i=0; i<count; i++) {
                    var num = Math.floor((Math.random()*(max_end-max_length))+1);
                    var num2 = Math.floor((Math.random()*max_length)+1);
                    numbers.push( [num,num+num2] );
                }

                return numbers;
            }

            function draw(data) {
                padding_bottom = 50;

                var max_end = data.max,
                    numbers = data.numbers;

                var h = 10; /* height of boxes */


                $(ele).append('<div id="cdd-chart">');

                //Create the Scale we will use for the Axis
                var x = d3.scale.linear()
                                .domain([0, max_end])
                                .range([20, width-20]);


                //Create the Axis
                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")


                var zoom = d3.behavior.zoom()
                    .x(x)
                    .scaleExtent([1, 700])
                    .on("zoom", zoomed_poly);


                var svg = d3.select("#cdd-chart").append("svg")
                                                 .attr("width", width)
                                                 .attr("height", height)
                                                .attr("transform", "translate(" + 0 + "," + 0 + ")")
                                                .call(zoom);

                svg.append("rect")
                    .attr("class", "overlay")
                    .attr("width", width)
                    .attr("height", height);

                //Create an SVG group Element for the Axis elements and call the xAxis function
                var xAxisGroup = svg.append("g")
                                .attr("class", "x axis")
                                .attr("transform", "translate(0," + (height - padding_bottom) + ")")
                                    .call(xAxis);


                function zoomed() {
                    svg.select(".x.axis").call(xAxis);
                    //svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                    svg.selectAll('.cdd-box').attr("x", function(d) {
                        var start = d3.select(this).data()[0].start
                        var end = d3.select(this).data()[0].end
                        return x(start);
                    })
                    .attr('width', function(){
                        var start = d3.select(this).data()[0].start
                        var end = d3.select(this).data()[0].end
                        return ( x(end)-x(start) );
                    });
                }

                function zoomed_poly() {
                    svg.select(".x.axis").call(xAxis);
                    svg.selectAll('.cdd-box')
                       .attr("points", function(d) {
                            var start = d3.select(this).data()[0].start;
                            var end = d3.select(this).data()[0].end;
                            var h = d3.select(this).data()[0].height;

                            d = d3.select(this).data()[0].direction;
                            if (d === 'left') {
                                return polyLeft(start, end, h);
                            } else {
                                return polyRight(start, end, h);
                            }
                    })

                }

                var ystart = 20

                // create row heights
                var row_count = 25;
                var row_h = {}
                for (var i=1; i <= row_count; i++) {
                    row_h[i] = height - padding_bottom - ystart-(2*(i-1)*h)
                }

                var rows = {};
                for (var i=1; i <= row_count; i++) {
                    rows[i] = [];
                }

                for (var i in numbers) {
                    var start = numbers[i].s;
                    var end = numbers[i].e;
                    var direction = numbers[i].direction;

                    // go through existing rows to see if there is a good row
                    var found_row = 0 // starting with non existant key
                    for (var key in rows) {
                        var row = rows[key]

                        var good_row = true;
                        for (var j in row) {
                            var s = row[j][0]
                            var e = row[j][1]

                            // if outside existing box, continue
                            if (start > e || end < s) {
                                continue
                            } else {
                                good_row = false
                                break;
                            }
                        }

                        if (!good_row) {
                            continue
                        } else {
                            found_row = key
                            row.push([start, end])
                            break
                        }
                    }

                    if (found_row) {
                        if (direction === 'left') {
                            drawArrowLeft(start, end, row_h[found_row])
                        } else {
                            drawArrowRight(start, end, row_h[found_row])
                        }
                    } else {
                        console.error('did not find a place for ', start, end)
                    }
                }

                function drawBox(start, end, height) {
                    var rect = svg.append('rect')
                                  .data([{start: start, end: end}])
                                  .attr('class', 'cdd-box')
                                  .attr('x', x(0))
                                  .attr('y', 0)
                                  .attr('width', x(0)-x(0))
                                  .attr('height', h)
                                  .transition()
                                      .duration(1000)
                                      .ease("elastic")
                                      .attr('x', x(start))
                                       .attr('y', height)
                                      .attr('width', x(end)-x(start))
                                      .each("end", events)

                    var content = '<b>start:</b> '+start+'<br>'+
                                  '<b>end:</b> '+end+'<br>'+
                                  '<b>length:</b> '+(end-start);


                    //$(rect.node()).popover({html: true, content: content, animation: false,
                    //                        container: 'body', trigger: 'hover'});

                }

                function drawArrowRight(start, end, h) {
                    var poly = svg.append('polygon')
                                  .data([{start: start, end: end, height: h, direction: 'right'}])
                                  .attr('class', 'cdd-box')
                                      .attr('points', polyRight(start, end, h) )
                    events(poly);
                }

                function drawArrowLeft(start, end, h) {
                    var poly = svg.append('polygon')
                                  .data([{start: start, end: end, height: h, direction: 'left'}])
                                  .attr('class', 'cdd-box')
                                      .attr('points', polyLeft(start, end, h) )
                    events(poly);
                }

                function cornerRight(s, e) {
                    if ( (e-s) > 10 ) {
                        return e - 5
                    } else {
                        return s + ( 2*(e-s)/3 )
                    }
                }

                function cornerLeft(s, e) {
                    if ( (e-s) > 10 ) {
                        return s + 5
                    } else {
                        return  s + ( (e-s)/3 )
                    }
                }

                function polyRight(start, end, h) {
                    return x(start)+','+h+' '+
                           cornerRight(x(start), x(end))+','+h+' '+
                           x(end) +','+(h+5)+' '+
                           cornerRight(x(start), x(end))+','+(h+10)+' '+
                           x(start)+','+(h+10);
                }

                function polyLeft(start, end, h) {
                    return cornerLeft(x(start), x(end))+','+h+' '+
                            x(end) +','+h+' '+
                            x(end) +','+(h+10)+' '+
                           cornerLeft(x(start), x(end))+','+(h+10)+' '+
                           x(start)+','+(h+5);
                }


                function events(poly) {
                    poly.on('mouseover', function(d){
                        var rect = d3.select(this);
                        var start = rect.data()[0].start
                        var end = rect.data()[0].end
                        var s = x(start);
                        var e = x(end);

                        rect//.transition()
                            //.duration(200)
                            .style("fill", 'steelblue');

                        svg.append('line')
                            .attr('class', 'grid-line')
                            .attr('x1', s)
                            .attr('y1', 0)
                            .attr('x2', s)
                            .attr('y2', height)
                            .attr('stroke-dasharray', "5,5" )

                        svg.append('line')
                            .attr('class', 'grid-line')
                            .attr('x1', e)
                            .attr('y1', 0)
                            .attr('x2', e)
                            .attr('y2', height)
                            .attr('stroke-dasharray', "5,5" )

                        svg.append('text')
                            .attr('class', 'grid-label')
                           .text(start)
                            .attr('x', function() {
                                return s - this.getComputedTextLength() - 2;
                            })
                            .attr('y', height -10)

                        svg.append('text')
                            .attr('class', 'grid-label')
                           .text(end)
                            .attr('x', e+2)
                            .attr('y', height - 10)


                    }).on('mouseout', function(d){
                        d3.selectAll('.cdd-box')
                                //.transition()
                                //.duration(200)
                                .style('fill', 'lightsteelblue')
                        d3.selectAll('.grid-line').remove()
                        d3.selectAll('.grid-label').remove()
                    })
                    /*
                    svg.on('mousemove', function () {
                       coordinates = d3.mouse(this);
                        var x = coordinates[0];
                        var y = coordinates[1];
                    });*/
                }


            }

        }
    };
}])

.directive('heatmap',
    ['ModelViewer', '$q', '$http',
    function(MV, $q, $http) {
    return {
        link: function(scope, elem, attr) {
            var msConfig = new ModelSeedVizConfig();

            var width = 1000,
                height = 250;

            scope.models = MV.models;

            function update() {
                scope.loading = true;
                MV.updateData().then(function(d) {
                    scope.loading = false;

                    var models = d.FBAModel,
                        all_fbas = d.FBA;

                    var d = parseData(models, all_fbas);

                    elem.html('');
                    //element.append('<div>'+d.x.length+' x '+d.y.length+' = '+(d.x.length*d.y.length)+' boxes</div>' )
                    elem.append('<div id="canvas">');
                    heatmap_d3(d.x, d.y, d.data);
                })
            }

            update();

            scope.$on('MV.event.change', function() {
                update()
            })

            function parseData(models, fbas) {
                console.log('fbas',fbas)
                // create heatmap data
                var rxn_names = [],
                    model_names = [],
                    data = [];

                // first, get union of reactions
                for (var i=0; i < models.length; i++) {
                    var model = models[i];
                    model_names.push(model.name);

                    var rxns = model.modelreactions;
                    for (var j=0; j < rxns.length; j++) {
                        var rxn_name = rxns[j].reaction_ref.split('/')[5];
                        if (rxn_names.indexOf(rxn_name) === -1) rxn_names.push(rxn_name);
                    }
                }

                var rows = [];

                // for each model, get data for box, left to right
                for (var i=0; i < models.length; i++) {
                    var rxns = models[i].modelreactions;

                    // see if there is an fba result
                    // if so, get create rxn hash
                    var hasFBA = false,
                        fbaRXNs = {};
                    if (fbas && fbas[i]) {

                        hasFBA = true;
                        var fbaRxns = fbas[i].FBAReactionVariables;

                        for (var j=0; j<fbaRxns.length; j++) {
                            var rxnId = fbaRxns[j].modelreaction_ref.split('/')[5].split('_')[0];
                            fbaRXNs[rxnId] = fbaRxns[j];
                        }
                    }

                    var row = [];
                    // for each rxn in union of rxns, try to find rxn for that model
                    for (var j=0; j < rxn_names.length; j++) {
                        var rxn_name = rxn_names[j];

                        var found = false;
                        var flux;
                        for (var k=0; k<rxns.length; k++) {
                            if (rxns[k].reaction_ref.split('/')[5] === rxn_name) {
                                found = true;
                                if (hasFBA && fbaRXNs[rxn_name])
                                    flux = fbaRXNs[rxn_name].value;
                                break;
                            }
                        }

                        row.push({present: (found ? 1 : 0), flux: flux});
                    }

                    rows.push(row);
                }

                return {x: rxn_names, y: model_names, data: rows};
            }


            function complete_cached() {
                $.get('./node/output.json', function(d) {
                    elem.rmLoading()
                    elem.append('<div>'+d.x.length+' x '+d.y.length+' = '+(d.x.length*d.y.length)+' boxes</div>' )
                    elem.append('<br>')
                    elem.append('<div id="test"><canvas id="heatmap"></canvas></div>');
                    super_map(d.x, d.y, d.data);
                })
            }

            // canvas map, for use with viz service
            function super_map(y_data, x_data, rows) {
                elem.append('<div id="map" class="map" style="height: 400px; width: 100%;"></div>')

                var offset_x = 100,
                    offset_y = 100;

                var w = 10,
                    h = 10;

                var width = 1500,
                    height = 500;

                var canvas = d3.select("#heatmap")
                    .attr("width", width)
                    .attr("height", height)
                    .call( d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom) )
                  .node().getContext("2d");

                draw();

                function zoom() {
                    canvas.save();
                    canvas.clearRect(0, 0, width, height);
                    canvas.translate(d3.event.translate[0], d3.event.translate[1]);
                    canvas.scale(d3.event.scale, d3.event.scale);
                    draw();
                    canvas.restore();
                }


                function layer() {
                    var rects = []

                    for (var i=0; i < rows.length; i++) {
                        var row = rows[i];

                        // for each rxn in union of rxns, try to find rxn for that model
                        for (var j=0; j < row.length; j++) {
                            var val = row[j];

                            canvas.beginPath();
                            canvas.rect(offset_x+(j*w), offset_y+(i*h), w, h);

                            canvas.fillStyle = (val === 1 ? vizConfig.geneColor : 'white');
                            canvas.fill();
                            canvas.lineWidth = 0.1;
                            canvas.strokeStyle = msConfig.stroke;
                            canvas.stroke();
                        }
                    }
                }

                function draw() {
                    /*
                    for (var i=0; i < x_data.length; i++) {
                        canvas.textAlign = 'right';
                        canvas.fillText(x_data[i], offset_x-4, offset_y+(i*h)+h);
                    }


                    for (var i=0; i < y_data.length; i++) {
                         canvas.save();
                         var cx = offset_x+(i*w);
                         var cy = offset_y;
                         canvas.textAlign = 'center';
                         canvas.translate(cx, cy);
                         canvas.rotate( -(Math.PI / 4));
                         canvas.translate(-cx, -cy);
                         canvas.fillText(y_data[i], offset_x+(i*w)+30, offset_y+2);
                         canvas.restore();
                    }*/

                    layer();

                }
            }

            // basic, zoomable svg map
            function heatmap_d3(xData, yData, rows) {
                elem.append('<div id="canvas">');
                var svg = d3.select("#canvas").append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")

                // ability to zoom
                d3.select("#canvas")
                  .call(d3.behavior.zoom().scaleExtent([-3, 8]).on("zoom", zoom))

                function zoom() {
                    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                }

                var w = 7, h = 7, font_size = '8px', start_y = 100;

                // to precompute starting postion of heatmap
                var y_widths = [];
                for (var i=0; i < yData.length; i++) {
                    //var label = svg.append("text").attr("y", start_y+i*h+h)
                    //            .text(yData[i]).attr("font-size", font_size);

                    //y_widths.push(label.node().getBBox().width);
                    y_widths.push(yData[i].length * 4)

                }
                $(elem).find('text').remove(); // fixme

                var start_x = Math.max.apply(Math, y_widths) + 5;

                // for each row, plot each column entity
                for (var i=0; i < yData.length; i++) {

                    var y_label = svg.append("text")
                                     .attr("y", start_y+i*h+h-0.5)
                                     .text(yData[i])
                                     .attr("font-size", font_size)
                                     .attr('text-anchor', 'end')
                                     .on("mouseover", function(){d3.select(this).attr("fill", "black");})
                                     .on("mouseout", function(){d3.select(this).attr("fill", "#333");});
                    var bb = y_label.node().getBBox();
                    y_label.attr('transform', 'translate('+String(start_x-4)+',0)');

                    for (var j=0; j < xData.length; j++) {
                        if (i === 0) {
                            var pos = start_x+j*w+w;

                            var x_label = svg.append("text")
                                             .attr("x", pos)
                                             .attr("y", start_y-3)
                                             .text(xData[j])
                                             .attr("font-size", font_size)
                                             .attr("transform", 'rotate(-45,'+pos+','+start_y+')')
                                             .on("mouseover", function(){
                                                 d3.select(this).attr("fill", "black");
                                                 d3.select(this).attr("font-weight", "700");})
                                             .on("mouseout", function(){
                                                 d3.select(this).attr("fill", "#333");
                                                 d3.select(this).attr("font-weight", "none");});
                        }

                        var prop = rows[i][j];
                        var rect = svg.append("rect")
                                      .attr("x", start_x+j*w)
                                      .attr("y", start_y+i*h)
                                      .attr("width", w)
                                      .attr("height", h)
                                      .attr("stroke", msConfig.stroke)
                                      .attr('stroke-width', '.5px')
                                      .attr('data-row-num', i)
                                      .attr('class', 'model-rxn');
                        if (prop.present && prop.flux) {
                            var color = msConfig.getColor(prop.flux);
                            rect.attr('fill', color);
                        } else {
                            rect.attr("fill", (prop.present === 1 ? msConfig.geneColor : 'white') );
                        }

                        // tool tips
                        var title = xData[j];
                        var content = '<b>Flux:</b> '+prop.flux+'<br>'+
                                      '<b>Org:</b> '+yData[i]+'<br>';
                        $(rect.node()).popover({html: true, content: content,
                                                animation: false, title: title,
                                                container: 'body', trigger: 'hover'});

                        // highlight object in selected data
                        $(rect.node()).hover(function() {
                            var i = $(this).attr('data-row-num')
                            $('#selected-models ul li:eq('+i+')').find('a.fba')
                            .addClass('selected-data-highlight')
                        },
                        function() {
                            var i = $(this).attr('data-row-num')
                            $('#selected-models ul li:eq('+i+')').find('a.fba')
                                .removeClass('selected-data-highlight');
                        })
                        /*
                        $(rect.node()).popover({content: prop.flux,
                                title: yData[i],
                                trigger: 'hover',
                                html: true,
                                placement: 'bottom'});
                        */
                    }
                }
            }

        }
    }
}])

.directive('legend', function() {
    return {
        link: function(scope, elem, attr) {
            var config = new ModelSeedVizConfig();

            angular.element(elem).append('<div id="test">');

            var w = 10,
                h = 10;

            var yOffset = 43,
                xOffset = 10;

            var boxPad = 3;

            var svg = d3.select("#test")
                .append('svg')
                .attr('width', 400)
                .attr('height', 66);

            // add genes present legend
            var g = svg.append('g');
            g.append('rect')
               .attr('width', w)
               .attr('height', h)
               .attr('x', 10)
               .attr('y', yOffset)
               .attr('fill', config.geneColor)
               .attr('stroke', config.stroke)

            g.append('text')
               .attr('x', xOffset+w+5)
               .attr('y', yOffset+h)
               .text('Gene Present')
               .attr('font-size', '10px')


            // add neg flux legend
            var g = svg.append('g'),
                start = 125,
                len = config.negFluxColors.length;

            for (var i=0; i < len; i++) {
                g.append('rect')
                   .attr('width', w)
                   .attr('height', h)
                   .attr('x', start+(i*(w+boxPad)) )
                   .attr('y', yOffset)
                   .attr('fill', config.negFluxColors[i])
                   .attr('stroke', config.stroke)
            }

            var bounds = config.negBounds.reverse();
            for (var i=0; i <len; i++) {
                var bound = bounds[i];

                var pos = start+(i*(w+boxPad))+7
                var label = g.append('text')
                             .attr('x', pos)
                             .attr('y', yOffset-3)
                             .text(bound === 0 ? '\u003C '+bound : '\u2264 '+bound)
                             .attr('font-size', '10px')
                             .attr("transform", 'rotate(-45,'+pos+','+yOffset+')')
            }

            g.append('text')
               .attr('x', start+(len*(w+boxPad)))
               .attr('y', yOffset+h)
               .text('Neg Flux')
               .attr('font-size', '10px')

            // add pos flux legend
            var g = svg.append('g'),
                start = 250,
                len = config.fluxColors.length;

            for (var i=0; i < len; i++) {
                svg.append('rect')
                   .attr('width', w)
                   .attr('height', h)
                   .attr('x', start+(i*(w+boxPad)) )
                   .attr('y', yOffset)
                   .attr('fill', config.fluxColors[i])
                   .attr('stroke', config.stroke)
            }


            var bounds = config.bounds;
            for (var i=0; i <len; i++) {
                var bound = bounds[i];

                var pos = start+(i*(w+boxPad))+7
                var label = g.append('text')
                             .attr('x', pos)
                             .attr('y', yOffset-3)
                             .text(bound === 0 ? '\u003E '+bound : '\u2265 '+bound)
                             .attr('font-size', '10px')
                             .attr("transform", 'rotate(-45,'+pos+','+yOffset+')')
            }

            g.append('text')
               .attr('x', start+(len*(w+boxPad)))
               .attr('y', yOffset+h)
               .text('Pos Flux')
               .attr('font-size', '10px')


        }
    }
})


.directive('ngHover', function() {
    return {
        scope: true,
        link: function(scope, element, attr) {
            scope.show = function() {
                this.hoverOn = true;
            };

            scope.hide = function() {
                this.hoverOn = false;
            };

        }
    }
})

.directive('sidebarCollapse', function() {
    return {
        link: function(scope, element, attr) {
            var original_w = 220;
            var new_w = 56;

            var collapsed = false;

            element.click(function() {

                if ( !collapsed ){
                    element.find('.fa-caret-left').fadeOut(function() {
                        $(this).remove();
                    });
                    var caret = $('<span class="fa fa-caret-right">').hide().fadeIn();
                    element.append(' ', caret);

                    // animation for
                    $('.sidebar-nav, .sidebar').hide('slide', {
                            direction: 'left'
                        }, 350, function() {
                            $('.sidebar').show();
                            $('.sidebar').css('width', new_w)
                        });

                    // animation for margin of page view
                    $('#page-wrapper').animate({
                            marginLeft: new_w,
                        }, 400, function() {
                            $('.sidebar-nav-small').fadeIn('fast');
                            collapsed = true
                        });

                } else {
                    element.find('.fa-caret-right').fadeOut(function() {
                        $(this).remove();
                    });
                    var caret = $('<span class="fa fa-caret-left">').hide().fadeIn()
                    element.prepend(caret, ' ')

                    $('.sidebar-nav-small').fadeOut('fast');

                    $('#page-wrapper').animate({
                            marginLeft: original_w,
                        }, 300, function() {
                            $('.sidebar').css('width', original_w)
                            $('.sidebar-nav').fadeIn('fast')
                            collapsed = false
                        });
                }


            })

        }
    }
})

.directive('fbaDropdown', function() {
    return {
        controller: 'Compare',
        link: function(scope, element, attrs) {
            var ws = attrs.ws;
            var name = attrs.name;
        }
    }
})


.directive('tooltip', function() {
    return {
        link: function(scope, element, attr) {

            element.tooltip({title: attr.tooltip,
                             placement: 'bottom',
                             delay: { "show": 500}
                            })
            element.click(function() {
                element.tooltip('hide');
            })
        }
    }
})
