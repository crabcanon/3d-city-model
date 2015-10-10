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
    
    var COLORS = [new Cesium.Cartesian4(1.0, 0.0, 0.0, 1.0), // RED
                  new Cesium.Cartesian4(1.0, 1.0, 0.0, 1.0), // YELLOW
                  new Cesium.Cartesian4(0.0, 1.0, 0.0, 1.0)] // GREEN
    
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

                //Fetch real-time temperatures for each clickable building
                getTemperature(id);
            }
        },
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );

    $('#datetimepicker1').datetimepicker({
    	format: 'unixtime',
    	startDate:'+2015/05/01'
    });
    $('#datetimepicker2').datetimepicker({
    	format: 'unixtime'
    });
     
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

    function dataToJson(buildingID){
    	return {
    		'aggregation-level': $('#timestamp').val(),
    		'apartments': buildingID,
    		'from': $('#datetimepicker1').val(),
    		'to': $('#datetimepicker2').val()
    	};
    };

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
 
    function flyToRectangle() {

        var west = 24.803748;
        var south = 60.174774;
        var east = 24.843746;
        var north = 60.194235;
        var rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);

        viewer.camera.flyTo({
            destination : rectangle
        });

        // Show the rectangle.  Not required; just for show.
        viewer.entities.add({
            rectangle : {
                coordinates : rectangle,
                fill : false,
                outline : false,
                outlineColor : Cesium.Color.WHITE
            }
        });
    }
    flyToRectangle();
};

if (typeof Cesium !== "undefined") {
	startup(Cesium);
} else if (typeof require === "function") {
	require(["Cesium"], startup);
}
