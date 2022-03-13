'use strict';

const svgNS = 'http://www.w3.org/2000/svg';
const numNodes = 26;
const delay = 150;
const width = 800;
const height = 450;
const radius = 14;

let locations = [];
let edges = [];

let connections = [];

let parents = [];
let ranks = [];
let edgesDrawn = 0;

function square(x) {
	return x * x;
}

function generateNetwork() {
	for (let i = 0; i < numNodes; ++i) {
		do {
			let location = [ Math.floor(2 * radius + Math.random() * (width - 4 * radius)), Math.floor(radius * 2 + Math.random() * (height - radius * 4)) ];
			let newEdges = [];
			for (let j = 0; j < i; ++j) {
				const d = Math.sqrt(square(location[0] - locations[j][0]) + square(location[1] - locations[j][1]));
				if (d < 3 * radius) {
					break;
				} else {
					newEdges.push([i, j, d]);					
				}
			}
			if (newEdges.length == i) {
				locations.push(location);
				edges = edges.concat(newEdges);
				parents.push(i);
				ranks.push(0);
				break;
			}
		} while (true);
	}
	edges.sort((a, b) => a[2] - b[2]);
}

function drawNodes() {
	const network = document.getElementById('network');
	for (let i = 0; i < numNodes; ++i) {
		let circle = document.createElementNS(svgNS, 'circle');
		circle.setAttribute('cx', locations[i][0]);
		circle.setAttribute('cy', locations[i][1]);
		circle.setAttribute('r', radius);
		network.appendChild(circle);

		let text = document.createElementNS(svgNS, 'text');
		text.textContent = String.fromCharCode(65 + i);
		text.setAttribute('x', locations[i][0]);
		text.setAttribute('y', locations[i][1]);
		network.appendChild(text);
	}
}

function drawEdge() {
	if (edgesDrawn == connections.length)
		return;
	const a = connections[edgesDrawn][0];
	const b = connections[edgesDrawn][1];
	const background = document.getElementById('background');
	let line = document.createElementNS(svgNS, 'line');
	line.setAttribute('x1', locations[a][0]);
	line.setAttribute('y1', locations[a][1]);
	line.setAttribute('x2', locations[b][0]);
	line.setAttribute('y2', locations[b][1]);
	background.appendChild(line);
	++edgesDrawn;

	setTimeout(drawEdge, delay);
}

// Kruskal's algorithm
function kruskal(requiredIsolatedNodes) {
	let index = 0;
	let numIsolatedNodes = numNodes;
	while (numIsolatedNodes > requiredIsolatedNodes) {
		const edge = edges[index];
		++index;

		const a = edge[0];
		const b = edge[1];
		const aRoot = find(a);
		const bRoot = find(b);
		if (aRoot == bRoot)
			continue;

		if (a == aRoot && ranks[a] == 0)
			--numIsolatedNodes;
		if (b == bRoot && ranks[b] == 0)
			--numIsolatedNodes;

		connections.push(edge);
		union(a, b);
	}

	setTimeout(drawEdge, 0);
}

window.onload = () => {
	generateNetwork();
	drawNodes();

	// We stop early, when there are disjoint sets small and large.
	kruskal(2);
};
