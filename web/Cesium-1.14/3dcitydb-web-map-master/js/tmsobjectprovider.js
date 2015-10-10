/* The tile will be empty if the tile size (north->south) is below minSize or above maxsize
 */
function TMSObjectTileProvider(options, highlightedObjects, hiddenObjects){	
	this._quadtree = undefined;
    this._tilingScheme = new Cesium.GeographicTilingScheme({
            numberOfLevelZeroTilesX : 2,
            numberOfLevelZeroTilesY : 1
        });
    this._errorEvent = new Cesium.Event();
    this._levelZeroMaximumError = Cesium.QuadtreeTileProvider.computeDefaultLevelZeroMaximumGeometricError(this._tilingScheme);
    this._available = options.available ? options.available : {};
    this._id = options.id;
    this._url = options.url;
    this._layerName = options.name;

    this._maxLevel = options.maxLevel;
    this._minLevel = options.minLevel;
    this._region = options.region;
    this._surfaceHeight = options.surfaceHeight;
    
    this._highlightedObjects = highlightedObjects;
    this._hiddenObjects = hiddenObjects;
}

Object.defineProperties(TMSObjectTileProvider.prototype, {
    quadtree: {
        get: function() {
            return this._quadtree;
        },
        set: function(value) {
            this._quadtree = value;
        }
    },

    ready: {
        get: function() {
            return true;
        }
    },

    tilingScheme: {
        get: function() {
            return this._tilingScheme;
        }
    },

    errorEvent: {
        get: function() {
            return this._errorEvent;
        }
    }
});

TMSObjectTileProvider.prototype.beginUpdate = function(context, frameState, commandList) {};

TMSObjectTileProvider.prototype.endUpdate = function(context, frameState, commandList) {};

TMSObjectTileProvider.prototype.getLevelMaximumGeometricError = function(level) {
    return this._levelZeroMaximumError / (1 << level);
};

TMSObjectTileProvider.prototype.loadTile = function(context, frameState, tile) {
	if (tile.state === Cesium.QuadtreeTileLoadState.START) {
		tile.data = {
				primitive: undefined,
				freeResources: function() {
					if (Cesium.defined(this.primitive)) {
						this.primitive.destroy();
						this.primitive = undefined;
					}
				}
		};
    
		tile.state = Cesium.QuadtreeTileLoadState.DONE;   
		tile.renderable = true;
    
		var yTiles = this._tilingScheme.getNumberOfYTilesAtLevel(tile.level);
		var tmsY = tile.y;
		var tmsX = tile.x;
    
		if(tile.level >= this._minLevel && tile.level <= this._maxLevel){
			if(tile.level != 15 || this.isAvailable(tile)){        
		        var url = this._url + "/" + tile.level + "/" + tile.x + "/" + tmsY + ".bgltf";
		        var dx = ( tile._rectangle.east - tile._rectangle.west ) / 2 +  tile._rectangle.west;
		        var dy = ( tile._rectangle.north - tile._rectangle.south ) / 2 + tile._rectangle.south;
		        var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(new Cesium.Cartesian3.fromRadians(dx, dy, 0.0), 3.14159265, 0, 0);
		          
		        tile.data.primitive = Cesium.Model.fromGltf({id:{layerId:this._id}, url:url, modelMatrix:modelMatrix, scale:1, allowPicking:true, show:false});
		        tile.renderable = false;
		        tile.state = Cesium.QuadtreeTileLoadState.LOADING;  
		      }else if(tile.level == 15){
		    	  tile.renderable = true;
		    	  tile.state = Cesium.QuadtreeTileLoadState.DONE;
		      }else{
		    	  tile.renderable = false;
		    	  tile.state = Cesium.QuadtreeTileLoadState.DONE;
		      }
		}  
		if(tile.level > this._maxLevel){
			tile.renderable = false;
			tile.state = Cesium.QuadtreeTileLoadState.DONE;
		}else{
			var earthRadius = 6371000;
			tile.data.boundingSphere3D = Cesium.BoundingSphere.fromRectangle3D(tile.rectangle, undefined, this._surfaceHeight);
			tile.data.boundingSphere2D = Cesium.BoundingSphere.fromRectangle2D(tile.rectangle,  frameState.mapProjection);
		}        
	}
	if (tile.state === Cesium.QuadtreeTileLoadState.LOADING) {
		try{
			tile.data.primitive.update(context, frameState, []);
		}catch(Ex){
			tile.state = Cesium.QuadtreeTileLoadState.DONE;
			tile.renderable = true;
			tile.data.primitive = undefined;
			return;
		}
		var model = tile.data.primitive;
		if (model.ready) {
			// Check which objects should be highlighted
			for(var i in this._highlightedObjects){
				if (model.getMaterial("material_" + i)){
					model.getMaterial("material_" + i).setValue("diffuse", new Cesium.Cartesian4(this._highlightedObjects[i].red, this._highlightedObjects[i].blue, this._highlightedObjects[i].green, this._highlightedObjects[i].alpha));
				}
			}
			for (var j = 0; j < this._hiddenObjects; j++){
				if (model.getNode("BUILDING_" + this._hiddenObjects[j])){
					model.getNode("BUILDING_" + toHide[j]).show = false;
				}
			}
			tile.data.primitive.show = true;
			tile.state = Cesium.QuadtreeTileLoadState.DONE;
			tile.renderable = true;
		}
	} 
};

TMSObjectTileProvider.prototype.computeTileVisibility = function(tile, frameState, occluders) {
    var boundingSphere;
    if (frameState.mode === Cesium.SceneMode.SCENE3D) {
        boundingSphere = tile.data.boundingSphere3D;
    } else {
        boundingSphere = tile.data.boundingSphere2D;
    }
    return frameState.cullingVolume.computeVisibility(boundingSphere);
};

TMSObjectTileProvider.prototype.showTileThisFrame = function(tile, context, frameState, commandList) {
    if(tile.data.primitive){
      tile.data.primitive.update(context, frameState, commandList);
    }
};



TMSObjectTileProvider.prototype.computeDistanceToTile = function(tile, frameState) {
var subtractScratch = new Cesium.Cartesian3();
    var boundingSphere;
    if (frameState.mode === Cesium.SceneMode.SCENE3D) {
        boundingSphere = tile.data.boundingSphere3D;
    } else {
        boundingSphere = tile.data.boundingSphere2D;
    }
    return Math.max(0.0, Cesium.Cartesian3.magnitude(Cesium.Cartesian3.subtract(boundingSphere.center, frameState.camera.positionWC, subtractScratch)) - boundingSphere.radius);
};

TMSObjectTileProvider.prototype.isDestroyed = function() {
    return false;
};

TMSObjectTileProvider.prototype.destroy = function() {
    return Cesium.destroyObject(this);
};
TMSObjectTileProvider.prototype.isAvailable = function(tile){  
  if(this._available[String(tile.level)]){
    if(this._available[String(tile.level)][String(tile.x)]){
      if(this._available[String(tile.level)][String(tile.x)].indexOf(tile.y) > -1){
        return true;
      }
    }
  }
  return false;
}
