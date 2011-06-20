// Copyright (C) 2011 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.

(function() {
	var Test = new TestCase("FeaturesDom");
	var config;
	var estimates;
	var featuresDom;
	var ul;
	var li;
	var divider;

	function populate() {
		featuresDom = new rabu.schedule.FeaturesDom($(".rabu-features"), estimates);
		featuresDom.populate();
		ul = $("ul");
		li = $("li");
		divider = $(".rabu-divider");
	}

	function assertLiPositions(message, positions) {
		var joiner = "";
		var actualPositions = "[";
		li.each(function(index, element) {
			actualPositions += joiner + $(element).offset().top;
			joiner = ", ";
		});
		actualPositions += "]";

		joiner = "";
		var expectedPositions = "[";
		positions.forEach(function(element, index) {
			expectedPositions += joiner + element;
			joiner = ", ";
		});
		expectedPositions += "]";

		assertEquals(message, expectedPositions, actualPositions);
	}

	function dragElementTo(jQueryElement, position) {
		var cursorOffset = 0;

		var downEvent = new jQuery.Event();
		downEvent.pageX = 0;
		downEvent.pageY = jQueryElement.offset().top + cursorOffset;
		downEvent.which = 1;
		downEvent.type = "mousedown";
		jQueryElement.trigger(downEvent);

		var moveEvent = new jQuery.Event();
		moveEvent.pageX = 0;
		moveEvent.pageY = position + cursorOffset;
		moveEvent.type = "mousemove";
		jQueryElement.trigger(moveEvent);

		var upEvent = new jQuery.Event();
		upEvent.pageX = 0;
		upEvent.pageY = position + cursorOffset;
		upEvent.which = 1;
		upEvent.type = "mouseup";
		jQueryElement.trigger(upEvent);
	}
	
	Test.prototype.setUp = function() {
		/*:DOC +=   <style type='text/css'>
						li { height: 20px }
						ul { margin: 0; }
						body { margin: 0; }
						.rabu-divider { margin-top: 34px; padding-top: 16px; }
					</style>  */
		/*:DOC +=   <ul class="rabu-features"></ul> */
		/*:DOC +=   <div class="rabu-divider"></div> */
		config = {
			included: [
				["completed", 0],
				["feature A", 70],
				["feature B", 30]
			],
			excluded: [
				["excluded 1", 20]
			]
		};
		estimates = new rabu.schedule.Estimates({iterations: [config]});
		populate();

		assertEquals("assumption: li height", 20, li.first().outerHeight(true));
		assertEquals("assumption: ul top", 0, ul.offset().top);
		assertEquals("assumption: first li top", 0, li.first().offset().top);
		assertEquals("assumption: divider height", 50, divider.outerHeight(true));
	};

	Test.prototype.test_populate_createsFeatureList = function() {
		assertEquals("li #0 text", "completed", $(li[0]).text());
		assertEquals("li #1 text", "feature A", $(li[1]).text());
		assertEquals("li #2 text", "feature B", $(li[2]).text());
		assertEquals("li #3 text", "excluded 1", $(li[3]).text());
	};

	Test.prototype.test_populate_isIdempotent = function() {
		populate();
		populate();
		assertEquals("# of items", 4, li.length);
	};

	Test.prototype.test_populate_marksItemsDone = function() {
		assertTrue("li #0 done", $(li[0]).hasClass("rabu-done"));
		assertFalse("li #1 done", $(li[1]).hasClass("rabu-done"));
		assertFalse("li #2 done", $(li[2]).hasClass("rabu-done"));
		assertFalse("li #3 done", $(li[3]).hasClass("rabu-done"));
	};

	Test.prototype.test_populate_marksItemsIncludedAndExcluded = function() {
		assertTrue("li #0 included", $(li[0]).hasClass("rabu-included"));
		assertTrue("li #1 included", $(li[1]).hasClass("rabu-included"));
		assertTrue("li #2 included", $(li[2]).hasClass("rabu-included"));
		assertFalse("li #3 included", $(li[3]).hasClass("rabu-included"));

		assertFalse("li #0 excluded", $(li[0]).hasClass("rabu-excluded"));
		assertFalse("li #1 excluded", $(li[1]).hasClass("rabu-excluded"));
		assertFalse("li #2 excluded", $(li[2]).hasClass("rabu-excluded"));
		assertTrue("li #3 excluded", $(li[3]).hasClass("rabu-excluded"));
	};

	Test.prototype.test_populate_positionsItemsAndDivider = function() {
		config.excluded[1] = ["excluded 2", 30];
		populate();

		assertLiPositions("excluded features should be positioned below divider", [0, 20, 40, 110, 130]);
		assertEquals("divider should be centered in gap", 94, divider.offset().top);
	};

	Test.prototype.test_populate_positioningAccomodatesMargins = function() {
		ul.css("margin-top", "15px");
		populate();
		assertLiPositions("features should be positioned below margins", [15, 35, 55, 125]);
		assertEquals("divider should be centered in gap", 109, divider.offset().top);
	};

	Test.prototype.test_populate_positionsDividerAtBottomOfListWhenNoExcludedFeatures = function() {
		config.excluded = undefined;
		populate();

		assertLiPositions("li positions", [0, 20, 40]);
		assertEquals("divider position", 94, divider.offset().top);
	};

	Test.prototype.test_populate_positionsDividerAtTopOfListWhenNoIncludedFeatures = function() {
		config.included = undefined;
		config.excluded[1] = ["excluded 2", 30];
		populate();

		assertLiPositions("li positions", [50, 70]);
		assertEquals("divider position", 34, divider.offset().top);
	};

	Test.prototype.test_populate_resizesListToAccomodateDivider = function() {
		assertEquals("height of list should accomodate divider", 130, ul.outerHeight(true));
		ul.css("padding-bottom", "20px");
		ul.css("margin-bottom", "16px");
		populate();
		assertEquals("divider should accomodate existing padding and margins", 166, ul.outerHeight(true));
	};

	function option(key) { return $(li).draggable("option", key); }

	Test.prototype.test_populate_makesFeaturesDraggable = function() {
		assertTrue("should be draggable", $(li).hasClass("ui-draggable"));
		assertEquals("constrained vertically", "y", option("axis"));
		assertEquals("top", 0, option("containment")[1]);
		assertEquals("bottom", 110, option("containment")[3]);
		assertEquals("scroll speed", 10, option("scrollSpeed"));
	};

	Test.prototype.test_populate_constrainsDraggableAreaToTopAndBottomOfList = function() {
		ul.css("margin-top", "5px");
		ul.css("margin-bottom", "10px");
		populate();
		assertEquals("top", 5, option("containment")[1]);
		assertEquals("bottom", 115, option("containment")[3]);
	};

	function assertDrag(message, element, dragTo, expectedResult) {
		dragElementTo($(element), dragTo);
		assertLiPositions(message, expectedResult);
	}

	Test.prototype.test_dragging_idempotency = function() {
		assertDrag("should be idempotent (1)", li[0], 20, [20, 0, 40, 110]);
		assertDrag("should be idempotent (2)", li[0], 21, [21, 0, 40, 110]);
	};

	Test.prototype.test_dragging_beyondLegalBounds = function() {
		config.excluded = undefined;
		populate();
		assertDrag("down past legal bounds", li[0], 100, [94, 0, 20]);
		assertDrag("up past legal bounds", li[2], -100, [20, 40, 0]);
	};

	Test.prototype.test_draggingDown_movesElementWhenBottomIsAtCenterOfNextElement = function() {
		/*:DOC +=   <style type='text/css'>
						.rabu-done { height: 32px }
					</style>  */
		config.included = [
			["single A", 1],
			["double B", 0],
			["single C", 1],
			["single D", 1]
		];
		config.excluded = undefined;
		populate();
		assertLiPositions("starting values", [0, 20, 52, 72]);
		assertDrag("li 0 -> li 1 (before halfway point)", li[0], 15, [15, 20, 52, 72]);
		assertDrag("li 0 -> li 1 (after halfway point)", li[0], 16, [16, 0, 52, 72]);
		assertDrag("li 0 -> li 2 (before halfway point)", li[0], 41, [41, 0, 52, 72]);
		assertDrag("li 0 -> li 2 (after halfway point)", li[0], 42, [42, 0, 32, 72]);
		assertDrag("li 0 -> li 3 (before halfway point)", li[0], 61, [61, 0, 32, 72]);
		assertDrag("li 0 -> li 3 (after halfway point)", li[0], 62, [62, 0, 32, 52]);
	};

	Test.prototype.test_draggingUp_movesElementWhenTopIsAtCenterOfPreviousElement = function() {
		/*:DOC +=   <style type='text/css'>
						.rabu-done { height: 32px }
					</style>  */
		config.included = [
			["single A", 1],
			["single B", 1],
			["single C", 1],
			["double D", 0],
			["double E", 0]
		];
		config.excluded = undefined;
		populate();
		assertLiPositions("starting values", [0, 20, 40, 60, 92]);
		assertDrag("li 4 -> li 3 (before halfway point)", li[4], 77, [0, 20, 40, 60, 77]);
		assertDrag("li 4 -> li 3 (after halfway point)", li[4], 76, [0, 20, 40, 92, 76]);
		assertDrag("li 4 -> li 2 (before halfway point)", li[4], 51, [0, 20, 40, 92, 51]);
		assertDrag("li 4 -> li 2 (after halfway point)", li[4], 50, [0, 20, 72, 92, 50]);
		assertDrag("li 4 -> li 1 (before halfway point)", li[4], 31, [0, 20, 72, 92, 31]);
		assertDrag("li 4 -> li 1 (after halfway point)", li[4], 30, [0, 52, 72, 92, 30]);
		assertDrag("li 4 -> li 0 (before halfway point)", li[4], 11, [0, 52, 72, 92, 11]);
		assertDrag("li 4 -> li 0 (after halfway point)", li[4], 10, [32, 52, 72, 92, 10]);
	};

	// 34margin 16padding //TODO: deleteme
	Test.prototype.test_draggingDown_movesDividerWhenBottomIsAtCenterOfContentNotMargin = function() {
		assertDrag("li 2 -> divider (before halfway point)", li[2], 81, [0, 20, 81, 110]);
		assertEquals("li 2 -> divider (divider position before move)", 94, divider.offset().top);
		assertDrag("li 2 -> divider (after halfway point)", li[2], 82, [0, 20, 82, 110]);
		assertEquals("li 2 -> divider (divider position after move)", 74, divider.offset().top);
		// TODO: This is all wrong; needs to reposition divider itself. Do manual test to see why.
//		assertDrag("li 2 -> li 3 (before halfway point)", li[2], 99, [0, 20, 99, 110]);
//		assertDrag("li 2 -> li 3 (after halfway point)", li[2], 100, [0, 20, 100, 90]);
	};

	Test.prototype.test_draggingUpPastDivider_repositionsDivider = function() {
//		assertDrag("li 3 -> li 2 (before halfway point)", li[3], 51, [0, 20, 40, 51]);
//		assertDrag("li 3 -> li 2 (after halfway point)", li[3], 50, [0, 20, 110, 50]);
	};

	Test.prototype.test_dropping_snapsItemsIntoPlace = function() {
		// TODO
	};

	Test.prototype.test_dragging_worksWithMultipleSequentialDragsAndDrops = function() {
		// TODO
	};
}());