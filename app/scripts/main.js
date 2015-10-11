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
    
    var viewer = new Cesium.Viewer('cesiumContainer');
    var scene = viewer.scene;
    var camera = new Cesium.Camera(scene);
    camera.position = new Cesium.Cartesian3();
    camera.direction = Cesium.Cartesian3.negate(Cesium.Cartesian3.UNIT_Z, new Cesium.Cartesian3());
    camera.up = Cesium.Cartesian3.clone(Cesium.Cartesian3.UNIT_Y);
    camera.frustum.fov = Cesium.Math.PI_OVER_THREE;
    camera.frustum.near = 1.0;
    camera.frustum.far = 2.0;
    
    var COLORS = [new Cesium.Cartesian4(1.0, 0.0, 0.0, 1.0), // RED
                  new Cesium.Cartesian4(1.0, 1.0, 0.0, 1.0), // YELLOW
                  new Cesium.Cartesian4(0.0, 1.0, 0.0, 1.0)] // GREEN

    var buildings = [];

    // (106,-26,5,0)
    var offset_lon = -0.001946;
    var offset_lat = 0.000190;
    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
        Cesium.Cartesian3.fromDegrees(24.827060 + offset_lon, 60.185793 + offset_lat, -6.0)
    );

    var model;
    for (var i = 0; i < filenames.length; i++)  {
            model = scene.primitives.add(Cesium.Model.fromGltf({
            url : 'AHYEMODEL/' + filenames[i],
            modelMatrix : modelMatrix
        }));
        model.id = i;
        buildings.push(model);
    }

        // function flyToRectangle() {

    //     var west = 24.803748;
    //     var south = 60.178774 -0.035;
    //     var east = 24.843746;
    //     var north = 60.194235 -0.035;
    //     var rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);


    //     viewer.camera.flyTo({
    //         destination : rectangle,
    //         orientation : {
    //         heading : Cesium.Math.toRadians(0.0),
    //         pitch : Cesium.Math.toRadians(-45.0),
    //         roll : 0.0
    //     }
    //     });


    //     // Show the rectangle.  Not required; just for show.
    //     viewer.entities.add({
    //         rectangle : {
    //             coordinates : rectangle,
    //             fill : false,
    //             outline : false,
    //             outlineColor : Cesium.Color.WHITE
    //         }
    //     });
    // }
    // flyToRectangle();

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
 
    
    var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction(
        function (e) {
            var pick = scene.pick(e.position);
            if (Cesium.defined(pick) && Cesium.defined(pick.node) && Cesium.defined(pick.mesh)) {
                var primitive = pick.primitive;
                var id = primitive._id;
                var modelMaterial = pick.mesh.materials[0];
                modelMaterial.setValue('diffuse', new Cesium.Cartesian4(1.0, 0.0, 0.0, 1.0));
                console.log(primitive);
                
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

    // D3 visulisation -- Timeline 

   	function realTimeChart(){
   		function random(name) {
	   		var value = 0,
	   			values = [],
	   			i = 0,
	   			last;

	   		return context.metric(function (start, stop, step, callback) {
	   			start = +start, stop = +stop;
			    if (isNaN(last)) last = start;
			    while (last < stop) {
			      last += step;
			      value = Math.max(10, Math.min(20, value + .8 * Math.random() - .4 + .2 * Math.cos(i += .2)));
			      values.push(value);
			    }
			    callback(null, values = values.slice((start - stop) / step));
	   		}, name);
	   	};

	   	var context = cubism.context()
		    .serverDelay(0)
		    .clientDelay(0)
		    .step(1e3)
		    .size(960);

		var Room01 = random('Room01'),
		    Room02 = random('Room02');
		    Room03 = random('Room03');
		    Room04 = random('Room04');
		    Room05 = random('Room05');


		return d3.select("#realtime").call(function(div) {
				  		
	  		div.append('div')
	  		   .attr('class', 'axis')
	  		   .call(context.axis().orient('top'));

	  		div.selectAll('.horizon')
		       .data([Room01, Room02, Room03, Room04, Room05])
		       .enter().append('div')
		       .attr('class', 'horizon')
		       .call(context.horizon().extent([-20, 20]));

		    div.append('div')
		       .attr('class', 'rule')
		       .call(context.rule());
	    });

	    // On mousemove, reposition the chart values to match the rule.
		context.on("focus", function(i) {
		  d3.selectAll(".value").style("right", i == null ? null : context.size() - i + "px");
		});	
   	};


   	function realTimeComp(){
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
			      value = Math.max(15, Math.min(20, value + .8 * Math.random() - .4 + .2 * Math.cos(i += .2)));
			      values.push(value);
			    }
			    callback(null, values = values.slice((start - stop) / step * 10));
	   		});
		};


		d3.select("#realtimeOne").call(function(div) {
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



};

if (typeof Cesium !== "undefined") {
    startup(Cesium);
} else if (typeof require === "function") {
	require(["Cesium"], startup);
}
