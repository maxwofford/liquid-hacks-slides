window.onload = () => {
  const memory = {
    get: key => window.localStorage.getItem(key),
    set: (k, v) => window.localStorage.setItem(k, v),
  }
  const move = direction => {
    const data = {
      uuid: memory.get('uuid'),
      direction
    }
    socket.emit('move user', data)
  }

  // document.addEventListener('keydown', keyDownHandler, false)
  // document.addEventListener('keyup', keyUpHandler, false)

  // function keyDownHandler(event) {
  //   if (event.keyCode == 39) {
  //     rightPressed = true;
  //   }
  //   else if (event.keyCode == 37) {
  //     leftPressed = true;
  //   }
  //   if (event.keyCode == 40) {
  //   	downPressed = true;
  //   }
  //   else if (event.keyCode == 38) {
  //   	upPressed = true;
  //   }
  // }
  // function keyUpHandler(event) {
  //   if (event.keyCode == 39) {
  //     rightPressed = true;
  //   }
  //   else if (event.keyCode == 37) {
  //     leftPressed = true;
  //   }
  //   if (event.keyCode == 40) {
  //   	downPressed = true;
  //   }
  //   else if (event.keyCode == 38) {
  //   	upPressed = true;
  //   }
  // }

  document.querySelector('.up').onclick = () => move('up')
  document.querySelector('.down').onclick = () => move('down')
  document.querySelector('.right').onclick = () => move('right')
  document.querySelector('.left').onclick = () => move('left')

  const socket = io()
  let start = null
  socket.on('connect', () => {
    console.log('client is connected')
    socket.emit('ping')
    start = Date.now()

    socket.emit('add user')
  })

  socket.on('user created', data => {
    memory.set('uuid', data.uuid)
    memory.set('color', data.color)
  })

  socket.on('pong', data => {
    let duration = Date.now() - start
    console.log('received pong:', data, 'duration(ms):', duration)
  })

  socket.on('tick', data => {
    console.log(data)
  })
}