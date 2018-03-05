	
	let cols = 45;
	let rows = 45;
	let grid = [];
	
	let openSet = [];
	let closedSet = [];
	let start;
	let end;
	let w, h;
	let path = [];
	
	let do_diagonal = true;
	let grid_spawn_rate = 0.3;
	
	let is_drawing = true;
	
	let found_path = false;
	
	document.getElementById("start").addEventListener("click", function() {
		generateBoard();
		is_drawing = false;
		loop();
	});
	
	document.getElementById("restart").addEventListener("click", function() {
		is_drawing = true;
		
		for(let i = 0; i < cols; i++) {
			for(let j = 0; j < rows; j++) {
				grid[i][j].wall = false;
			}
		}
		
		loop();
	});
	
	function buildGrid() {
		// 2d array + create spots
		for(let i = 0; i < cols; i++) {
			grid[ i ] = [];
			
			for(let j = 0; j < rows; j++) {
				grid[ i ][ j ] = new Spot(i, j);
			}
		}
		
		// set neighbors
		for(let i = 0; i < cols; i++) {
			for(let j = 0; j < rows; j++) {
				grid[ i ][ j ].addNeighbors(grid);
			}
		}
		
		//// random start+end:
		//start = grid[ Math.round(random(0, (cols - 1))) ][ Math.round(random(0, (rows - 1))) ];
		//end = grid[ Math.round(random(0, (cols - 1))) ][ Math.round(random(0, (rows - 1))) ];
		
		// corners start+end:
		start = grid[0][0];
		end = grid[(cols - 1)][(rows - 1)];
	}
	
	function generateBoard() {
		// reset global variables
		openSet = [];
		closedSet = [];
		path = [];
		found_path = false;
		
		
		
		// make sure start and end aren't walls
		start.wall = false;
		end.wall = false;
		
		openSet.push(start);
		
		loop();
	}
	
	function removeFromArray(arr, elt) {
		for(let i = (arr.length - 1); i >= 0; i--) {
			if(arr[ i ] == elt) {
				arr.splice(i, 1);
			}
		}
	}
	
	function heuristic(a, b) {
		// euclidean distance
		let d = dist(a.i, a.j, b.i, b.j);
		
		// manhattan distance
		//let d = abs( a.i - b.i ) + abs( a.j - b.j );
		
		return d;
	}
	
	function spotAtXY(x, y) {
		let i = Math.floor( (x / w) );
		let j = Math.floor( (y / h) );
		
		if(grid[ i ]) {
			if(grid[ i ][ j ]) {
				return grid[ i ][ j ];
			}
		}
		
		return false;
	}
	
	function Spot(i, j) {
		this.i = i;
		this.j = j;
		this.f = 0;
		this.g = 0;
		this.h = 0;
		this.neighbors = [];
		this.previous = undefined;
		this.wall = false;
		
		//if(random(1) < grid_spawn_rate) {
		//	this.wall = true;
		//}
		
		this.show = function(col) {
			noStroke();
			
			if(is_drawing && !this.wall) {
				stroke(200, 200, 200);
			}
			
			//stroke(col);
			fill(col);
			
			if(this.wall) {
				//stroke(45, 45, 45);
				fill(45, 45, 45);
			}
			
			//rect((this.i * w), (this.j * h), (w - 1), (h - 1));
			rect((this.i * w), (this.j * h), w, h);
		};
		
		this.addNeighbors = function(grid) {
			let i = this.i;
			let j = this.j;
			
			// left
			if(i < (cols - 1)) {
				this.neighbors.push(grid[ i + 1 ][ j     ]);
			}
			
			// right
			if(i > 0) {
				this.neighbors.push(grid[ i - 1 ][ j     ]);
			}
			
			// above
			if(j < (rows - 1)) {
				this.neighbors.push(grid[ i     ][ j + 1 ]);
			}
			
			// below
			if(j > 0) {
				this.neighbors.push(grid[ i     ][ j - 1 ]);
			}
			
			if(do_diagonal) {
				// diag top left
				if((i > 0) && (j > 0)) {
					this.neighbors.push(grid[ i - 1 ][ j - 1 ]);
				}
				
				// diag top right
				if((i < (cols - 1)) && (j > 0)) {
					this.neighbors.push(grid[ i + 1 ][ j - 1 ]);
				}
				
				// diag bottom left
				if((i > 0) && (j < (rows - 1))) {
					this.neighbors.push(grid[ i - 1 ][ j + 1 ]);
				}
				
				// diag bottom right
				if((i < (cols - 1)) && (j < (cols - 1))) {
					this.neighbors.push(grid[ i + 1 ][ j + 1 ]);
				}
			}
		};
	}
		
	function setup() {
		createCanvas(600, 600);
		
		w = (width / cols);
		h = (height / rows);
		
		//generateNewBoard();
		buildGrid();
	}
	
	function draw() {
		var current;
		
		if(!is_drawing) {
			let won_this_round = false;
			
			if(openSet.length > 0) {
				// keep going
				let winner = 0;
				
				for(let i = 0; i < openSet.length; i++) {
					if(openSet[ i ].f < openSet[ winner ].f) {
						winner = i;
					}
				}
				
				current = openSet[ winner ];
				
				if(current === end) {
					noLoop();
					console.log("Found solution!");
					
					//// start new board
					//window.setTimeout(function() {
					//	generateNewBoard();
					//}, 1000);
					
					won_this_round = true;
					found_path = true;
				}
				
				if(!won_this_round) {
					removeFromArray(openSet, current);
					closedSet.push(current);
					
					let neighbors = current.neighbors;
					
					for(let i = 0; i < neighbors.length; i++) {
						let neighbor = neighbors[ i ];
						
						if(!closedSet.includes(neighbor) && !neighbor.wall) {
							let tempG = current.g + 1;
							
							let newPath = false;
							
							if(openSet.includes(neighbor)) {
								if(tempG < neighbor.g) {
									neighbor.g = tempG;
									newPath = true;
								}
							} else {
								neighbor.g = tempG;
								newPath = true;
								openSet.push(neighbor);
							}
							
							if(newPath) {
								neighbor.h = heuristic(neighbor, end);
								neighbor.f = (neighbor.g + neighbor.h);
								neighbor.previous = current;
							}
						}
					}
				}
			} else {
				// no solution
				noLoop();
				console.log("No solution!");
				
				//// start new board
				//window.setTimeout(function() {
				//	generateNewBoard();
				//}, 1000);
				
				return;
			}
		}
		
		background(255);
		
		for(let i = 0; i < cols; i++) {
			for(let j = 0; j < cols; j++) {
				grid[ i ][ j ].show(color(255));
			}
		}
		
		if(!is_drawing) {
			for(let i = 0; i < closedSet.length; i++) {
				closedSet[ i ].show(color(255, 142, 142));
			}
			
			for(let i = 0; i < openSet.length; i++) {
				openSet[ i ].show(color(94, 147, 255));
				//openSet[ i ].show(color(188, 150, 255));
			}
		}
		
		
		let start_color = color(255, 255, 0);
		let end_color = color(0, 163, 106);
		
		if(!is_drawing) {
			// draw the current best path
			path = [];
			let temp = current;
			path.push(temp);
			while(temp.previous) {
				path.push(temp.previous);
				temp = temp.previous;
			}
			
			let dist_startEnd = dist(start.i, start.j, end.i, end.j);
			
			for(let i = 0; i < path.length; i++) {
				let dist_startPathPoint = dist(start.i, start.j, path[ i ].i, path[ i ].j);
				
				//if(found_path) {
					//path[ i ].show(color(0, 0, 255));
					path[ i ].show(lerpColor(start_color, end_color, (dist_startPathPoint / dist_startEnd)));
				//} else {
				//	path[ i ].show(color(107, 187, 244));
				//}
			}
		}
		
		
		// draw start + end
		start.show(start_color);
		end.show(end_color);
	}
	
	function mouseDragged() {
		if(!is_drawing) {
			return;
		}
		
		let grid_item = spotAtXY(mouseX, mouseY);
		
		if(false !== grid_item) {
			if(grid_item === start || grid_item === end) {
				console.log("can't draw on this point");
			} else {
				grid_item.wall = true;
			}
		}
	}
	