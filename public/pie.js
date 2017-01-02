var data = require('electron').remote.require('../server.js').data
console.log(data)
var sum = function(a, b) { return a + b };

new Chartist.Pie('.ct-chart', data, {
    labelInterpolationFnc: function(value) {
        return value;
    }
});
