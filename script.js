var isGithubDemo = isGithubDemo || false;  // This is for GitHub demo only. Remove it in your project

void function(window, document, undefined) {

  // ES5 strict mode
  "user strict";

  var MIN_COLUMN_COUNT = 3; // minimal column count
  var COLUMN_WIDTH = 220;   // cell width: 190, padding: 14 * 2, border: 1 * 2
  var CELL_PADDING = 26;    // cell padding: 14 + 10, border: 1 * 2
  var GAP_HEIGHT = 15;      // vertical gap between cells
  var GAP_WIDTH = 15;       // horizontal gap between cells
  var THRESHOLD = 2000;     // determines whether a cell is too far away from viewport (px)

  var columnHeights;        // array of every column's height
  var columnCount;          // number of columns
  var noticeDelay;          // popup notice timer
  var resizeDelay;          // resize throttle timer
  var scrollDelay;          // scroll throttle timer
  var managing = false;     // flag for managing cells state
  var loading = false;      // flag for loading cells state
  var isNoMore = false;		// flag for all data loaded
  var currentLoadPage = 0;

  var noticeContainer = document.getElementById('notice');
  var cellsContainer = document.getElementById('cells');
  var loaderContainer = document.getElementById('loader');
  var cellTemplate = document.getElementById('template').innerHTML;

  // Cross-browser compatible event handler.
  var addEvent = function(element, type, handler) {
    if(element.addEventListener) {
      addEvent = function(element, type, handler) {
        element.addEventListener(type, handler, false);
      };
    } else if(element.attachEvent) {
      addEvent = function(element, type, handler) {
        element.attachEvent('on' + type, handler);
      };
    } else {
      addEvent = function(element, type, handler) {
        element['on' + type] = handler;
      };
    }
    addEvent(element, type, handler);
  };

  // Get the minimal value within an array of numbers.
  var getMinVal = function(arr) {
    return Math.min.apply(Math, arr);
  };

  // Get the maximal value within an array of numbers.
  var getMaxVal = function(arr) {
    return Math.max.apply(Math, arr);
  };

  // Get index of the minimal value within an array of numbers.
  var getMinKey = function(arr) {
    var key = 0;
    var min = arr[0];
    for(var i = 1, len = arr.length; i < len; i++) {
      if(arr[i] < min) {
        key = i;
        min = arr[i];
      }
    }
    return key;
  };

  // Get index of the maximal value within an array of numbers.
  var getMaxKey = function(arr) {
    var key = 0;
    var max = arr[0];
    for(var i = 1, len = arr.length; i < len; i++) {
      if(arr[i] > max) {
        key = i;
        max = arr[i];
      }
    }
    return key;
  };

  // Pop notice tag after user liked or marked an item.
  var notice = function(msg) {
    clearTimeout(noticeDelay);
    noticeContainer.innerHTML = 'Notice:' + '<strong>' + msg + '</strong>';
    noticeContainer.className = 'on';
    noticeDelay = setTimeout(function() {
       noticeContainer.className = 'off';
     }, 2000);
  };

  var clickEvent = function(){
	var e = event || window.event;
    var target = e.target || e.srcElement;
    if(target.tagName == 'SPAN') {
		var targetTitle = target.parentNode.tagLine;
		var codeLink = target.parentNode.codeLink;
	    var apkLink = target.parentNode.apkLink;
		
		if(target.className == 'like'){
			//alert('like');
			openWindow(codeLink);
			return;
		}
		if(target.className == 'mark'){
			//alert('mark');
			openWindow(apkLink);
			return;
		}
		notice('source not found!');
	}else{
		notice('clickEvent wrong!');
	}
  }

  var openWindow = function(url){
	  if (url == null || url == undefined || url == ''){
		notice('No Source');
	  }else{
		window.open (url)
	  }
  } 

  // Calculate column count from current page width.
  var getColumnCount = function() {
    return Math.max(MIN_COLUMN_COUNT, Math.floor((document.body.offsetWidth + GAP_WIDTH) / (COLUMN_WIDTH + GAP_WIDTH)));
  };

  // Reset array of column heights and container width.
  var resetHeights = function(count) {
    columnHeights = [];
    for(var i = 0; i < count; i++) {
      columnHeights.push(0);
    }
    cellsContainer.style.width = (count * (COLUMN_WIDTH + GAP_WIDTH) - GAP_WIDTH) + 'px';
  };

  // Fetch JSON string via Ajax, parse to HTML and append to the container.
  var appendCells = function(num) {
    if(loading) {
      // Avoid sending too many requests to get new cells.
      return;
    }
    var xhrRequest = new XMLHttpRequest();
    var fragment = document.createDocumentFragment();
    var cells = [];
    var images;
	//alert('num='+num);
    xhrRequest.open('GET', 'json.php?n=' + num, true);
    xhrRequest.onreadystatechange = function() {
      if(xhrRequest.readyState == 4 && xhrRequest.status == 200) {
        images = JSON.parse(xhrRequest.responseText);
        for(var j = 0, k = images.length; j < k; j++) {
          var cell = document.createElement('div');
          cell.className = 'cell pending';
          cell.tagLine = images[j].title;
          cells.push(cell);
          front(cellTemplate, images[j], cell);
          fragment.appendChild(cell);
        }
        cellsContainer.appendChild(fragment);
        loading = false;
        adjustCells(cells);
      }
    };
    loading = true;
    xhrRequest.send(null);
  };

  // Fake mode, only for GitHub demo. Delete this function in your project.
  var appendCellsDemo = function(num) {
    if(loading) {
      // Avoid sending too many requests to get new cells.
      return;
    }
	//initDataFromJson();
    var fragment = document.createDocumentFragment();
    var cells = [];
	
	var dataSize = datas.length;
	var beginIndex = currentLoadPage*num;
	currentLoadPage = currentLoadPage+1;

	if(beginIndex+num <= dataSize){
		for(var k = 0; k < num; k++){
			var dataIndex = beginIndex + k;
			var cell = document.createElement('div');
			cell.className = 'cell pending';
			cell.tagLine = 'demo picture ' + dataIndex;
			cell.codeLink = 'http://www.baidu.com?p=codeLink';
			cell.apkLink = 'http://www.baidu.com?p=apkLink';
			cells.push(cell);
			
			//alert('beginIndex='+beginIndex+' dataIndex='+dataIndex);
			front(cellTemplate, { 'title':datas[dataIndex][0], 'imagesrc': datas[dataIndex][1], 'height': datas[dataIndex][2], 'width': datas[dataIndex][3] ,'imagelink': datas[dataIndex][4],'magh': 'maghtest'}, cell);
			fragment.appendChild(cell);
		}
	}else if(beginIndex <= dataSize){
		for(var k = 0; k < dataSize-beginIndex; k++){
			var dataIndex = beginIndex + k;
			var cell = document.createElement('div');
			cell.className = 'cell pending';
			cell.tagLine = 'demo picture ' + dataIndex;
			cell.codeLink = 'http://www.baidu.com?p=codeLink';
			cell.apkLink = 'http://www.baidu.com?p=apkLink';
			cells.push(cell);
			front(cellTemplate, { 'title':datas[dataIndex][0], 'imagesrc': datas[dataIndex][1], 'height': datas[dataIndex][2], 'width': datas[dataIndex][3] ,'imagelink': datas[dataIndex][4],'magh': 'maghtest'}, cell);
			fragment.appendChild(cell);
		}
	}else{
		//alert('OVER');	
		loaderContainer.innerHTML = '==========All Loaded=========='
	}
	
    // Faking network latency.
    setTimeout(function() {
      loading = false;
      cellsContainer.appendChild(fragment);
      adjustCells(cells);
    }, 500);
  };

  // Position the newly appended cells and update array of column heights.
  var adjustCells = function(cells, reflow) {
    var columnIndex;
    var columnHeight;
    for(var j = 0, k = cells.length; j < k; j++) {
      // Place the cell to column with the minimal height.
      columnIndex = getMinKey(columnHeights);
      columnHeight = columnHeights[columnIndex];
      cells[j].style.height = (cells[j].offsetHeight - CELL_PADDING) + 'px';
      cells[j].style.left = columnIndex * (COLUMN_WIDTH + GAP_WIDTH) + 'px';
      cells[j].style.top = columnHeight + 'px';
      columnHeights[columnIndex] = columnHeight + GAP_HEIGHT + cells[j].offsetHeight;
      if(!reflow) {
        cells[j].className = 'cell ready';
      }
    }
    cellsContainer.style.height = getMaxVal(columnHeights) + 'px';
    manageCells();
  };

  // Calculate new column data if it's necessary after resize.
  var reflowCells = function() {
    // Calculate new column count after resize.
    columnCount = getColumnCount();
    if(columnHeights.length != columnCount) {
      // Reset array of column heights and container width.
      resetHeights(columnCount);
      adjustCells(cellsContainer.children, true);
    } else {
      manageCells();
    }
  };

  // Toggle old cells' contents from the DOM depending on their offset from the viewport, save memory.
  // Load and append new cells if there's space in viewport for a cell.
  var manageCells = function() {
    // Lock managing state to avoid another async call. See {Function} delayedScroll.
    managing = true;

    var cells = cellsContainer.children;
    var viewportTop = (document.body.scrollTop || document.documentElement.scrollTop) - cellsContainer.offsetTop;
    var viewportBottom = (window.innerHeight || document.documentElement.clientHeight) + viewportTop;

    // Remove cells' contents if they are too far away from the viewport. Get them back if they are near.
    // TODO: remove the cells from DOM should be better :<
    for(var i = 0, l = cells.length; i < l; i++) {
      if((cells[i].offsetTop - viewportBottom > THRESHOLD) || (viewportTop - cells[i].offsetTop - cells[i].offsetHeight > THRESHOLD)) {
        if(cells[i].className === 'cell ready') {
          cells[i].fragment = cells[i].innerHTML;
          cells[i].innerHTML = '';
          cells[i].className = 'cell shadow';
        }
      } else {
        if(cells[i].className === 'cell shadow') {
          cells[i].innerHTML = cells[i].fragment;
          cells[i].className = 'cell ready';
        }
      }
    }

    // If there's space in viewport for a cell, request new cells.
    if(viewportBottom > getMinVal(columnHeights)) {
      // Remove the if/else statement in your project, just call the appendCells function.
	  if(isNoMore){
		//alert('over');
		//return;
		}
      if(isGithubDemo) {
        appendCellsDemo(columnCount);
		//appendCells(columnCount);
      } else {
        appendCells(columnCount);
      }
    }

    // Unlock managing state.
    managing = false;
  };

  // Add 500ms throttle to window scroll.
  var delayedScroll = function() {
    clearTimeout(scrollDelay);
    if(!managing) {
      // Avoid managing cells for unnecessity.
      scrollDelay = setTimeout(manageCells, 500);
    }
  };

  // Add 500ms throttle to window resize.
  var delayedResize = function() {
    clearTimeout(resizeDelay);
    resizeDelay = setTimeout(reflowCells, 500);
  };

  // Initialize the layout.
  var init = function() {
    // Add other event listeners.
    addEvent(cellsContainer, 'click', clickEvent);
    addEvent(window, 'resize', delayedResize);
    addEvent(window, 'scroll', delayedScroll);

    // Initialize array of column heights and container width.
    columnCount = getColumnCount();
    resetHeights(columnCount);

    // Load cells for the first time.
    manageCells();
  };

  // Ready to go!
  addEvent(window, 'load', init);

}(window, document);