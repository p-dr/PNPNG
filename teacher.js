server = require('electron').remote.require('./server.js')

function sendQuestion() {
    server.currentQuestion = document.querySelector("input[name='questionChooser']:checked").value
    console.log("New value for currentQuestion:", server.currentQuestion)
}
