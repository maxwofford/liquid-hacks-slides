var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

// Routing
app.use(express.static(path.join(__dirname, 'public')));


/* Make a map that maps uuid to color */
let userMap = {}
/* Key: uuid
   value: color, position
 */

io.on('connection', (socket) => {
  var addedUser = false;
  console.log(`New connection`)


  /* Generates uuid and color for new user */
  socket.on("add user", (data) => {

    socket.uuid = generateUUID();
    socket.color = randomColor();
    socket.public_uuid = generatePublicUUID();
    addedUser = true;

    userMap[socket.uuid] = { dirty: false, color: socket.color, position: {x:0,y:0}, public_uuid: socket.public_uuid, player_direction: "right"}

    socket.broadcast.emit('user joined', {
      uuid: socket.uuid,
      color: socket.color
    });

    var data = {uuid: socket.uuid, color: socket.color, public_uuid: socket.public_uuid}

    socket.emit("user created", data);
    console.log("User #" + socket.uuid + " has joined as " + socket.color);
  });

  socket.on("move user", ({uuid, direction, rightPressed, leftPressed, upPressed,  downPressed}) => {
    
    // console.log({direction})
    var canvas_x = 100;
    var canvas_y = 100;
    
    if (!userMap[uuid]) {
      return
    }
    if (userMap[uuid].dirty) {
      return
    }
    userMap[uuid].dirty = true

    if(upPressed) {
      userMap[uuid].position.y = Math.max(userMap[uuid].position.y - 1, 0)
    } else if(downPressed) {
      userMap[uuid].position.y = Math.min(userMap[uuid].position.y + 1, canvas_y)
    } else if(leftPressed) {
        userMap[uuid].position.x = Math.max(userMap[uuid].position.x - 1, 0)
        userMap[uuid].player_direction = "left";
    } else if(rightPressed) /* Right */ {
        userMap[uuid].position.x = Math.min(userMap[uuid].position.x + 1, canvas_x)
        userMap[uuid].player_direction = "right";
    }

  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      console.log("User #" + socket.uuid + " has disconnected");
      delete userMap[socket.uuid];

      io.emit('tick', Object.keys(userMap).map(uuid => ({
        position: userMap[uuid].position,
        color: userMap[uuid].color,
        public_uuid: userMap[uuid].public_uuid,
        player_direction: userMap[uuid].player_direction,
      })))
    }
  });

  /* DEBUG */
  socket.on("ping", (data) => {
    socket.emit("pong", "pong");
  })

  /* when visualizer is opened */
  socket.on("all users", (data) => {
    socket.emit('tick', Object.keys(userMap).map(uuid => ({
      position: userMap[uuid].position,
      color: userMap[uuid].color,
      public_uuid: userMap[uuid].public_uuid,
      player_direction: userMap[uuid].player_direction,
    })))
  })

});

function generateUUID() {
  var id = Math.floor(Math.random() * 9000);
  // existing_IDs.push(id);
  return id
}

function generatePublicUUID() {
  var id = Math.floor(Math.random() * 9000);
  // existing_IDs.push(id);
  return id
}

function randomColor() {
  var colors = ["red", "orange","yellow","green","cyan","blue","purple","pink","brown","white","black"];

  var id = Math.floor(Math.random() * colors.length);

  return colors[id];
}

setInterval(() => {
  let shouldSendTick = false
  Object.keys(userMap).forEach(uuid => {
    if (userMap[uuid].dirty) {
      shouldSendTick = true
      userMap[uuid].dirty = false
    }
  })
  if (shouldSendTick) {
    console.log('sending tick')
    io.emit('tick', Object.keys(userMap).map(uuid => ({
      position: userMap[uuid].position,
      color: userMap[uuid].color,
      public_uuid: userMap[uuid].public_uuid,
      player_direction: userMap[uuid].player_direction,
    })))
  }
}, 50);

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});