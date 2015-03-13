


(function() {
"use strict";

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
                          options: {showETC: true}};

            angular.element(elem).kbaseTabTable(params);
        }
    }
 })

.directive('pathTest', function() {
    return {
        link: function(scope, elem, attrs) {

            angular.element(elem).kbasePathway({model_ws: 'janakakbase:CoreModels-VR-GP',
                                                model_name: 'core_1000565.3_GP',
                                                map_name: 'map00010',
                                                map_ws: 'nconrad:paths'})
        }
    }
 })
.directive('modelList',
    ['$compile', '$stateParams', 'ModelViewer', '$http', '$timeout',
    function($compile, $stateParams, MV, $http, $timeout) {
    return {
        link: function(scope, elem, attr) {
            var table;
            var tableElem;

            scope.tableOptions = {columns: [
                                      { sortable: false, title: "", data: function(d){
                                            return '<i class="fa fa-caret-right"></i>';
                                      }},
                                      { title: "Organism", data: function(d){
                                            return d[10].Name;
                                      }},
                                      { title: "ID", data: function(d) {
                                            var name = d[1],
                                                ws = d[7],
                                                path = "modelPage({ws: '"+ws+"', name: '"+name+"'})",
                                                link = '<a ui-sref="'+path+'" >'+name+'</a>';
                                                //add_btn = ' <button type="button" data-ws="'+ws+'" data-name="'+name+
                                                //        '" class="btn btn-default btn-xs btn-add-model hide">Add'+
                                                //  '</button>';
                                            return link;
                                      }},
                                      { title: "Reactions", data: function(d){
                                            return d[10]['Number reactions']
                                      }},
                                      { title: "Compounds", data: function(d){
                                            return d[10]['Number compounds'];
                                      }}],
                                  order: [[ 1, "desc" ]],
                                  language: {search: "_INPUT_",
                                             searchPlaceholder: 'Search models'}
                                 }

            elem.loading('', true);
            var workspaces = ['janakakbase:CM-ATP-eq'];
            var p = $http.rpc('ws', 'list_objects', {workspaces: workspaces, includeMetadata: 1});

            p.then(function(data) {
                elem.rmLoading();

                scope.tableOptions.data = data;
                scope.tableOptions.drawCallback = events;

                tableElem = $('<table class="table">');
                $(elem).append(tableElem);
                table = tableElem.DataTable(scope.tableOptions);
                $compile(tableElem)(scope);
             })

            function format(d, rowData) {
                // `d` is the original data object for the row
                var container = $('<div class="fba-table">');

                container.append('<h5>FBA Results</h5>')
                var table = $('<table class="table-hover">');
                container.append(table);

                // header
                table.append('<thead>'+
                                '<tr>'+
                                  '<th>Compare?</th>'+
                                  '<th>ID</th>'+
                                  '<th>Media</th>'+
                                  '<th>Objective</th>'+
                                  '<th>Rxn Variables</th>'+
                                  '<th>Cpd Variables</th>'+
                                  '<th>Maximized?</th>'+
                               '</tr>'+
                             '</thead>');


                for (var i=0; i<d.length; i++) {
                    var ws = d[i][7],
                        name = d[i][1];
                    console.log('ws/name!!!!!!!!', ws, name)

                    var row = $('<tr data-ws="'+ws+'" data-name="'+name+'">');
                    var meta = d[i][10];

                    // mark anything selected as checked
                    var cb = '<i class="fa fa-square-o"></i>';
                    for (var j=0; j<MV.models.length; j++) {
                        var item = MV.models[j];

                        if (item.fba.ws === ws && item.fba.name === name) {
                            cb = '<i class="fa fa-check-square-o"></i>';
                            break
                        }
                    }

                    row.append('<td>'+cb+'</td>'+
                               '<td>'+d[i][1]+'</td>'+
                               '<td>'+meta['Media']+'</td>'+
                               '<td>'+meta['Objective']+'</td>'+
                               '<td>'+meta['Number reaction variables']+'</td>'+
                               '<td>'+meta['Number compound variables']+'</td>'+
                               '<td>'+(meta['Maximized'] === "1" ? 'true':'false')+'</td>')

                    table.append(row);
                }

                table.find('tr').unbind('hover');
                table.find('tr').hover(function(e) {
                    var checkBox = $(this).find('i');
                    checkBox.css('opacity', 1.0);
                }, function(e) {
                    var checkBox = $(this).find('i');
                    if (!checkBox.hasClass('fa-check-square-o'))
                        checkBox.css('opacity', 0.5);
                })

                table.find('tr').unbind('click');
                table.find('tr').click(function(e) {
                    e.preventDefault()
                    var checkBox = $(this).find('i');

                    var ws = $(this).data('ws'),
                        name = $(this).data('name');

                    checkBox.toggleClass('fa-square-o fa-check-square-o');

                    var data = {model: {
                                    ws: rowData[7],
                                    name: rowData[1]
                                },
                                fba: {
                                    ws: ws,
                                    name: name
                                }};

                    if (checkBox.hasClass('fa-check-square-o')){
                        checkBox.css('opacity', 1.0)
                        MV.add(data)
                    } else {
                        checkBox.css('opacity', 0.5)
                        MV.rm(data)
                    }

                    scope.$apply();
                })

                return container;
            }

            /*
            Combination deletions   0
            Maximized   1
            Number compound bounds  0
            Number additional compounds 0
            Model   6370/14/1
            Media   290/11/7
            Minimize reactions  0
            Number biomass objectives   1
            Number reaction variables   120
            Number gene KO  0
            Number reaction bounds  0
            Number constraints  0
            Number compound variables   17
            Objective   10000000
            Number reaction KO  0
            */

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
                    }
                    else {
                        // open row
                        console.log(row.child())

                        caret.hide()
                        caret.parent().loading('');
                        $http.rpc('ws', 'list_referencing_objects', [{workspace: ws, name: name}])
                            .then(function(data) {
                                caret.parent().rmLoading()
                                caret.show().toggleClass('fa-caret-right fa-caret-down')

                                row.child( format( data[0], row.data() ) ).show();
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
                    $(this).css('background-color', '#f8f8f8')
                }, function() {
                    $(this).css('background-color', '#fff')
                })

                $compile(tableElem)(scope);
            }


            // annoying goodness to keep datatables in sync
            function updateSelectedInView() {
                $(elem).find('.fba-table tr').each(function() {
                    var cb = $(this).find('i');
                    var ws = $(this).data('ws'),
                        name = $(this).data('name');

                    console.log('ws/name', ws, name)

                    var found = false;
                    for (var i=0; i<MV.models.length; i++) {
                        var item = MV.models[i];
                        console.log(item, item)

                        if (item.fba.name === name && item.fba.ws === ws) {
                            found = true;
                            break
                        }
                    }

                    if (found) {
                        cb.removeClass('fa-square-o');
                        cb.addClass('fa-check-square-o');
                    } else {
                        cb.removeClass('fa-check-square-o');
                        cb.addClass('fa-square-o');
                    }
                })
            }

            scope.$on('MV.event.change', function() {
                updateSelectedInView()
            })


        }
    }
}])


.directive('modelTable',
    ['$compile', '$stateParams', 'ModelViewer', '$http',
    function($compile, $stateParams, MV, $http) {
    return {
        link: function(scope, elem, attr) {

            scope.tableOptions = {"columns": [
                                      { title: "Name", data: function(d) {
                                            var name = d[1],
                                                ws = d[7],
                                                path = "modelPage({ws: '"+ws+"', name: '"+name+"'})",
                                                link = '<a ui-sref="'+path+'" >'+name+'</a>',
                                                add_btn = ' <button type="button" data-ws="'+ws+'" data-name="'+name+
                                                        '" class="btn btn-default btn-xs btn-add-model hide">Add'+
                                                    '</button>';
                                            return link+add_btn;
                                      }},/*
                                      { title: "Organism", data: function(d){
                                            return 'Some Organism';
                                      }},
                                      { title: "Rxn", data: function(d){
                                            return '<span random-number></span>'
                                      }},
                                      { title: "Cpd", data: function(d){
                                            return '<span random-number></span>';
                                      }},*/
                                  ]}

            var table;

            elem.loading('', true);
            /*
            if ($stateParams.ws === 'janakakbase:CoreModels_ATP-eq') {
                var p = $http.rpc('ws', 'list_objects', {workspaces: [$stateParams.ws],
                                                         includeMetadata: 1});
            } else if ($stateParams.ws === 'janakakbase:CoreModels-VR-GP') {
                var p = $http.rpc('ws', 'list_objects', {workspaces: [$stateParams.ws],
                                                          type: 'KBaseFBA.FBAModel',
                                                          includeMetadata: 1});
            }*/

            var workspaces = ['janakakbase:CoreModels_ATP-eq', 'janakakbase:CoreModels-VR-GP'];

            var p = $http.rpc('ws', 'list_objects', {workspaces: workspaces, includeMetadata: 1});

            p.then(function(data) {
                elem.rmLoading();

                scope.tableOptions.data = data;
                scope.tableOptions.drawCallback = events;

                var t = $('<table class="table table-hover">');
                $(elem).append(t);
                table = t.dataTable(scope.tableOptions);
                $compile(table)(scope);
             })

            function events() {
                $(elem).find('tbody tr').unbind('hover');
                $(elem).find('tbody tr').hover(function() {
                    $(this).find('.btn-add-model').removeClass('hide');
                }, function() {
                    $(this).find('.btn-add-model').addClass('hide');
                });

                $(elem).find('.btn-add-model').unbind('click');
                $(elem).find('.btn-add-model').click(function() {
                    var ws = $(this).data('ws'),
                        name = $(this).data('name');
                    ModelViewer.add(ws, name);
                })

                $compile(table)(scope);
                //scope.$apply();
            }
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
                                  ]}

            elem.loading('', true);
            var prom = $http.rpc('ws', 'list_objects', {workspaces: ['coremodels_media']})
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
.directive('pathways',
['$stateParams', 'ModelViewer', '$q', '$http',
function($stateParams, MV, $q, $http) {
    return {
        link: function(scope, element, attr) {


            var pathContainer;

            scope.$watch(scope.selectedFBAs, function() {
                if (pathContainer)
                    pathContainer.remove();
                updateCompare(MV.models, scope.selectedFBAs);
            })

            scope.$on('updateCompare', function() {
                updateCompare(MV.models, scope.selectedFBAs);
            })

            function updateCompare(models, fbas) {
                pathContainer = $('<div class="path-container">')
                $(element).html(pathContainer);

                $(element).loading();
                var fbaProm;
                if (fbas) {
                    var refs = []
                    for (var i=0; i<models.length; i++) {
                        if (String(i) in fbas) refs.push( {ref: fbas[String(i)].ref})
                    }

                    fbaProm = $http.rpc('ws','get_objects', refs);
                }

                var prom = MV.updateModelData()
                $q.all([prom, fbaProm])
                    .then(function(d) {
                        $(element).rmLoading();

                        var models = d[0];
                        var all_fbas = d[1];

                        // null for fbas that haven't been selected
                        for (var i=0; i<models.length; i++) {
                            if (fbas && !(String(i) in fbas) ) {
                                all_fbas.splice(i, 0, null)
                            }
                        }

                        pathContainer.kbasePathways({modelData: models,
                                                     fbaData: all_fbas})

                    })
            }

            //if (scope.models.length > 0) updateCompare();

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

.directive('compare',
    ['ModelViewer', '$q', '$http',
    function(MV, $q, $http) {
    return {
        link: function(scope, element, attr) {
            var gene_color = '#87CEEB',
                negFluxColors = ['#910000', '#e52222', '#ff4444', '#fc8888', '#fcabab'],
                fluxColors = ['#0d8200', '#1cd104','#93e572','#99db9d', '#c7e8cd'],
                bounds = [1000, 500, 200, 25, 0, -25, -200, -500, -1000];


            var width = 1000,
                height = 250;

            scope.models = MV.models;

            function updateCompare(models, fbas) {
                $(element).loading();
                var fbaProm;
                if (fbas) {
                    var refs = []
                    for (var i=0; i<models.length; i++) {
                        if (String(i) in fbas) refs.push( {ref: fbas[String(i)].ref})
                    }
                    fbaProm = $http.rpc('ws','get_objects', refs);
                }

                var prom = MV.updateModelData()
                $q.all([prom, fbaProm])
                    .then(function(d) {
                        $(element).rmLoading();

                        var models = d[0];

                        var all_fbas = d[1];

                        // null for fbas that haven't been selected
                        for (var i=0; i<models.length; i++) {
                            if (fbas && !(String(i) in fbas) ) {
                                all_fbas.splice(i, 0, null)
                            }
                        }

                        var d = parseData(models, all_fbas);

                        element.html('');
                        //element.append('<div>'+d.x.length+' x '+d.y.length+' = '+(d.x.length*d.y.length)+' boxes</div>' )
                        element.append('<br>')
                        element.append('<div id="canvas">');
                        heatmap_d3(d.x, d.y, d.data);
                    })
            }


            scope.$watch(scope.selectedFBAs, function() {
                updateCompare(scope.models, scope.selectedFBAs);
            })

            scope.$on('updateCompare', function() {
                updateCompare(MV.models, scope.selectedFBAs);
            })


            function parseData(models, fbas) {

                // create heatmap data
                var rxn_names = [];
                var model_names = [];
                var data = [];

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
                        fbaRxns = fbas[i].data.FBAReactionVariables;

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
                    element.rmLoading()
                    element.append('<div>'+d.x.length+' x '+d.y.length+' = '+(d.x.length*d.y.length)+' boxes</div>' )
                    element.append('<br>')
                    element.append('<div id="test"><canvas id="canvas_ele"></canvas></div>');
                    super_map(d.x, d.y, d.data);
                })
            }


            function super_map(y_data, x_data, rows) {
                element.append('<div id="map" class="map" style="height: 400px; width: 100%;"></div>')

                var offset_x = 100;
                var offset_y = 100;

                var w = 10;
                var h = 10;

                var width = 1500,
                    height = 500;


                var canvas = d3.select("#canvas_ele")
                    .attr("width", width)
                    .attr("height", height)
                    .call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom))
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

                            canvas.fillStyle = (val === 1 ? gene_color : 'white');
                            canvas.fill();
                            canvas.lineWidth = 0.1;
                            canvas.strokeStyle = '#888';
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


            function heatmap_d3(x_data, y_data, rows) {
                element.append('<div id="canvas">');
                var svg = d3.select("#canvas").append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                        .call(d3.behavior.zoom().scaleExtent([-3, 8]).on("zoom", zoom))
                    .append("g");

                var w = 7, h = 7, font_size = '8px', start_y = 100;

                // to precompute starting postion of heatmap
                var y_widths = [];
                for (var i=0; i < y_data.length; i++) {
                    //var label = svg.append("text").attr("y", start_y+i*h+h)
                    //            .text(y_data[i]).attr("font-size", font_size);

                    //y_widths.push(label.node().getBBox().width);
                    y_widths.push(y_data[i].length * 4)

                }
                $('text').remove(); //fixme

                var start_x = Math.max.apply(Math, y_widths) + 5;

                function zoom() {
                    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                }

                for (var i=0; i < y_data.length; i++) {

                    var y_label = svg.append("text").attr("y", start_y+i*h+h-0.5)
                                     .text(y_data[i]).attr("font-size", font_size)
                                     .attr('text-anchor', 'end')
                                     .on("mouseover", function(){d3.select(this).attr("fill", "black");})
                                     .on("mouseout", function(){d3.select(this).attr("fill", "#333");});
                    var bb = y_label.node().getBBox();
                    y_label.attr('transform', 'translate('+String(start_x-4)+',0)');

                    for (var j=0; j < x_data.length; j++) {
                        if (i === 0) {
                            var pos = start_x+j*w+w;

                            var x_label = svg.append("text")
                                             .attr("x", pos)
                                             .attr("y", start_y-3)
                                             .text(x_data[j])
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
                                      .attr("stroke", '#888')
                                      .attr('stroke-width', '.5px')
                                      .attr('class', 'model-rxn');
                        if (prop.present && prop.flux) {
                            var color = getColor(prop.flux);
                            rect.attr('fill', color);
                        } else {
                            rect.attr("fill", (prop.present === 1 ? gene_color : 'white') );
                        }


                        $(rect.node()).popover({content: prop.flux,
                                title: y_data[i],
                                trigger: 'hover',
                                html: true,
                                placement: 'bottom'});
                    }
                }
            }

            function getColor(v) {
                if (v >= bounds[0])
                    return fluxColors[0];
                else if (v >= bounds[1])
                    return fluxColors[1];
                else if (v >= bounds[2])
                    return fluxColors[2];
                else if (v >= bounds[3])
                    return fluxColors[3];
                else if (v > bounds[4])
                    return fluxColors[4];
                else if (v === bounds[4])
                    return gene_color;
                else if (v <= bounds[5])
                    return negFluxColors[0];
                else if (v <= bounds[6])
                    return negFluxColors[1];
                else if (v <= bounds[7])
                    return negFluxColors[2];
                else if (v <= bounds[8])
                    return negFluxColors[3];
                else if (v < 0)
                    return negFluxColors[4];

                return undefined;
            }
        }
    }
}])

.directive('legend', function() {
    return {
        link: function(scope, elem, attr) {
            /*
            angular.element(elem).append('<div id="canvas">');

            var svg = d3.select("#legend")
                .append("svg")
                .attr("width", 150)
                .attr("height", 300);

            svg.append("rect")
               .attr("class", "overlay")
               .attr("width", width)
               .attr("height", height);*/
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


function rxnDict(model) {
    var rxns = {};
    for (var i in model.modelreactions) {
        rxns[model.modelreactions[i].reaction_ref.split('/')[5]] = model.modelreactions[i];
    }

    return rxns;
}

$.fn.loading = function(text, big) {
    $(this).rmLoading()

    if (big) {
        if (typeof text !== 'undefined') {
            $(this).append('<p class="text-center text-muted loader"><br>'+
                 '<img src="../img/ajax-loader-big.gif"> '+text+'</p>');
        } else {
            $(this).append('<p class="text-center text-muted loader"><br>'+
                 '<img src="../img/ajax-loader-big.gif"> loading...</p>')
        }
    } else {
        if (typeof text !== 'undefined') {
            $(this).append('<p class="text-muted loader">'+
                 '<img src="../img/ajax-loader.gif"> '+text+'</p>');
        } else {
            $(this).append('<p class="text-muted loader">'+
                 '<img src="../img/ajax-loader.gif"> loading...</p>')
        }

    }
    return this;
}
$.fn.rmLoading = function() {
    $(this).find('.loader').remove();
}


}());