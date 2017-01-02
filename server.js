//                            server.js

// Predefs ============================================================

const fs = require('fs'),// realy need?

      express = require('express'), // rm?
      server = express(),//server = express app
      bodyParser = require('body-parser'),
      port = 3000,

      electron = require('electron'), //rm?
      {app, BrowserWindow} = electron,
      
      locals = {server: exports, address: `${getInet()}:${port}`}, //does not need exports anymore
      pug = require('electron-pug')({preety: true}, locals)

      

var questions = null, //many globals...
    answerers = {}

exports.currentQuestion = ''
exports.results = {}



function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
    return(a);
}

function getInet(){//Please, generalize
    let ifaces = require('os').networkInterfaces()
    for (iface in ifaces) {
        for (i in ifaces[iface]) {
            var ret = ifaces[iface][i].address
            if (ret.indexOf('192') === 0) return ret
        }
    }

}


// Electron related ===================================================

app.on('ready', () => {
    win = new BrowserWindow()
    win.loadURL(`file://${__dirname}/views/teacher.pug`) // use path?
    fs.readFile('questions.json', (err, results) => {
        if (err) throw err
        exports.questions = JSON.parse(results)
    })
})

app.on('window-all-closed', () => {//update (write) questions.json?
  app.quit()
})


// Express related ====================================================

server.set('view engine', 'pug');
server.use(express.static('public'))
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({extended: false}))//entended?


server.get('/', (req, res) => {
    
    var curr = exports.currentQuestion
    
    if (!curr) res.render('message', {text: "Wait for the teacher."});//end or send?
    
    else {
        
        if (!answerers[curr]) {answerers[curr] = []}

        else if (answerers[curr].indexOf(req.ip) !== -1) {
            res.render('message', {text: "Thanks for answering :)"});
        
        }
        
        else res.render('student', {
            "question": curr,
            "alternatives": shuffle(exports.questions[curr])
        })
    }
})

server.post('/getanswer', (req, res) => {// redirect back after?

    if (answerers[exports.currentQuestion].indexOf(req.ip) !== -1) {
        res.render('message', {text: "You have already answered."});
        
    }
    
    else {
        var choice = req.body.choice;
        var current = exports.results[exports.currentQuestion]
        
        if (!current) {
            current = exports.results[exports.currentQuestion] = {labels:[], series:[]}

        }
        
        if (current.labels.indexOf(choice) === -1) {
            current.labels.push(choice);
            current.series.push(1)
        }
    
        else {
            current.series[current.labels.indexOf(choice)] += 1
        }

        res.render('message', {text: "Your answer was registered."});
        console.log(exports.results)

        answerers[exports.currentQuestion].push(req.ip);
        console.log(answerers);
    }
});

server.get('/chart', (req, res) => {
    res.render('piechart', locals)

})


var listener = server.listen(port, function() {
    var adr = listener.address()
    console.log(`Running server on http://${adr.address}:${adr.port}`);
    console.log(getInet())
    
});
