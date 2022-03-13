'use strict';

let USE_RANK = true;
let USE_COMPRESSION = false;

const pages = [
	"/1_title.html",
	"/2_motivation.html",
	"/3_simple_code.html",
	"/4_deep_tree.html",
	"/5_contrasting_trees.html",
	"/6_shallow_tree.html",
	"/7_path_compression.html",
	"/8_path_compression.html",
	"/9_compressed_tree.html",
	"/1_title.html"
];

function find(index) {
	let parent = parents[index];
	if (parent == index)
		return parent;
	parents[index] = find(parent);
	return parents[index];
}

function union(a, b) {
	a = find(a);
	b = find(b);
	if (a == b)
		return null;

	if (Math.floor(2 * Math.random()) == 0)
		[a, b] = [b, a];

	if (USE_RANK && ranks[a] < ranks[b])
		[a, b] = [b, a];

	if (!USE_RANK && ranks[b] < ranks[a])
		[a, b] = [b, a];

	parents[b] = a;
	if (ranks[a] <= ranks[b]) {
		ranks[a] = ranks[b] + 1;
	}
	return [a, b];
}

window.onkeydown = (e) => {
	let index = 0;
	let pathname = window.location.pathname;
	for (index = 0; index < pages.length; ++index) {
		if (!pathname.endsWith(pages[index]))
			continue;
		pathname = pathname.substr(0, pathname.length - pages[index].length);
		break;
	}
	if (index == pages.length)
		return;

	switch (e.keyCode) {
		case 32: // space
			window.location.reload();
			return;
		case 37: // left
		case 38: // up
			if (index > 0)
				--index;
			break;
        case 39: // right
        case 40: // down
			if (index < pages.length - 1)
				++index;
			break;
	}
	window.location.pathname = pathname + pages[index];
};
