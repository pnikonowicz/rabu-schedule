var rabu_ns = {};

rabu_ns.Rabu = function(config_in) {
	var estimates;

	function init(config) {
		if (!config) {
			throw "Expected config";
		}
		estimates = new rabu_ns.Estimates(config);
	}
	init(config_in);
	
	function iterations() {
		return estimates.totalEstimate() / estimates.velocity();
	}

	function calcProjection(multiplier) {
		return iterations() * multiplier;
	}

	function convertToDate(iterationsRemaining) {
		var days = Math.ceil(iterationsRemaining * estimates.iterationLength());
		var date = estimates.currentIterationStarted();
		date.setDate(date.getDate() + days);
		return date;
	}

	function dateToString(date) {
		return date.toString('MMMM dS');
	}

	function featuresToHtml(stringArray) {
		var reducer = function(sum, feature) {
			var openTag = "<li>";
			if (feature.isDone()) { openTag = "<li class='rabu-done'>"; }
			return sum + openTag + feature.name() + "</li>";
		};
		return stringArray.reduce(reducer, "");
	}

	this.populateDom = function() {
		$(".rabu-name").text(estimates.name());
		$(".rabu-updated").text(estimates.updated().toString("MMMM dS, yyyy"));
		$(".rabu-tenPercentDate").text(dateToString(this.tenPercentDate()));
		$(".rabu-fiftyPercentDate").text(dateToString(this.fiftyPercentDate()));
		$(".rabu-ninetyPercentDate").text(dateToString(this.ninetyPercentDate()));
		$(".rabu-features").html(featuresToHtml(estimates.features()));
	};

	this.tenPercentDate = function() {
		return convertToDate(this.tenPercentIterationsRemaining());
	};

	this.fiftyPercentDate = function() {
		return convertToDate(this.fiftyPercentIterationsRemaining());
	};

	this.ninetyPercentDate = function() {
		return convertToDate(this.ninetyPercentIterationsRemaining());
	};

	this.tenPercentIterationsRemaining = function() {
		return calcProjection(estimates.tenPercentMultiplier());
	};

	this.fiftyPercentIterationsRemaining = function() {
		return calcProjection(estimates.fiftyPercentMultiplier());
	};

	this.ninetyPercentIterationsRemaining = function() {
		return calcProjection(estimates.ninetyPercentMultiplier());
	};
};