var filePicker = document.getElementById("mapFiles");

var maps = [];

var blockSize = 32;

document.getElementById("mapFiles").onchange = function(e){
	for(var i = 0;i < filePicker.files.length;i++){
		var reader = new FileReader();
		var mapName = filePicker.files[i].name.split(".")[0].replace(/_/g, " ");
		// Closure to capture the file information.
		$("#loader").fadeIn();
		reader.onload = (function(theFile, mapName) {
			return function(e) {
				var data = e.target.result;
				getBlocks(data, function(blocks){
					$("#loader").fadeOut();
					console.log(blocks);
					$("#mapSelect1").prepend(`<option value="${mapName}">${mapName}</option>`);
					$("#mapSelect2").prepend(`<option value="${mapName}">${mapName}</option>`);
					maps.push({
						name: mapName,
						blocks: blocks
					});
				});
			};
		})(filePicker.files[i], mapName);

		// Read in the image file as a data URL.
		reader.readAsDataURL(filePicker.files[i]);
	}
}

document.getElementById("compare").onclick = function(e){
	$("#blocks").empty();
	var goodBlocks = compare($("#mapSelect1").val(), $("#mapSelect2").val(), true);
	for (var i = 0; i < goodBlocks.length; i++) {
		$("#blocks").append(printBlock(goodBlocks[i]), i);
	}
}

function compare(map_name1, map_name2, noDuplicates){
	var duplicateBlocks = [];
	var map1 = maps.filter(function(item){
		return item.name === map_name1;
	})[0];
	var map2 = maps.filter(function(item){
		return item.name === map_name2;
	})[0];
	console.log(map1, map2);
	for (var i = 0; i < map1.blocks.length; i++) {
		if(typeof map2.blocks[i] !== "undefined"){
			for (var j = 0; j < map1.blocks[i].length; j++) {
				if(typeof map2.blocks[i][j] !== "undefined"){
					if(JSON.stringify(map1.blocks[i][j]) === JSON.stringify(map2.blocks[i][j])){
						if(JSON.stringify(map1.blocks[i][j]) !== "[[0,0,0],[0,0,0],[0,0,0]]" &&
							JSON.stringify(map1.blocks[i][j]) !== "[[1,1,1],[1,1,1],[1,1,1]]"
						){
							duplicateBlocks.push(JSON.stringify(map1.blocks[i][j]));
						}
					}
				} else {
					break;
				}
			}
		} else {
			break;
		}
	}
	var real = noDuplicates ? Array.from(new Set(duplicateBlocks)) : duplicateBlocks;
	return JSON.parse(JSON.stringify(real).replace(/"/g, ""));
}

function printBlock(block, index){
	var canvas = $(`<canvas alt="Block #${index}"></canvas>`)[0];
	canvas.width = block[0].length * blockSize;
	canvas.height = block.length * blockSize;
	var ctx = canvas.getContext("2d");
	var floorImage = new Image(blockSize, blockSize);
	floorImage.src = "/tiles/floor.png";
	floorImage.index = index;
	floorImage.onload = function(){
		for(var i = 0;i < block.length;i++){
			console.log(block[i]);
			for(var j = 0;j < block[i].length;j++){
				var image = new Image(blockSize, blockSize);
				image.src = getTileImage(block[i][j]);
				image.j = j;
				image.i = i;
				image.onload = function(){
					console.log("Drawing Block #" + floorImage.index, this);
					ctx.drawImage(floorImage, this.j * blockSize, this.i * blockSize, blockSize, blockSize);
					ctx.drawImage(this, this.j * blockSize, this.i * blockSize, blockSize, blockSize);
				}
			}
		}
	};
	return canvas;
}

function getBlocks(data, callback){
	var image = new Image();
	image.src = data;
	var canvas = $("<canvas></canvas>")[0];
	var ctx = canvas.getContext("2d");
	image.onload = function() {
		ctx.drawImage(this, 0, 0);
		var blocks = [];
		var pixels = [];
		for(var i = 0;i < image.height;i++){
			var pixelRow = [];
			for(var j = 0;j < image.width;j++){
				var pixelData = ctx.getImageData(j, i, 1, 1).data;
				if(pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0){
					// Black Tile
					pixelRow.push(0);
				} else if(pixelData[0] === 212 && pixelData[1] === 212 && pixelData[2] === 212){
					// Floor Tile
					pixelRow.push(1);
				} else if(pixelData[0] === 220 && pixelData[1] === 186 && pixelData[2] === 186){
					// Red Tile
					pixelRow.push(1.1);
				} else if(pixelData[0] === 187 && pixelData[1] === 184 && pixelData[2] === 221){
					// Blue Tile
					pixelRow.push(1.2);
				} else if(pixelData[0] === 120 && pixelData[1] === 120 && pixelData[2] === 120){
					// Wall
					pixelRow.push(2);
				} else if(pixelData[0] === 64 && pixelData[1] === 128 && pixelData[2] === 80){
					// Wall TL
					pixelRow.push(2.1);
				} else if(pixelData[0] === 64 && pixelData[1] === 80 && pixelData[2] === 128){
					// Wall TR
					pixelRow.push(2.2);
				} else if(pixelData[0] === 128 && pixelData[1] === 112 && pixelData[2] === 64){
					// Wall BL
					pixelRow.push(2.3);
				} else if(pixelData[0] === 128 && pixelData[1] === 64 && pixelData[2] === 112){
					// Wall BR
					pixelRow.push(2.4);
				} else if(pixelData[0] === 255 && pixelData[1] === 128 && pixelData[2] === 0){
					// Bomb
					pixelRow.push(3);
				} else if(pixelData[0] === 255 && pixelData[1] === 255 && pixelData[2] === 0){
					// Boost
					pixelRow.push(4);
				} else if(pixelData[0] === 255 && pixelData[1] === 115 && pixelData[2] === 115){
					// Red Boost
					pixelRow.push(4.1);
				} else if(pixelData[0] === 115 && pixelData[1] === 115 && pixelData[2] === 255){
					// Blue Boost
					pixelRow.push(4.2);
				} else if(pixelData[0] === 55 && pixelData[1] === 55 && pixelData[2] === 55){
					// Spike
					pixelRow.push(5);
				} else if(pixelData[0] === 0 && pixelData[1] === 255 && pixelData[2] === 0){
					// Power-Up
					pixelRow.push(6);
				} else if(pixelData[0] === 0 && pixelData[1] === 117 && pixelData[2] === 0){
					// Gate
					pixelRow.push(7);
				} else if(pixelData[0] === 185 && pixelData[1] === 122 && pixelData[2] === 87){
					// Button
					pixelRow.push(8);
				} else {
					pixelRow.push(null);
				}
			}
			pixels.push(pixelRow);
		}
		for (var i = 0; i < pixels.length; i++) {
			var blockRow = [];
			for (var j = 0; j < pixels[i].length; j++) {
				if(typeof pixels[i+2] !== "undefined"){
					var blockStuff = [
						[pixels[i][j], pixels[i][j+1], pixels[i][j+2]],
						[pixels[i+1][j], pixels[i+1][j+1], pixels[i+1][j+2]],
						[pixels[i+2][j], pixels[i+2][j+1], pixels[i+2][j+2]]   
					];
					blockRow.push(blockStuff);
				}
			}
			blocks.push(blockRow);
		}
		callback(blocks);
	};
}

function getTileImage(tileNum){
	console.log(tileNum);
	if(tileNum === 0){
		// Black Tile
		return "";
	} else if(tileNum === 1){
		// Floor Tile
		return "/tiles/floor.png";
	} else if(tileNum === 1.1){
		// Red Tile
		return "/tiles/redfloor.png";
	} else if(tileNum === 1.2){
		// Blue Tile
		return "/tiles/bluefloor.png";
	} else if(tileNum === 2){
		// Wall
		return "/tiles/wall.png";
	} else if(tileNum === 2.1){
		// Wall TL
		return "/tiles/wallTL.png";
	} else if(tileNum === 2.2){
		// Wall TR
		return "/tiles/wallTR.png";
	} else if(tileNum === 2.3){
		// Wall BL
		return "/tiles/wallBL.png";
	} else if(tileNum === 2.4){
		// Wall BR
		return "/tiles/wallBR.png";
	} else if(tileNum === 3){
		// Bomb
		return "/tiles/bomb.png";
	} else if(tileNum === 4){
		// Boost
		return "/tiles/boost.png";
	} else if(tileNum === 4.1){
		// Red Boost
		return "/tiles/boost.png";
	} else if(tileNum === 4.2){
		// Blue Boost
		return "/tiles/boost.png";
	} else if(tileNum === 5){
		// Spike
		return "/tiles/spike.png";
	} else if(tileNum === 6){
		// Power-Up
		return "/tiles/powerup.png";
	} else if(tileNum === 7){
		// Gate
		return "/tiles/gate.png";
	} else if(tileNum === 8){
		// Button
		return "/tiles/button.png";
	} else if(tileNum === null){
		// Button
		return "/tiles/powerup.png";
	}
}