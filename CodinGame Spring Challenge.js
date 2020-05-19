/**
 * Grab the pellets as fast as you can!
 **/
function torusDistCalc (p1, p2, hSize) {
	let dx = Math.abs(p2.x - p1.x)
	let dy = Math.abs(p2.y - p1.y)

	dx = Math.min(dx, hSize - dx + 1)
	return Math.sqrt(dx * dx + dy * dy)
}
function bestDistCalc (p1, p2) {
	let dx = Math.abs(p2.x - p1.x)
	let dy = Math.abs(p2.y - p1.y)
	return Math.sqrt(dx * dx + dy * dy)
}
function P (x, y) {
	this.x = x
	this.y = y
}

function Pac (pos, id, type, speedRemain = 0, abilityCooldown = 0, dest = {x: 0, y: 0}, didWait = false) {
	this.pos = pos
	this.id = id
	this.type = type
	this.speedRemain = speedRemain
	this.abilityCooldown = abilityCooldown
	this.dest = dest
	this.didWait = didWait
}

function EPac (pos, id, type, speedRemain = 0, abilityCooldown = 0) {
	this.pos = pos
	this.id = id
	this.type = type
	this.speedRemain = speedRemain
	this.abilityCooldown = abilityCooldown
}

function PWDist (x, y, dist) {
	this.x = x
	this.y = y
	this.dist = dist
}

function invertedPoint (x, y, id = 0) {
	let invX = 0
	let halfW = Math.trunc((width) / 2)
	if (x < halfW)
		invX = halfW + halfW - x
	else
		invX = width - 1 - x
	return new P(invX, y)
}

function checkIfBlocked (i) {
	for (let j = 0, len2 = oPacs.length; j < len2; j++) {
		if(oPacs[j].id == pacs[i].id) {
			if (pacs[i].pos.x == oPacs[j].pos.x && pacs[i].pos.y == oPacs[j].pos.y && pacs[i].abilityCooldown != 9) {
				if (!oPacs[j].didWait) {
					isBlocked = true
					sendOrders.push(`MOVE ${pacs[i].id} ${Math.floor(Math.random() * width)} ${Math.floor(Math.random() * height)} ${pacs[i].id} Been Blocked`);
					return true
				}
			}
		}
	}
	return false
}

function potateStillExist (i) {
	// check if this pegu achieved to the potate
   if (pacs[i].pos.x == oPacs[i].dest.x && pacs[i].pos.y == oPacs[i].dest.y)
	   return true
   // check if our pegus achieved to the potate
   for (let j = 0, len2 = pacs.length; j < len2; j++)
	   if (pacs[j].x == oPacs[i].dest.x && pacs[j].y == oPacs[i].dest.y)
		   return true
   // check if enemy pegus achieved to the potate
   for (let j = 0, len2 = ePacs.length; j < len2; j++)
	   if (ePacs[j].x == oPacs[i].dest.x && ePacs[j].y == oPacs[i].dest.y)
		   return true
	return false
}

function getBestDest (i) {
	// get best big potate
	for (let j = 0, len2 = bPotate.length; j < len2; j++) {
		let current = borderPath ? torusDistCalc(pacs[i].pos, {x: bPotate[j].x, y: bPotate[j].y}, width) : bestDistCalc(pacs[i].pos, {x: bPotate[j].x, y: bPotate[j].y})
		let enemyDist = 1000000
		let enemyPos = {x:0, y: 0}
		//get enemy best dist of big potate
		for (let k = 0, len3 = ePacs.length; k < len3; k++) {
			let enemyCurrent = borderPath ? torusDistCalc(ePacs[k].pos, {x: bPotate[j].x, y: bPotate[j].y}, width) : bestDistCalc(ePacs[k].pos, {x: bPotate[j].x, y: bPotate[j].y})
			if (enemyCurrent < enemyDist) {
				enemyDist = enemyCurrent
				enemyPos = {x: ePacs[k].pos.x, y: ePacs[k].pos.y}
			}
		}
		let friendDist = 1000000
		let friendPos = {x:0, y: 0}
		for (let k = 0, len3 = pacs.length; k < len3; k++) {
			if (i == k)
				continue
			let friendCurrent = borderPath ? torusDistCalc(pacs[k].pos, {x: bPotate[j].x, y: bPotate[j].y}, width) : bestDistCalc(pacs[k].pos, {x: bPotate[j].x, y: bPotate[j].y})
			if (friendCurrent < friendDist) {
				friendDist = friendCurrent
				friendPos = {x: pacs[k].pos.x, y: pacs[k].pos.y}
			}
		}
		if (current < bestPath.dist) {
			if (current / 1.5 < enemyDist && current < friendDist + 1.75 ) {
				bestPath = new PWDist(bPotate[j].x, bPotate[j].y, current)
			}
		}
	}
	//get best small potate
	if (bestPath.dist == 10000000) {
		let secondBestPath = new PWDist(-1, -1, 10000000)
		let wallBestPath = new PWDist(-1, -1, 10000000)
		for (let j = 0, len2 = allPotate.length; j < len2; j++) {
			let current = borderPath ? torusDistCalc(pacs[i].pos, {x: allPotate[j].x, y: allPotate[j].y}, width) : bestDistCalc(pacs[i].pos, {x: allPotate[j].x, y: allPotate[j].y})
			let isWall = false
			if (current == 2) {
				if (allPotate[j].x > pacs[i].pos.x) {
					if ((map[pacs[i].pos.y].charAt(pacs[i].pos.x + 1) == `#`)) {
						wallBestPath = new PWDist(allPotate[j].x, allPotate[j].y, current)
						isWall = true
					}
				} else if (allPotate[j].x < pacs[i].pos.x) {
					if ((map[pacs[i].pos.y].charAt(pacs[i].pos.x - 1) == `#`)) {
						wallBestPath = new PWDist(allPotate[j].x, allPotate[j].y, current)
						isWall = true
					}
				} else if (allPotate[j].y > pacs[i].pos.y) {
					if ((map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == `#`)) {
						wallBestPath = new PWDist(allPotate[j].x, allPotate[j].y, current)
						isWall = true
					}
				} else if (allPotate[j].y < pacs[i].pos.y) {
					if ((map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == `#`)) {
						wallBestPath = new PWDist(allPotate[j].x, allPotate[j].y, current)
						isWall = true
					}
				}
			}			
			current = Math.ceil(current)
			if (!isWall) {
				if (current < bestPath.dist) {
					secondBestPath = bestPath
					bestPath = new PWDist(allPotate[j].x, allPotate[j].y, current)
				} else if (current < secondBestPath.dist && current > 1) {
					secondBestPath = new PWDist(allPotate[j].x, allPotate[j].y, current)
				}
			}
		}
		if (pacs[i].speedRemain > 0) {
			if (bestPath.dist == 1 && secondBestPath.dist <= 2)
				return secondBestPath
		}
		if (wallBestPath.dist < bestPath.dist)
			return wallBestPath
	}
	return bestPath
}

function getClosestEnemyDist (i) {
	let types = {'SCISSORS': 'ROCK',
		'ROCK': 'PAPER',
		'PAPER': 'SCISSORS'
	}
	let current
	let closest = {dist: 10000000}
	status = -1
	for (let j = 0, len2 = ePacs.length; j < len2; j++) {
		current = borderPath ? torusDistCalc(pacs[i].pos, ePacs[j].pos, width - 1) : bestDistCalc(pacs[i].pos, ePacs[j].pos)

		if (current < closest.dist)
			closest = {dist: current, id: ePacs[j].id}
		if (current == closest.dist)
			if (ePacs.find(e => e.id == closest.id).typeId == types[pacs[i].type])
				closest = {dist: current, id: ePacs[j].id}
	}
	let myEnemy = ePacs.find(e => e.id == closest.id)
	if (closest.dist <= 2) {
		if (types[pacs[i].type] == myEnemy.type) { // Enemy advantage
			if (closest.dist > 1) {
				if (myEnemy.speedRemain > 0) {
					if (pacs[i].abilityCooldown == 0)
						status = 1
					else
						status = 2
				} else {
					if (pacs[i].abilityCooldown == 0)
						status = 1
					else
						status = 2
				}
			} else {
				if (pacs[i].abilityCooldown == 0)
					status = 1
				else
					status = 2
			}
			
		} else if (pacs[i].type == myEnemy.type) { // Neutral advantage
			if (myEnemy.abilityCooldown == 0)
				status = 4
			else
				status = 0
		} else { //								   Got advantage
			if (pacs[i].speedRemain > 0) {
				if (myEnemy.abilityCooldown == 0)
					status = 4
				else
					status = 3
			} else {
				if (closest.dist == 1 && myEnemy.abilityCooldown > 0)
					status = 3
				else if (closest.dist == 1)
					status = 4
				else
					status = 0
			}
		}
	} else if (closest.dist <= 3) {
		if (types[pacs[i].type] == myEnemy.type) { // Enemy advantage
			if (pacs[i].speedRemain ||  myEnemy.speedRemain) {
				if (pacs[i].abilityCooldown == 0)
					status = 4
				else
					status = 2
			} else {
				status = 0
			}
		} else if (pacs[i].type == myEnemy.type) { // Neutral advantage
			status = 0
		} else { //								   Got advantage
			status = 0

		}
	}

	//get direction to flee
	if (closest.dist <= 3) {
		
		let right = false
		let left = false
		let up = false
		let bottom = false
		let flee = false

		if (status === 0) { //		keep normal

		} else if (status === 1) { // change form
			if (myEnemy) {
				sendOrders = sendOrders.filter(e => !e.includes(`MOVE ${pacs[i].id}`))
				sendOrders = sendOrders.filter(e => !e.includes(`SPEED ${pacs[i].id}`))
				sendOrders.push(`SWITCH ${pacs[i].id} ${types[myEnemy.type]}`)
			}
		} else if (status === 2) { // flee
			flee = true
			if (myEnemy.pos.x > pacs[i].pos.x )
				left = true
			if (myEnemy.pos.x < pacs[i].pos.x )
				right = true
			if (myEnemy.pos.y > pacs[i].pos.y )
				up = true
			if (myEnemy.pos.y < pacs[i].pos.y )
				bottom = true

			if ((right && up) || (right && bottom) || (left && up) || (left && bottom)) {

			} else if (right) {
				if (closest.dist == 3) {
					if (map[pacs[i].pos.y].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1) == `#` || map[pacs[i].pos.y].charAt((pacs[i].pos.x - 2) < 0 ? width - 2 : pacs[i].pos.x - 2) == `#` || map[pacs[i].pos.y].charAt((pacs[i].pos.x - 3) < 0 ? width - 3 : pacs[i].pos.x - 3) == `#`)
						flee = false
				} else if (closest.dist == 2) {
					if (map[pacs[i].pos.y].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1) == `#` || map[pacs[i].pos.y].charAt((pacs[i].pos.x - 2) < 0 ? width - 2 : pacs[i].pos.x - 2) == `#`)
						flee = false
				}
			} else if (left) {
				if (closest.dist == 3) {
					if (map[pacs[i].pos.y].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1) == `#` || map[pacs[i].pos.y].charAt((pacs[i].pos.x + 2) > width - 1 ? 1 : pacs[i].pos.x + 2) == `#` || map[pacs[i].pos.y].charAt((pacs[i].pos.x  + 3) > width - 1 ? 2 : pacs[i].pos.x + 3) == `#`)
						flee = false
				} else if (closest.dist == 2) {
					if (map[pacs[i].pos.y].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1) == `#` || map[pacs[i].pos.y].charAt((pacs[i].pos.x + 2) > width - 1 ? 1 : pacs[i].pos.x + 2) == `#`)
						flee = false
				}
			} else if (bottom) {
				if (closest.dist == 3) {
					if (map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == `#` || map[pacs[i].pos.y - 2].charAt(pacs[i].pos.x) == `#` || map[pacs[i].pos.y - 3].charAt(pacs[i].pos.x ) == `#`)
						flee = false
				} else if (closest.dist == 2) {
					if (map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == `#` || map[pacs[i].pos.y - 2].charAt(pacs[i].pos.x) == `#`)
						flee = false
				}
			} else if (up) {
				if (closest.dist == 3) {
					if (map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == `#` || map[pacs[i].pos.y + 2].charAt(pacs[i].pos.x) == `#` || map[pacs[i].pos.y + 3].charAt(pacs[i].pos.x ) == `#`)
						flee = false
				} else if (closest.dist == 2) {
					if (map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == `#` || map[pacs[i].pos.y + 2].charAt(pacs[i].pos.x) == `#`)
						flee = false
				}
			}

			if (flee) {
				if (myEnemy)
					if ((right || left && !(up || bottom)) && (borderPath ? Math.sqrt(bestDistCalc(pacs[i].pos, myEnemy.pos)) : 0) > 3) {
						right = !right
						left = !left
					}
				toGoBest = []
				toGo = []
				// check si y'a un pellet pour la priorite
				if (right && up) {
					fleeRightUp(i)
				} else if (right && bottom) {
					fleeRightBottom(i)
				} else if (left && up) {
					fleeLeftUp(i)
					
				} else if (left && bottom) {
					fleeLeftBottom(i)
					
				} else if (right) {
					fleeRight(i)
					
				} else if (left) {
					fleeLeft(i)
					
				} else if (bottom) {
					fleeBottom(i)
					
				} else if (up) {
					fleeUp(i)
					
				}
				if (toGoBest.length) {
					sendOrders = sendOrders.filter(e => !e.includes(`MOVE ${pacs[i].id}`))
					sendOrders = sendOrders.filter(e => !e.includes(`SPEED ${pacs[i].id}`))
					sendOrders.push(toGoBest[0])
				}
				else {
					sendOrders = sendOrders.filter(e => !e.includes(`MOVE ${pacs[i].id}`))
					sendOrders = sendOrders.filter(e => !e.includes(`SPEED ${pacs[i].id}`))
					sendOrders.push(toGo[0])
				}
			} else {
				status = 0
			}
		} else if (status === 3) { // chase enemy
			if (myEnemy) {
				sendOrders = sendOrders.filter(e => !e.includes(`MOVE ${pacs[i].id}`))
				sendOrders = sendOrders.filter(e => !e.includes(`SPEED ${pacs[i].id}`))
				sendOrders.push(`MOVE ${pacs[i].id} ${myEnemy.pos.x} ${myEnemy.pos.y} chase`)
			}
		} else if (status === 4) { // wait ?
			sendOrders = sendOrders.filter(e => !e.includes(`MOVE ${pacs[i].id}`))
			sendOrders = sendOrders.filter(e => !e.includes(`SPEED ${pacs[i].id}`))
			sendOrders.push(`MOVE ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y} wait`)
		}
		// Don't use speed spell
	}
	return status
}

function fleeRightUp (i) {
	if (pacs[i].speedRemain) {
		if (map[pacs[i].pos.y - 1].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1) == ` ` && (map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == ` ` || map[pacs[i].pos.y].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1))) {
			if (checkIfStillExist ((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1, pacs[i].pos.y - 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y - 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y - 1} e`)
		}

		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1) == ` ` && map[pacs[i].pos.y].charAt(pacs[i].pos.x + 2) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x + 2) > width - 1 ? 1 : pacs[i].pos.x + 2, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 2) > width - 1 ? 1 : pacs[i].pos.x + 2} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 2) > width - 1 ? 1 : pacs[i].pos.x + 2} ${pacs[i].pos.y} e`)
		}
		if (map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == ` ` && map[pacs[i].pos.y - 2].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y - 2, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 2} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 2} e`)
		}

		if (map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y - 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1} e`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y} e`)
		}
		
		if (!(toGoBest.length || toGo.length)) {
			toGo.push(`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y} Trapped`)
			status = 5
		}
	} else {
		if (map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y - 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1} e`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y} e`)
		}
		if (!(toGoBest.length || toGo.length)) {
			toGo.push(`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y} Trapped`)
			status = 5
		}
	}
}

function fleeRightBottom (i) {
	if (pacs[i].speedRemain) {
		if (map[pacs[i].pos.y + 1].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1) == ` ` && (map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == ` ` || map[pacs[i].pos.y].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1))) {
			if (checkIfStillExist ((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1, pacs[i].pos.y + 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y + 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y + 1} e`)
		}

		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1) == ` ` && map[pacs[i].pos.y].charAt((pacs[i].pos.x + 2) > width - 1 ? 1 : pacs[i].pos.x + 2) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x + 2) > width - 1 ? 1 : pacs[i].pos.x + 2, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 2) > width - 1 ? 1 : pacs[i].pos.x + 2} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 2) > width - 1 ? 1 : pacs[i].pos.x + 2} ${pacs[i].pos.y} e`)
		}
		if (map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == ` ` && map[pacs[i].pos.y + 2].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y + 2, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 2} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 2} e`)
		}

		if (map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y + 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y} e`)
		}
		
		if (!(toGoBest.length || toGo.length)) {
			toGo.push(`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y} Trapped`)
			status = 5
		}
	} else {
		if (map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y + 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y} e`)
		}
		if (!(toGoBest.length || toGo.length)) {
			toGo.push(`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y} Trapped`)
			status = 5
		}
	}
}

function fleeLeftUp (i) {
	if (pacs[i].speedRemain) {
		if (map[pacs[i].pos.y - 1].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1) == ` ` && (map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == ` ` || map[pacs[i].pos.y].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1))) {
			if (checkIfStillExist ((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1, pacs[i].pos.y - 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y - 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y - 1} e`)
		}

		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1) == ` ` && map[pacs[i].pos.y].charAt((pacs[i].pos.x - 2) < 0 ? width - 2 : pacs[i].pos.x - 2) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x - 2) < 0 ? width - 2 : pacs[i].pos.x - 2, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 2) < 0 ? width - 2 : pacs[i].pos.x - 2} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 2) < 0 ? width - 2 : pacs[i].pos.x - 2} ${pacs[i].pos.y} e`)
		}
		if (map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == ` ` && map[pacs[i].pos.y - 2].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y - 2, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 2} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 2} e`)
		}

		if (map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y - 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1} e`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y} e`)
		}
		
		if (!(toGoBest.length || toGo.length)) {
			toGo.push(`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y} Trapped`)
			status = 5
		}
	} else {
		if (map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y - 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1} e`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y} e`)
		}
		if (!(toGoBest.length || toGo.length)) {
			toGo.push(`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y} Trapped`)
			status = 5
		}
	}
}

function fleeLeftBottom (i) {
	if (pacs[i].speedRemain) {
		if (map[pacs[i].pos.y + 1].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1) == ` ` && (map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == ` ` || map[pacs[i].pos.y].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1))) {
			if (checkIfStillExist ((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1, pacs[i].pos.y + 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y + 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y + 1} e`)
		}

		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1) == ` ` && map[pacs[i].pos.y].charAt((pacs[i].pos.x + 2) > width - 1 ? 1 : pacs[i].pos.x + 2) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x + 2) > width - 1 ? 1 : pacs[i].pos.x + 2, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 2) > width - 1 ? 1 : pacs[i].pos.x + 2} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 2) > width - 1 ? 1 : pacs[i].pos.x + 2} ${pacs[i].pos.y} e`)
		}
		if (map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == ` ` && map[pacs[i].pos.y + 2].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y + 2, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 2} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 2} e`)
		}

		if (map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y + 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y} e`)
		}
		
		if (!(toGoBest.length || toGo.length)) {
			toGo.push(`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y} Trapped`)
			status = 5
		}
	} else {
		if (map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y + 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y} e`)
		}
		if (!(toGoBest.length || toGo.length)) {
			toGo.push(`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y} Trapped`)
			status = 5
		}
	}
}

function fleeRight (i) {
	if (pacs[i].speedRemain) {
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1) == ` ` && map[pacs[i].pos.y].charAt((pacs[i].pos.x + 2) > width - 1 ? 1 : pacs[i].pos.x + 2) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x + 2) > width - 1 ? 1 : pacs[i].pos.x + 2, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 2) > width - 1 ? 1 : pacs[i].pos.x + 2} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 2) > width - 1 ? 1 : pacs[i].pos.x + 2} ${pacs[i].pos.y} e`)
		}
		if (map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == ` ` && map[pacs[i].pos.y + 2].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y + 2, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 2} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 2} e`)
		}
		if (map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == ` ` && map[pacs[i].pos.y - 2].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y - 2, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 2} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 2} e`)
		}

		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y} e`)
		}
		if (map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y + 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
		}
		if (map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y - 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1} e`)
		}
		
		if (!(toGoBest.length || toGo.length)) {
			toGo.push(`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y} Trapped`)
			status = 5
		}
	} else {
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y} e`)
		}
		if (map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y + 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
		}
		if (map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y - 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1} e`)
		}
		if (!(toGoBest.length || toGo.length)) {
			toGo.push(`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y} Trapped`)
			status = 5
		}
	}
}

function fleeLeft (i) {
	if (pacs[i].speedRemain) {
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1) == ` ` && map[pacs[i].pos.y].charAt((pacs[i].pos.x - 2) < 0 ? width - 2 : pacs[i].pos.x - 2) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x - 2) < 0 ? width - 2 : pacs[i].pos.x - 2, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 2) < 0 ? width - 2 : pacs[i].pos.x - 2} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 2) < 0 ? width - 2 : pacs[i].pos.x - 2} ${pacs[i].pos.y} e`)
		}
		if (map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == ` ` && map[pacs[i].pos.y + 2].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y + 2, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 2} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 2} e`)
		}
		if (map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == ` ` && map[pacs[i].pos.y - 2].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y - 2, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 2} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 2} e`)
		}

		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y} e`)
		}
		if (map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y + 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
		}
		if (map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y - 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1} e`)
		}
		
		if (!(toGoBest.length || toGo.length)) {
			toGo.push(`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y} Trapped`)
			status = 5
		}
	} else {
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y} e`)
		}
		if (map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y + 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
		}
		if (map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y - 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1} e`)
		}
		if (!(toGoBest.length || toGo.length)) {
			toGo.push(`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y} Trapped`)
			status = 5
		}
	}
}

function fleeBottom (i) {
	if (pacs[i].speedRemain) {
		if (map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == ` ` && map[pacs[i].pos.y + 2].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y + 2, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 2} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 2} e`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1) == ` ` && map[pacs[i].pos.y].charAt((pacs[i].pos.x - 2) < 0 ? width - 2 : pacs[i].pos.x - 2) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x - 2) < 0 ? width - 2 : pacs[i].pos.x - 2, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 2) < 0 ? width - 2 : pacs[i].pos.x - 2} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 2) < 0 ? width - 2 : pacs[i].pos.x - 2} ${pacs[i].pos.y} e`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1) == ` ` && map[pacs[i].pos.y].charAt(pacs[i].pos.x + 2) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x + 2, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x + 2} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x + 2} ${pacs[i].pos.y} e`)
		}

		if (map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y + 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y} e`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y} e`)
		}
		
		if (!(toGoBest.length || toGo.length)) {
			toGo.push(`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y} Trapped`)
			status = 5
		}
	} else {
		if (map[pacs[i].pos.y + 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y + 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y + 1} e`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y} e`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y} e`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y} e`)
		}
		if (!(toGoBest.length || toGo.length)) {
			toGo.push(`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y} Trapped`)
			status = 5
		}
	}
}

function fleeUp (i) {
	if (pacs[i].speedRemain) {
		if (map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == ` ` && map[pacs[i].pos.y - 2].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y - 2, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 2}`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 2}`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1) == ` ` && map[pacs[i].pos.y].charAt((pacs[i].pos.x - 2) < 0 ? width - 2 : pacs[i].pos.x - 2) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x - 2) < 0 ? width - 2 : pacs[i].pos.x - 2, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 2) < 0 ? width - 2 : pacs[i].pos.x - 2} ${pacs[i].pos.y}`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 2) < 0 ? width - 2 : pacs[i].pos.x - 2} ${pacs[i].pos.y}`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1) == ` ` && map[pacs[i].pos.y].charAt(pacs[i].pos.x + 2) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x + 2, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x + 2} ${pacs[i].pos.y}`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x + 2} ${pacs[i].pos.y}`)
		}

		if (map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y - 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1}`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1}`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y}`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y}`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y}`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y}`)
		}
		
		if (!(toGoBest.length || toGo.length)) {
			toGo.push(`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y} Trapped`)
			status = 5
		}
	} else {
		if (map[pacs[i].pos.y - 1].charAt(pacs[i].pos.x) == ` `) {
			if (checkIfStillExist (pacs[i].pos.x, pacs[i].pos.y - 1, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1}`)
			else
				toGo.push (`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y - 1}`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y}`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x - 1) < 0 ? width - 1 : pacs[i].pos.x - 1} ${pacs[i].pos.y}`)
		}
		if (map[pacs[i].pos.y].charAt((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1) == ` `) {
			if (checkIfStillExist ((pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1, pacs[i].pos.y, allPotate))
				toGoBest.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y}`)
			else
				toGo.push (`Move ${pacs[i].id} ${(pacs[i].pos.x + 1) > width - 1 ? 0 : pacs[i].pos.x + 1} ${pacs[i].pos.y}`)
		}
		if (!(toGoBest.length || toGo.length)) {
			toGo.push(`Move ${pacs[i].id} ${pacs[i].pos.x} ${pacs[i].pos.y} Trapped`)
			status = 5
		}
	}
}

function removePointPotate (x, y, arr) {
	//delete potate from array if someone walk on it
	for (let i = 0, len2 = arr.length; i < len2; i++) {
		if (arr[i])
			if(arr[i].x == x && arr[i].y == y) {
				arr.splice(i, 1);
				i--
			}
	}
}

function checkIfStillExist (x, y, arr) {
	//delete potate from array if someone walk on it
	for (let i = 0, len2 = arr.length; i < len2; i++) {
		if (arr[i])
			if(arr[i].x == x && arr[i].y == y) {
				return true
			}
	}
	return false
}

function pushIfDontAlreadyExist (x, y, arr) {
	if (!arr.some(item => item.x == x && item.y == y))
		arr.push(new P(x, y))
}

function raycastPotates (x, y) {
	let currX
	let currY
	let potatesV = 0
	let totalPotatesV = 0

	//check Right
	currX = x + 1
	for (let i = 0; i < width - 1; i++) {
		if (currX > width) {
			currX = 0
		}
		if (map[y].charAt(currX) == `#`)
			break
		else {
			if (checkIfStillExist (currX, y, sPotate)) {
				;
			} else {
				removePointPotate(currX, y, allPotate)
			}
			potatesV++
		}
		currX++
	}
	totalPotatesV += potatesV

	//check Left
	potatesV = 0
	currX = x - 1
	for (let i = 0; i < width - 1; i++) {
		if (currX > width) {
			currX = 0
		}
		if (map[y].charAt(currX) == `#`)
			break
		else {
			if (checkIfStillExist (currX, y, sPotate)) {
				;
			} else {
				removePointPotate(currX, y, allPotate)
			}
			potatesV++
		}
		currX--
	}
	totalPotatesV += potatesV

	//check Up
	potatesV = 0
	currY = y + 1
	for (let i = 0; i < height - 1; i++) {
		if (currY > height) {
			break
		}
		if (map[currY].charAt(x) == `#`)
			break
		else {
			if (checkIfStillExist (x, currY, sPotate)) {
				;
			} else {
				removePointPotate(x, currY, allPotate)
			}
			potatesV++
		}
		currY++
	}
	totalPotatesV += potatesV

	//check Down
	potatesV = 0
	currY = y - 1
	for (let i = 0; i < height - 1; i++) {
		if (currY > height) {
			break
		}
		if (map[currY].charAt(x) == `#`)
			break
		else {
			if (checkIfStillExist (x, currY, sPotate)) {
				;
			} else {
				removePointPotate(x, currY, allPotate)
			}
			potatesV++
		}
		currY--
	}
	totalPotatesV += potatesV
}
















let pacs = []
let ePacs = []
let oPacs = []
let bPotate = []
let sPotate = []
let nsPotate = []
let sendOrders = []
let sendOrder = ``
let len
let len2
let len3
let bestPath
let round = 1
let borderPath = false
let toGoBest = []
let toGo = []
const map = []
let status
let pacsStatus = []

let allPotate = []

//get map
let inputs = readline().split(` `);
const width = parseInt(inputs[0]); // size of the grid
const height = parseInt(inputs[1]); // top left corner is (x=0, y=0)
for (let i = 0; i < height; i++) {
	const row = readline(); // one line of the grid: space " " is floor, pound "#" is wall
	map.push(row)
	for (let j = 0; j < width; j++) {
		if (map[i].charAt(j) == ` `) {
			allPotate.push(new P(j, i))
		}
	}
	if (row.charAt(0) == ` `)
		borderPath = true
}

// game loop
while (true) {
	//clean datas
	pacs = []
	ePacs = []
	bPotate = []
	sPotate = []
	sendOrders = []
	status = -1
	pacStatus = []
	let allowSpeed = true
	let allowMov = true
	let tmpEPacs = []

	//get infos
	let inputs = readline().split(` `);
	const myScore = parseInt(inputs[0]);
	const opponentScore = parseInt(inputs[1]);
	const visiblePacCount = parseInt(readline()); // all your pacs and enemy pacs in sight

	// get all pegus
	for (let i = 0; len = i < visiblePacCount; i++) {
		let inputs = readline().split(` `);
		const pacId = parseInt(inputs[0]); // pac number (unique within a team)
		const mine = inputs[1] !== `0`; // true if this pac is yours
		const x = parseInt(inputs[2]); // position in the grid
		const y = parseInt(inputs[3]); // position in the grid
		const typeId = inputs[4]; // unused in wood leagues
		const speedTurnsLeft = parseInt(inputs[5]); // unused in wood leagues
		const abilityCooldown = parseInt(inputs[6]); // unused in wood leagues
		if (mine && typeId !== 'DEAD') {
			pacs.push(new Pac(new P(x, y), pacId, typeId, speedTurnsLeft, abilityCooldown))
			if (round == 1 || round == 2)
				ePacs.push(new EPac(invertedPoint(x, y, pacId), pacId, typeId, speedTurnsLeft, abilityCooldown))
		}
		if (!mine  && typeId !== 'DEAD') {
			if (round == 1 || round == 2)
				tmpEPacs.push(new EPac(new P(x, y), pacId, typeId, speedTurnsLeft, abilityCooldown))
			else
				ePacs.push(new EPac(new P(x, y), pacId, typeId, speedTurnsLeft, abilityCooldown))
		}
		if (round == 1 && typeId !== 'DEAD')
			oPacs.push(new Pac(new P(-1, -1), pacId, typeId, speedTurnsLeft, abilityCooldown))
		removePointPotate(x, y, allPotate)

	}
	// add visible enemy pacs in round 1-2 in case I or it changed type
	if (round == 1 || round == 2)
		for (let i = 0, len = tmpEPacs.length; i < len; i++) {
			ePacs = ePacs.filter(e => e.id !== tmpEPacs[i].id)
			ePacs.push(new EPac(tmpEPacs[i].pos, tmpEPacs[i].id, tmpEPacs[i].type, tmpEPacs[i].speedRemain, tmpEPacs[i].abilityCooldown))
		}
	const visiblePelletCount = parseInt(readline()); // nombre de boules restante sur la map

		
	// get all potate
	for (let i = 0; len = i < visiblePelletCount; i++) {
		let inputs = readline().split(` `);
		const x = parseInt(inputs[0]);
		const y = parseInt(inputs[1]);
		const value = parseInt(inputs[2]); // amount of Ps this pellet is worth
		
		if (value == 10) {
			bPotate.push(new P(x, y))
		} else {
			sPotate.push(new P(x, y))
			pushIfDontAlreadyExist(x, y, nsPotate)
		}
	}
	if (round == 1) {
		for (let i = 0, len = bPotate.length; i < len; i++) {
			removePointPotate(bPotate[i].x, bPotate[i].y, allPotate)
		}
	}

	// update nsPotate at sight
	for (let i = 0, len = pacs.length; i < len; i++) {
		raycastPotates(pacs[i].pos.x, pacs[i].pos.y)
	}


	// for all pegus
	for (let i = 0, len = pacs.length; i < len; i++) {
		let changeDest = true
		bestPath = new PWDist(-1, -1, 10000000)
		
		// Check if potate got stolen
		if (oPacs[i].pos) {
			if (checkIfStillExist (oPacs[i].dest.x, oPacs[i].dest.y, bPotate))
				changeDest = false
			if (checkIfStillExist (oPacs[i].dest.x, oPacs[i].dest.y, allPotate))
				changeDest = false
		}

		// get best potate to go
		bestPath = getBestDest(i)

		// check if is blocked
		let isBlocked = false
		isBlocked = checkIfBlocked(i)

		// Let the fight begin !
		let whatToDo = getClosestEnemyDist(i)
		pacsStatus[i] = whatToDo
		if (whatToDo === -1) { // normal
			allowSpeed = true
			allowMov = true
		}
        if (whatToDo === 0) { // enemy near but normal, just no spell
			allowSpeed = false
			allowMov = true
		}
        if (whatToDo === 1) { // change form
			allowSpeed = false
			allowMov = false
		}
		if (whatToDo === 2) { // flee
			allowSpeed = false
			allowMov = false
		}
        if (whatToDo === 3) { // chase enemy
			allowSpeed = false
			allowMov = false
		}
        if (whatToDo === 4) { // wait
			allowSpeed = false
			allowMov = false
			pacs[i].didWait = true
		}
		if (whatToDo === 5) { // tryied to flee but can't, so wait
			allowSpeed = false
			allowMov = false
			pacs[i].didWait = true
		}

		if (!isBlocked)
			if (allowMov === true) {
				if (pacs[i].abilityCooldown == 0 && allowSpeed) {
					sendOrders.push(`SPEED ` + pacs[i].id + ` ` + pacs[i].id)
					if (oPacs[i].pos)
						pacs[i].dest = oPacs[i].dest
					allowMov = false
				}
			}

		if (!isBlocked) {
			if (allowMov === true) {
				if (changeDest || (oPacs[i].dest.x == -1 && oPacs[i].dest.y == -1)) {
					pacs[i].dest = new P(bestPath.x, bestPath.y)
				} else {
					pacs[i].dest = oPacs[i].dest
				}
				
				// send MOVE order
				if (allPotate.length > 0 || bPotate.length > 0) {
					sendOrders.push(`MOVE ${pacs[i].id} ${pacs[i].dest.x} ${pacs[i].dest.y} (${pacs[i].dest.x} ${pacs[i].dest.y})N`);
				} else {
					// should never enter that case, but let's do some random
					console.error(`No potate :(`)
					let randomW = Math.floor(Math.random() * width)
					let randomH = Math.floor(Math.random() * height)
	
					sendOrders.push(`MOVE ${pacs[i].id} ${randomW} ${randomH} (${randomW} ${randomH})R`);
					pacs[i].dest = new P(randomW, randomH)
				}
			}
		}
	}

	if (allowMov === true) {
		// check if friend Pegus are too close or going same direction
		for (let i = 0, len = pacs.length; i < len; i++) {
			for (let j = 0, len2 = pacs.length; j < len2; j++) {
				if (pacs[i].id != pacs[j].id) {
					let distancePacs = borderPath ? torusDistCalc(pacs[i].pos, pacs[j].pos, width) : bestDistCalc(pacs[i].pos, pacs[j].pos)
					let distanceDest = borderPath ? torusDistCalc(pacs[i].dest, pacs[j].dest, width) : bestDistCalc(pacs[i].dest, pacs[j].dest)
					
					if (distancePacs <= 2 && distanceDest <= 2) {
						let pac1Dist = borderPath ? torusDistCalc(pacs[i].pos, pacs[j].dest, width) : bestDistCalc(pacs[i].pos, pacs[j].dest)
						let pac2Dist = borderPath ? torusDistCalc(pacs[j].pos, pacs[i].dest, width) : bestDistCalc(pacs[j].pos, pacs[i].dest)
						let rand = Math.floor(Math.random() * (allPotate.length - 1))

						if (pac1Dist <= pac2Dist) {
							if (pacs[j].abilityCooldown != 0) {
								if (pacsStatus[j] === 0 || pacsStatus[j] === -1) {
									//use J not I for god sack!
									sendOrders = sendOrders.filter(e => !e.includes(`MOVE ${pacs[j].id}`))
									sendOrders = sendOrders.filter(e => !e.includes(`SPEED ${pacs[j].id}`))
									sendOrders.push(`MOVE ${pacs[j].id} ${allPotate[rand].x} ${allPotate[rand].y} (${allPotate[rand].x} ${allPotate[rand].y})RB`)
									pacs[j].dest = {x: allPotate[rand].x, y: allPotate[rand].y}
								}
							}
						}
					}
				}
			}
		}
	}

	sendOrder = sendOrders.toString().replace(/,/g, ` | `)
	console.log(sendOrder)
	oPacs = []
	for (let i = 0, len = pacs.length; i < len; i++)
		oPacs.push(new Pac(new P(pacs[i].pos.x, pacs[i].pos.y), pacs[i].id, undefined, undefined, undefined, pacs[i].dest, pacs[i].didWait))
	round++
}
