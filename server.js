const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const users = []
const exercises = []
let usersWithLogs = []

const getDatesInRange = function(start, end) {
    for(var arr=[],dt=new Date(start); dt<=new Date(end); dt.setDate(dt.getDate()+1)){
        arr.push(new Date(dt).toDateString());
    }
    return arr;
};

app.post('/api/users', (req, res) => {
  const userObject = { username: req.body.username, _id: users.length.toString() }
  const userObjectWithLog = { username: req.body.username, _id: users.length.toString(), count: 0, log: [] }
  
  users.push(userObject)
  usersWithLogs.push(userObjectWithLog)
  return res.json(userObject)
});
app.get('/api/users', (req, res) => {
  return res.json(users)
});


app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params
  const { description, duration, date } = req.body
  
  const {username, _id: userId} = users.filter((user) => user._id === _id)[0]
  const exerciseObject = { username, _id: userId, description, duration: parseInt(duration), date: date ? new Date(date).toDateString() : new Date().toDateString() }
  exercises.push(exerciseObject)

  const userIndex = usersWithLogs.findIndex(user => user._id === _id);
  usersWithLogs[userIndex].log.push({ description, duration: parseInt(duration), date: date ? new Date(date).toDateString() : new Date().toDateString() })
  usersWithLogs[userIndex].count++
  return res.json(exerciseObject)
});

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params
  const { from, to, limit } = req.query
  let user = usersWithLogs.filter((user) => user._id === _id)[0]
console.log(user)
  if(from && to){
    console.log(from, to, limit)
  const dates = getDatesInRange(from, to)

  const results = []
  dates.forEach((date)=>{
    const oneLog = user.log.filter((log) => log.date === date)[0]
    oneLog && results.push(oneLog)
  })

  user.log = results}
  if (limit) user.log.length = limit
  console.log(user)
  return res.json(user)
});

app.get('/api/users/:id/logs', (req, res) => {
  const { id } = req.params
  const user = usersWithLogs.filter((user) => user._id === id)[0]
  return res.json(user)
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
