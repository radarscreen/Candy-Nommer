$(document).ready(function(){

Physics(function(world){
  var viewWidth = 400;
  var viewHeight = 400;

  var snakeVel;
  var snakeSpeed = 0.1;

  //define renderer
  var renderer = Physics.renderer('canvas', {
    el: 'viewport',
    width: viewWidth,
    height: viewHeight,
    meta: false, // don't display meta data
    debug: true,
  });



  // add the renderer
  world.add( renderer );

  // render on each step
  world.on('step', function(){
    world.render();
  });

  // bounds of the window
  var viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);

  // add an "apple"
  var apple = Physics.body('circle', {
    x: Math.floor((Math.random() * 380) + 6),
    y: Math.floor((Math.random() * 380) + 6),
    radius: 5,
    styles: {
      strokeStyle: '#351024',
      lineWidth: 1,
      fillStyle: 'red',
      angleIndicator: 'white',
      objectType: 'apple'
    }
  });

  // add image of candy
  apple.view = new Image();
  apple.view.src = 'straightCandy.png';

  world.add(apple);

  // define a "newApple" --but NOT added to world yet
  var newApple = Physics.body('circle', {
  radius: 5,
  styles: {
    fillStyle: 'green',
    angleIndicator: 'white',
    objectType: 'apple'
    }
  });


  //define snake 
  var snake = Physics.body('rectangle', {
    x: 200, // x-coordinate
    y: 250, // y-coordinate
    vx: 0.0, //starts at no velocity
    vy: 0.0,
    width: 10, //initial snake dimensions
    height: 10,
    mass: 120000000000, 
    //snake appearance
    styles: {
      fillStyle: 'black',
      angleIndicator: 'white'
    }

  });

  //snake put to sleep
  snake.sleep(true);


  //snake added to world
  world.add(snake);


  
  // constrain objects to these bounds
  world.add(Physics.behavior('edge-collision-detection', {
      aabb: viewportBounds,
      restitution: 0,
      cof: 1
  }));

  // ensure objects bounce when edge collision is detected
  world.add(Physics.behavior('body-impulse-response') );

  world.add(Physics.behavior('body-collision-detection'));

  //smooths 'sweeps' the rendering of the collision detections
  world.add(Physics.behavior('sweep-prune') );


  // subscribe to ticker to advance the simulation
  Physics.util.ticker.on(function( time, dt ){
      world.step( time );
  });


  // user input for snake's direction changes
  window.addEventListener('keyup', function(event) {
    snake.sleep(false);
      if (event.keyCode === 37) {
        world.emit('move', 'left');
      } else if (event.keyCode === 39) {
        world.emit('move', 'right');
      } else if (event.keyCode === 38) {
        world.emit('move', 'top');
      } else if (event.keyCode === 40) {
        world.emit('move', 'down');
      }
  });

  // start the ticker
  Physics.util.ticker.start();


  // sets constant velocity of snake
  world.on('move', function(data, e) {
   
    var vel = snake.state.vel;
    if (data === 'left') {
      vel.set(-snakeSpeed, 0);
    } 
    else if (data === 'right') {
      vel.set(snakeSpeed, 0);
    }
    else if (data === 'top') {
      vel.set(0, -snakeSpeed);
    }
    else {
      vel.set(0, snakeSpeed);
    }

    // value designated to retrieve velocity within other functions
    snakeVel = vel;
  });

  // sets counter for scoring purposes
  var counter = 1;

  // collision detection mechanism
  world.on('collisions:detected', function(data, e) {
      data.collisions[0].bodyA.sleep(true);
      data.collisions[0].bodyB.sleep(true);

    // stipulates that apple and snake collisions result in:
    if (snake === data.collisions[0].bodyA && apple === data.collisions[0].bodyB || apple === data.collisions[0].bodyA && snake === data.collisions[0].bodyB) {
      
      // the apple being removed from the world,
      world.removeBody(apple);
      
      // the newApple body has a randomly generated coordinate, 
      newApple.state.pos.set(Math.floor((Math.random() * 380)+11), Math.floor((Math.random() * 380)+11));
    
      // the players score increases
      counter++;

      // snake speed increases
      snakeSpeed += 0.1;

      //left
      if (snakeVel.x < 0 ) {
        snakeVel.set(-snakeSpeed, 0);
      } 
      //right
      else if (snakeVel.x > 0) {
         snakeVel.set(snakeSpeed, 0);
      }
      //up
      else if (snakeVel.y < 0) {
          snakeVel.set(0, -snakeSpeed);
      }
      //down
      else if (snakeVel.y > 0) {
          snakeVel.set(0, snakeSpeed);
      }

      snake.state.vel = snakeVel;



      snake.sleep(false); 

      // and add the newApple to the viewport for the snake to chase.
      world.add(newApple);



      //make sure to see if i can't also create ("newSnakeBit") and apend to Snake...changing colors of said bit to verify...
      // function snakeGrows(){
      //     snake.Append();
      // };
      // Physics.util.extend.add(newApple);   could some manipulation of this code create a new instance of the apple?
    }

    // this else block repeats the same steps 
    else if (snake === data.collisions[0].bodyA && newApple === data.collisions[0].bodyB || newApple === data.collisions[0].bodyA && snake === data.collisions[0].bodyB) {
      world.removeBody(newApple);
      apple.state.pos.set(Math.floor((Math.random() * 380) + 11), Math.floor((Math.random() * 380) + 11));
      counter++;
      snake.state.vel = snakeVel;
      snake.sleep(false);
      //adds initial apple
      world.add(apple);
    }

    // if there are any other collisions (like snake with wall), snake dies, world rendering stops.
    else  {
      console.log("Running into Walls!! Kid Crashes!");   //why is snake dying three times and does it matter?
     
      Physics.util.ticker.stop();
    
    }

    // keeps track of player score. 
    console.log("Your score is " + (counter*7));
    $("#scorer").text("Hyperactivity Rating: " + (counter*7));
  });



// this.respond(data);



// body.before-game:after {
//     content: 'press "z" to start';
// }
// body.lose-game:after {
//     content: 'press "z" to try again';                    BEFORE & AFTER GAME!  (IN HTML)
// }
// body.win-game:after {
//     content: 'Win! press "z" to play again';
//http://modernweb.com/2013/12/02/building-a-2d-browser-game-with-physicsjs/

});
});