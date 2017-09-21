'use strict';

function navigate(e) {
	var currentPage = window.location.href;
	var index = currentPage.lastIndexOf("/");

  function navigateTo(pageNumber) {
    var numPages = 16;
    if (pageNumber < 1) {
      pageNumber = 1;
    } else if (pageNumber > numPages) {
      pageNumber = numPages;
    }
  	window.location.href = currentPage.substr(0, index) + '/page-' + pageNumber + '.html';
  }

	var currentPageNumber = parseInt(/page-(\d+)/.exec(currentPage.substr(index))[1]);

	var keyCode = e.keyCode;
  if (keyCode === 13 || keyCode === 34 || keyCode === 39 || keyCode === 40) {
  	navigateTo(currentPageNumber + 1);
  } else if (keyCode === 33 || keyCode === 37 || keyCode === 38) {
    navigateTo(currentPageNumber - 1);
  } else if (keyCode >= 65 && keyCode <= 90) {
    navigateTo(keyCode - 64);
  } else {
    console.log('Unexpected key ' + keyCode);
  }
}

window.addEventListener('keydown', navigate);
