//Have arrays of slow and fast, SMA, LWMA, EMA, TMA

//keep track of last datapoint

"use strict";

var _ = require('underscore');

function Strategy(f, name) {
	this.populate = f;
	this.slow = [];
	this.fast = [];
	this.name = name;
}

var Strategies = {
	populate: function (arr) {
		this.SMA.populate(arr);
		this.LWMA.populate(arr);
		this.EMA.populate(arr);
		this.TMA.populate(arr);
	},

	SMA: new Strategy((function(datapoints) {
		function SMA_optimize(datapoints, n)
		{
			return Math.round( (_.last(datapoints)/n - datapoints[datapoints.length-n-1]/n) * 1000) /1000;
		}

		var temp_sum;
		var t = datapoints.length;
		if(t<= 5)
		{
			this.fast.push(		Math.round( (sum(datapoints)/t) * 1000) / 1000 );
			this.slow.push(_.last(this.fast));
		}
		else if(t <= 20) 
		{
			temp_sum = sum(_.last(datapoints, 5));
			this.slow.push( 	Math.round( ( (temp_sum + sum(_.first(datapoints,t-5))) /t) *1000 ) /1000 );
			this.fast.push( 	Math.round( (temp_sum/5) *1000 )/1000 );
		}
		else
		{
			this.fast.push(_.last(this.fast) + SMA_optimize(datapoints,5));
			this.slow.push(_.last(this.slow) +  SMA_optimize(datapoints,20));
		}
	}), 'SMA'),

	LWMA: new Strategy((function(datapoints) {
		function LWMA_optimize(datapoints, n)
		{
			var factors = _.range(1,n+1);
			var datapoints = _.last(datapoints, n);
			return Math.round( sum(
				_.map(_.zip(datapoints,factors), function(array){return array[0]*array[1];})
				) /sum(factors) *1000) /1000;
		}
		var t = datapoints.length;
		if(t<= 5)
		{
			this.fast.push(LWMA_optimize(datapoints, t));
			this.slow.push(_.last(this.fast));	 
		}
		else if(t <= 20) 
		{  
			this.fast.push(LWMA_optimize(datapoints, 5));
			this.slow.push(LWMA_optimize(datapoints, t));
		}
		else
		{
			this.fast = LWMA_optimize(datapoints, 5);
			this.slow = LWMA_optimize(datapoints, 20);
		}
	}), 'LWMA'),

	EMA: new Strategy((function(datapoints) {
		function EMA_optimize(lastp, n, prev)
		{
			var value = prev + ((lastp - prev) * (2/(n+1)));
			return Math.round(value*1000) /1000;
		}
		var t = datapoints.length;
		var lastprice = _.last(datapoints);

		if(t == 1)
		{
			this.fast.push(lastprice);
			this.slow.push(lastprice);
		}
		else
		{
			var fastEMA = _.last(this.fast);
			var slowEMA = _.last(this.slow);
			this.fast.push(	EMA_optimize( lastprice, 5, fastEMA) );
			this.slow.push( EMA_optimize( lastprice, 20, slowEMA) );
		}
	}), 'EMA'),

	TMA: new Strategy((function(datapoints) {
		function TMA_optimize(data, n)
		{
			return Math.round( ( (sum(data)/n) *1000 )) / 1000;
		}	
		var t = datapoints.length;
		if(t<= 5)
		{
			this.fast.push(	TMA_optimize(	_.last(Strategies.SMA.fast,  t), 	t));
			this.slow.push( TMA_optimize(	_.last(Strategies.SMA.slow,  t), 	t));
		}
		else if(t <= 20) 
		{
			this.fast.push(	TMA_optimize(	_.last(Strategies.SMA.fast,  5),	5));
			this.slow.push( TMA_optimize(	_.last(Strategies.SMA.slow,  t),	t));
		}
		else
		{
			this.fast.push(	TMA_optimize(	_.last(Strategies.SMA.fast, 5),		5));
			this.slow.push( TMA_optimize(	_.last(Strategies.SMA.slow, 20),	20));
		}	
	}), 'TMA')
};

/*Debugging
var dp = [1,2,3,4,5,6,7,8,9,10];

for (var i = 0; i < dp.length; i++) {
	Strategies.populate(_.first(dp,i+1));
};

console.log(Strategies.SMA.slow);
console.log(Strategies.SMA.fast);

console.log(Strategies.LWMA.slow);
console.log(Strategies.LWMA.fast);

console.log(Strategies.EMA.slow);
console.log(Strategies.EMA.fast);

console.log(Strategies.TMA.slow);
console.log(Strategies.TMA.fast);
*/

//sum function for array x
function sum(x)
{
	//code from Underscore.js Docmuentation
	return _.reduce(x, function(memo, num){return memo+num;},0);
}