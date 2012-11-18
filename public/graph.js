var socket = io.connect('http://0.0.0.0');

socket.on('data', function(data) {
  console.log(data);
});

socket.on('news', function (data) {
  console.log(data);
  socket.emit('my other event', { my: 'data' });
});  
  

// helpers

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}

function values_from(struct) {
  var vals = [];
  for (key in struct) 
    vals.push( struct[key] );
  return vals;
}

// Constants
var POINTS = 100
  , SCHEMES = ['sma', 'lwma', 'ema', 'tma']
  , TYPES = ['price', 'fast', 'slow']
  , COLOR = get_color_from(TYPES);

function get_color_from(types) {
  var colors = {}
  $.each( types, function(i, type) {
    colors[type] = Raphael.hsb(0.3 * i, 0.9, 0.5);
  });
  return colors;
}

// DOM ready

$(function() {
  
  $('#date').text(new Date().toDateString());
    
  var HEIGHT = $('#graph').height()
    , WIDTH = $('#graph').width() + 1
    , MARGIN = {top: 50, bottom: 50, left: 50, right: 20};
  
  var active = 'sma'
    , charts = {}
    , time = 0; 
    
  var graph = Raphael('graph', WIDTH, HEIGHT);
  var lines = create_lines(graph, TYPES, COLOR);
  var labels = {
    x: [], y: []
  }
  
  setup(graph);
  
  // UI
  
  $('a', '#graph-scheme').click(function(e) {
    e.preventDefault();
    
    active = $(this).data('scheme');
    
    $('li', '#graph-scheme').removeClass('active');
    $(this).parent('li').addClass('active');
    
    $('tspan', '#title').text(active.toUpperCase());
    
    update_graph();
  });
  
  $('#start').one('click', function(e) {
    e.preventDefault();
    $(this).text("Started").addClass("disabled");
    
    socket.emit('start');
  });
  
  
  // Graphing
  
  function setup(paper) {
    
    draw_legend(paper);
            
    var title = paper.text(MARGIN.left, 20, active.toUpperCase()).attr({
      'alignment-baseline': 'baseline',
      'text-anchor': 'start',
      'font-size': '30px'
    });
    title.node.id = "title";
    
    x_axis(paper);
    
    var dy = (HEIGHT - MARGIN.top - MARGIN.bottom) / 8;
    for(var i=0; i<8; i++) {
      var y = HEIGHT - i * dy - MARGIN.bottom - 5;
      var label = graph.text(20, y, 0);
      label.node.id = "y-" + i;
      labels.y.push(label);
    }
    var dx = (WIDTH - MARGIN.left - MARGIN.right) / 20;
    for(var i=0; i<20; i++) {
      var x = MARGIN.left + i * dx + 10;
      var label = graph.text(x, HEIGHT - 25, '.');
      label.node.id = "x-" + i;
      labels.x.push(label);
    }
    $.each( SCHEMES, function(i, scheme) {
      var chart = new Chart();
      chart.scale = new Scale(WIDTH, HEIGHT, MARGIN);
      charts[scheme] = chart;
    });
    
  }
        
  function update_graph() {
    var new_paths = charts[active].get_svg_paths();
    $.each( TYPES, function(i, type) {
      lines[type].animate({path: new_paths[type]}, 200, 'linear');
    });
    var labels = charts[active].labels();
    for(var i=0; i<labels.y.length; i++) {
      $('tspan', '#y-' + i).text(labels.y[i]);
    }
    for(var i=0; i<labels.x.length; i++) {
      $('tspan', '#x-' + i).text(labels.x[i]);
    }
  }
  
  var count = 1;
  function update_data() {
    $.each( SCHEMES, function(i, scheme) {
      for(var i=0; i<10; i++) {
        charts[scheme].add_point({
          price: Math.random() * 5 + 60,
          slow: Math.random() * 5 + 60,
          fast: Math.random() * 5 + 60
        });
      }
    });
    count++;
    update_graph();
    if(count < 30) setTimeout(update_data, 1000);
  }
  
  function draw_legend(paper) {
    var legend_x = WIDTH - MARGIN.right;
    for(legend in COLOR) {
      paper.rect(legend_x-20, 15, 20, 20).attr({ 'fill': COLOR[legend] });
      paper.text(legend_x-45, 25, legend.capitalize()).attr({'font-size': '16px'});
      legend_x -= 120;
    }
  }
  
  function x_axis(paper) {
    var instructions = [
      "M", MARGIN.left, HEIGHT - MARGIN.bottom, 
      "L", WIDTH - MARGIN.right, HEIGHT - MARGIN.bottom
    ]
    return paper.path(instructions.join(" "));
  }

});



function create_lines(graph, types, color) {
  var lines = {};
  $.each( types, function(i, type) {
    lines[type] = graph.path("M 0 0").attr({
      'stroke': color[type]
    });
  });
  return lines;
}




// Scale

function Scale(width, height, margins) {
  this.xVal = {
    min: 0,
    max: 0
  };
  this.yVal = {
    min: 1 / 0,
    max: -1 / 0
  }
  
  this.left = margins.left;
  this.top = margins.top;
  
  this.width = width - margins.left - margins.right;
  this.height = height - margins.top - margins.bottom;
};

Scale.prototype = {
  
  register: function(time, struct) {
    this.xVal.max = Math.max(time, this.xVal.max);
    this.xVal.min = Math.max(0, this.xVal.max - POINTS);
    
    if( !('min' in this.yVal) ) {
      this.yVal.min = y;
      this.yVal.max = y;
    } else {
      var vals = values_from(struct);
      for(func in this.yVal) {
        vals.push( this.yVal[func] );
        this.yVal[func] = Math[func].apply(Math, vals);
        vals.pop();
      }
    }
  },
  
  x: function(x) {
    var x_offset = x - this.xVal.min;
    var w = x_offset * (this.width / (this.xVal.max - this.xVal.min));
    return Math.round(w + this.left);
  },
  
  y: function(y) {
    var y_offset = y - this.yVal.min;
    var h = y_offset * (this.height / (this.yVal.max - this.yVal.min));
    // Remember the canvas has y = 0 at the top, and y = HEIGHT at the bottom
    return Math.round( this.height - h + this.top );
  },
  
  x_labels: function(amount) {
    var labels = [];
    var offset = (this.xVal.max - this.xVal.min) / amount;
    for(var i=0; i<amount; i++) {
      labels[i] = Math.round(i*offset + this.xVal.min)
    }
    return labels;
  },
  
  y_labels: function(amount) {
    var labels = [];
    var offset = (this.yVal.max - this.yVal.min) / amount;
    for(var i=0; i < amount; i++) {
      labels[i] = (i * offset + this.yVal.min).toFixed(3);
    }
    return labels;
  }
}

// Chart
/* - scale
 * price | fast | slow
 */

function Chart() {
  this.time = 0;
  this.price = [];
  this.fast = [];
  this.slow = [];
}

Chart.prototype = {
  
  // values = {price: ##, fast: ##, slow: ##}
  add_point: function(values) {
    for(key in values) {
      if(this.time > POINTS) {
        this[key].shift();
      }
      this[key].push(values[key]);
    }
    this.scale.register(this.time, values);
    this.time += 1;
  },
  
  get_svg_paths: function() {
    var paths = {};
    for(var i=0; i<TYPES.length; i++) {
      paths[TYPES[i]] = this.svg_path_for(TYPES[i]);
    }
    return paths;
  },
  
  svg_path_for: function(type) {
    var start = Math.max(0, this.time - POINTS);
    var instructions = ["M"];
    for(var i = 0; i < this[type].length; i++) {
      instructions.push( this.scale.x(start + i) );
      instructions.push( this.scale.y( this[type][i] ) );
      instructions.push("L")
    }
    instructions.pop();
    return instructions.join(" ");
  },
  
  labels: function() {
    return {
      x: this.scale.x_labels(20),
      y: this.scale.y_labels(8)
    }
  }
}

/*
  
  $('#generate-report').one('click', function() {
    var transactions = []; // replace!
    $.ajax({
      url: 'https://stage-api.e-signlive.com/aws/rest/services/codejam',
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: {
        'team': 'AJ Has No Class',
        'destination': 'alexander.ostrow@gmail.com',
        'transactions': transactions
      }
    });
  });

 */
 