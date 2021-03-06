function startup(Cesium){
    var filenames = 
        ['49-10-01-6_Building_LOD1.bgltf',
        '49-10-01-7_Building_LOD1.bgltf',
        '49-10-01-8_Building_LOD1.bgltf',
        '49-10-02-1_Building_LOD1.bgltf',
        '49-10-02-3_Building_LOD1.bgltf',
        '49-10-02-5_Building_LOD1.bgltf',
        '49-10-04-1_Building_LOD1.bgltf',
        '49-10-05-1_Building_LOD1.bgltf',
        '49-10-05-2_Building_LOD1.bgltf',
        '49-10-05-3_Building_LOD1.bgltf',
        '49-10-06-1_Building_LOD1.bgltf',
        '49-10-07-1_Building_LOD1.bgltf',
        '49-10-08-2_Building_LOD1.bgltf',
        '49-10-1-10_Building_LOD1.bgltf',
        '49-10-1-11_Building_LOD1.bgltf',
        '49-10-1-12_Building_LOD1.bgltf',
        '49-10-1-13_Building_LOD1.bgltf',
        '49-10-10-2_Building_LOD1.bgltf',
        '49-10-10-3_Building_LOD1.bgltf',
        '49-10-11-5_Building_LOD1.bgltf',
        '49-10-12-10_Building_LOD1.bgltf',
        '49-10-12-11_Building_LOD1.bgltf',
        '49-10-12-2_Building_LOD1.bgltf',
        '49-10-12-3_Building_LOD1.bgltf',
        '49-10-12-5_Building_LOD1.bgltf',
        '49-10-12-6_Building_LOD1.bgltf',
        '49-10-12-7_Building_LOD1.bgltf',
        '49-10-12-8_Building_LOD1.bgltf',
        '49-10-12-9_Building_LOD1.bgltf',
        '49-10-14-2_Building_LOD1.bgltf',
        '49-10-14-5_Building_LOD1.bgltf',
        '49-10-14-6_Building_LOD1.bgltf',
        '49-10-14-7_Building_LOD1.bgltf',
        '49-10-16-2_Building_LOD1.bgltf',
        '49-10-17-1_Building_LOD1.bgltf',
        '49-10-18-3_Building_LOD1.bgltf',
        '49-10-18-4_Building_LOD1.bgltf',
        '49-10-19-3_Building_LOD1.bgltf',
        '49-10-21-1_Building_LOD1.bgltf',
        '49-10-21-4_Building_LOD1.bgltf',
        '49-10-21-5_Building_LOD1.bgltf',
        '49-10-22-1_Building_LOD1.bgltf',
        '49-418-1-859_Building_LOD1.bgltf',
        '49-418-1-945_Building_LOD1.bgltf']
    
    var viewer = new Cesium.Viewer('cesiumContainer', 
        { 
            timeline : false,
            navigationHelpButton : false,
            homeButton : false,
            animation : false,
            geocoder : false,
            selectionIndicator : false,
        });
    var scene = viewer.scene;
    var camera = new Cesium.Camera(scene);
    
    // null to indicate that no building is selected/active
    var prevPick = null;

    camera.position = new Cesium.Cartesian3();
    camera.direction = Cesium.Cartesian3.negate(Cesium.Cartesian3.UNIT_Z, new Cesium.Cartesian3());
    camera.up = Cesium.Cartesian3.clone(Cesium.Cartesian3.UNIT_Y);
    camera.frustum.fov = Cesium.Math.PI_OVER_THREE;
    camera.frustum.near = 1.0;
    camera.frustum.far = 2.0;
    
    var COLORS = [new Cesium.Cartesian4(1.0, 0.0, 0.0, 1.0), // RED
                  new Cesium.Cartesian4(1.0, 1.0, 0.0, 1.0), // YELLOW
                  new Cesium.Cartesian4(0.0, 1.0, 0.0, 1.0)] // GREEN

    var GREY = new Cesium.Cartesian4(1.0, 1.0, 1.0, 1.2);
    var HIGHLIGHT = new Cesium.Cartesian4(0.0, 1.0, 1.0, 1.0);

    var buildings = [];

    // (106,-26,5,0)
    var offset_lon = -0.001946;
    var offset_lat = 0.000190;
    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
        Cesium.Cartesian3.fromDegrees(24.827060 + offset_lon, 60.185793 + offset_lat, -6.0)
    );

    var model;
    var counter = 0;
    for (var i = 0; i < filenames.length; i++)  {
            model = scene.primitives.add(Cesium.Model.fromGltf({
            url : 'AHYEMODEL/' + filenames[i],
            modelMatrix : modelMatrix
        }));
        model.id = i;
        model.name = i;
        buildings.push(model);

        Cesium.when(model.readyPromise).then(function(model) {
          console.log(model.getMaterial('colour'));
          counter++;
          if (counter == filenames.length) {
            var primitives = scene.primitives._primitives;
            for (var i = 0; i < primitives.length ; i++) {
                //var modelMaterial = primitives[i].mesh.materials[0];
                var model = primitives[i];
                var material = model.getMaterial("ColorEffectR225G87B143-material");  
                material.setValue('diffuse', GREY);
            }
          }
        }).otherwise(function(error){
          console.log(error);
        });
    };

    // Fly to the location with the 45 caramer desgrees
    function flyToLocation(){
        viewer.camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(24.826077, 60.182098-0.012, 1500.0),
            orientation : {
	            heading : Cesium.Math.toRadians(0.0),
	            pitch : Cesium.Math.toRadians(-45.0),
	            roll : 0.0
        	}
        });
    };

    flyToLocation();
 
    // Initialize the click handler for each building
    var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction(
        function (e) {
            var pick = scene.pick(e.position);
            if (Cesium.defined(pick) && Cesium.defined(pick.node) && Cesium.defined(pick.mesh)) {
                if (prevPick !== null) {
                    // Empty prevPick
                    // Give basic colour to building 
                    var primitive = prevPick.primitive;
                    //console.log(primitive);
                    var id = primitive._id;
                    var modelMaterial = prevPick.mesh.materials[0];
                    
                    modelMaterial.setValue('diffuse', GREY);
                    //modelMaterial.setValue('diffuse', new Cesium.Cartesian4(0.0, 0.0, 0.0, 1.0));
                    //console.log(flag);
                    prevPick = null;
                }


                var primitive = pick.primitive;
                //console.log(primitive);
                var id = primitive._id;
                var modelMaterial = pick.mesh.materials[0];
                
                modelMaterial.setValue('diffuse', HIGHLIGHT);
                console.log(primitive);

                prevPick = pick;
                
                // Popup Window

                // popup = new Cesium.InfoBox('cesiumContainer');
                // infoboxmodel = popup.viewModel;
                // infoboxmodel.titleText = "TESTING";
                // infoboxmodel.showInfo = true;
                // infoboxmodel.description = "Building number: " + primitive.id; // Add data from JSON
                // console.log(popup.viewModel);

                //Fetch real-time temperatures for each clickable building
                getTemperature(id);
                // realTimeChart();
                realTimeComp();

            }
        },
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );

	// Initialize the jquery datetimepicker
    $('#datetimepicker1').datetimepicker({
    	format: 'unixtime',
    	startDate:'+2015/05/01'
    });
    $('#datetimepicker2').datetimepicker({
    	format: 'unixtime'
    });

    // Click to get the scatter plot
    $('#submit').click(function () {
        scatterPlot();
    });

    // Remove buttons
    $('#closeScatter').click(function (){
        $('#scatter').remove();
    });

    $('#closeRealtime').click(function (){
        $('#realtime').remove();
    });

    // Get data from Leanheat APIs     
    function getTemperature(buildingID){
    	var data = dataToJson(buildingID);
		return $.ajax({
        	url: 'http://54.170.172.31:3000/api/temperatures',
        	type: 'get',
        	data: data,
        	success: function (data) {
        		console.log(data);
        	},
        	error: function(data){
        		console.log(data);
        	}
        });
    };

    // Wrap the request parameters
    function dataToJson(buildingID){
    	return {
    		'aggregation-level': $('#timestamp').val(),
    		'apartments': buildingID,
    		'from': $('#datetimepicker1').val(),
    		'to': $('#datetimepicker2').val()
    	};
    };

    // D3 visulisation -- Real-time Temperatures 
   	function realTimeComp(){

        $('#realtime').remove();
        $('#visualization').append('<div id="realtime"></div>');

   		var context= cubism.context()
		var primary = temperature(),
    	    secondary = primary.shift(- 24 * 60 * 60 * 1000);

		function temperature() {
		  var 	value = 0,
	   			values = [],
	   			i = 0,
	   			last;

	   		return context.metric(function (start, stop, step, callback) {
	   			start = +start, stop = +stop;
			    if (isNaN(last)) last = start;
			    while (last < stop) {
			      last += step;
			      value = Math.max(2, Math.min(15, value + .8 * Math.random() - .4 + .2 * Math.cos(i += .2)));
			      values.push(value);
			    }
			    callback(null, values = values.slice((start - stop) / step * 10));
	   		});
		};


		d3.select("#realtime").call(function(div) {
		    div.append("div")
		      .attr("class", "axis")
		      .call(context.axis().orient("top"));

		    div.selectAll(".horizon")
		      .data([primary])
		      .enter().append("div")
		      .attr("class", "horizon")
		      .call(context.horizon()
		        .height(120)
		        .format(d3.format(".2f"))
		        .title("Temperature"));

		    div.selectAll(".comparison")
		      .data([[primary, secondary]])
		      .enter().append("div")
		      .attr("class", "comparison")
		      .call(context.comparison()
		        .height(120)
		        .formatChange(d3.format(".1f%"))
		        .title("Daily Change"));

		    div.append("div")
		      .attr("class", "rule")
		      .call(context.rule());
		});

		context.on("focus", function(i) {
		    format = d3.format(".1f");
		    d3.selectAll(".horizon .value").style("right", i== null ? null : context.size() - i + "px")
		      .text(format(primary.valueAt(Math.floor(i))) + "\u00B0C");
		});
   	};

    // D3 Visualization -- Scatter Plot
    function scatterPlot() {
        $('#scatter').remove();
        $('#visualization').append('<div id="scatter"><svg></svg></div>');

        nv.addGraph(function() {
          var chart = nv.models.scatterChart()
                        .showDistX(true)  
                        .showDistY(true)
                        .color(d3.scale.category10().range());

          //Configure how the tooltip looks.
          // chart.tooltipContent(function(key) {
          //     return '<h3>' + key + '</h3>';
          // });

          //Axis settings
          chart.xAxis.tickFormat(d3.format('.02f'));
          chart.yAxis.tickFormat(d3.format('.02f'));

          //We want to show shapes other than circles.
          // chart.scatter.onlyCircles(true);

          var myData = randomData(40,1);
          d3.select('#scatter svg')
              .datum(myData)
              .call(chart);

          nv.utils.windowResize(chart.update);

          return chart;
        });

        function getRandom(min, max) {
            return Math.random() * (max - min) + min;
        };
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        function randomData(groups, points) { //# groups,# points per group
          var data = [],
              shapes = ['circle', 'cross', 'triangle-up', 'triangle-down', 'diamond', 'square'],
              random = d3.random.normal();

          for (i = 0; i < groups; i++) {
            data.push({
              key: 'Building ' + i,
              values: []
            });

            for (j = 0; j < points; j++) {
              data[i].values.push({
                x: getRandomInt(1, 50)
              , y: getRandom(15, 25)
              , size: Math.random()   //Configure the size of each scatter point
              , shape: (Math.random() > 0.95) ? shapes[j % 6] : "circle"  //Configure the shape of each scatter point.
              });
            }
          }
          return data;
        }
    };
};

if (typeof Cesium !== "undefined") {
    startup(Cesium);
}else if(typeof require === "function") {
	require(["Cesium"], startup);
}
