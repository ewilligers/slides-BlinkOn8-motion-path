'use strict';

const svgNS = 'http://www.w3.org/2000/svg';
let numNodes = 19;
const delay = 150;
const width = 800;
const height = 450;
const radius = 14;

let locations = [];
let circles = [];
let labels = [];
let arrows = [];
let parents = [];
let ranks = [];

let timeStep = 100;
let maxRank = 5;

function shuffle(values) {
	let remaining = values.length;
	while (remaining > 0) {
		const selected = Math.floor(Math.random() * remaining);
		--remaining;
		[values[selected], values[remaining]] = [values[remaining], values[selected]];
	}
	return values;
}

function square(x) {
	return x * x;
}

function calculateLocation(i) {
	return [ Math.floor(2 * radius + i * (width - 4 * radius) / (numNodes - 1)), Math.floor(3 * radius + (height - 6 * radius)  * (maxRank - ranks[i]) / maxRank)  ];
}

function translation(location) {
	return 'translate(' + location[0] + 'px, ' + location[1] + '.px)';
}

function linkingPath(fromLocation, toLocation, delta) {
	if (delta == 0) {
		const point1 = Math.round(-radius/Math.sqrt(2)) + ' ' + Math.round(-radius/Math.sqrt(2));
		const control1 = Math.round(-2.5 * radius) + ' ' + Math.round(-2.5 * radius);
		const control2 = Math.round(2.5 * radius) + ' ' + Math.round(-2.5 * radius);
		const point2 = Math.round(radius/Math.sqrt(2)) + ' ' + Math.round(-radius/Math.sqrt(2));
		return 'path("M ' + point1 + ' C ' + control1 + ' ' + control2 + ' ' + point2 + '")';
	} else {
		const dx = toLocation[0] - fromLocation[0];
		const dy = toLocation[1] - fromLocation[1];
		const d = Math.sqrt(square(dx) + square(dy));
		const angle = delta * Math.PI / (numNodes);
		const point1 = '0 0';
		const control1 = '0 ' + (-2 * radius);
		const point2 = Math.floor(dx * (d - radius) / d) + ' ' + Math.floor(dy * (d - radius) / d);
		const control2 = point2;
		return 'path("M ' + point1 + ' C ' + control1 + ' ' + control2 + ' ' + point2 + '")';
	}
}

function generateElements() {
	const setTrees = document.getElementById('set_trees');
	const background = document.getElementById('background');

	let names = [];
	for (let i = 0; i < 26; ++i) {
		names.push(String.fromCharCode(65 + i));
	}
	if (numNodes > names.length) {
		for (let i = 0; i < 10; ++i) {
			names.push(String.fromCharCode(48 + i));
		}
	}
	shuffle(names);

	for (let i = 0; i < numNodes; ++i) {
		if (parents.length < numNodes && ranks.length < numNodes) {
			parents.push(i);
			ranks.push(0);
		}

		const location = calculateLocation(i);
		locations.push(location);

		const circle = document.createElementNS(svgNS, 'circle');
		circle.setAttribute('r', radius);
		circle.style.transform = translation(location);
		setTrees.appendChild(circle);
		circles.push(circle);

		const label = document.createElementNS(svgNS, 'text');
		label.textContent = names[i];
		label.style.transform = translation(location);
		setTrees.appendChild(label);
		labels.push(label);

		const arrow = document.createElementNS(svgNS, 'path');
		arrow.setAttribute('marker-end', 'url(#arrow)');
		arrow.style.d = linkingPath(location, calculateLocation(parents[i]), parents[i] - i);
		arrow.style.transform = translation(location);
		background.appendChild(arrow);
		arrows.push(arrow);
	}
}

function generateMerges(begin, end) {
	let merges = [];
	for (let i = 0; i < numNodes - 1; ++i)
		merges.push(i);
	shuffle(merges);
	return merges;
}

function calculateTiming(i) {
	return {
			delay: i * timeStep,
			duration: 2 * timeStep,
			fill: 'forwards',
			easing: 'ease'
		};
}

function animateMerges(merges) {
	for (let i = 0; i < merges.length; ++i) {
		const timing = calculateTiming(i);

		let a = find(merges[i]);
		let b = find(merges[i] + 1);
		if (a !== b) {
			let aRank = ranks[a];
			let bRank = ranks[b];
			let [c, d] = union(a, b);
			if (c == b) {
				[a, b] = [b, a];
				[aRank, bRank] = [bRank, aRank];
			}
			const aLocation = calculateLocation(a);

			if (ranks[a] != aRank) {
				const aTranslation = translation(aLocation);

				const keyframe = { 'transform': aTranslation };
				circles[a].animate(keyframe, timing); 
				labels[a].animate(keyframe, timing); 
				arrows[a].animate(keyframe, timing); 

				for (let j = 0; j < numNodes; ++j) {
					if (j == a || parents[j] != a)
						continue;

					const pathKeyframe = { 'd': linkingPath(calculateLocation(j), calculateLocation(a), a - j) };
					arrows[j].animate(pathKeyframe, timing); 
				}

			} else {
				const pathKeyframe = { 'd': linkingPath(calculateLocation(b), calculateLocation(a), a - b) };
				arrows[b].animate(pathKeyframe, timing); 
			}
		}

		if (USE_COMPRESSION) {
			function compress(i) {
				const parent = parents[i];
				if (parent === a || parent === b || parent == parents[parent])
					return;

				console.log('COMPRESSING');
				parents[i] = parents[parent];
				const pathKeyframe = { 'd': linkingPath(calculateLocation(i), calculateLocation(parents[i]), parents[i] - i) };
				arrows[i].animate(pathKeyframe, timing); 

				compress(parent);
			}

			console.log('POSSIBLY COMPRESSING');
			compress(merges[i]);
			compress(merges[i + 1]);
		}

		if (ranks[a] === maxRank)
			break;
	}
}
