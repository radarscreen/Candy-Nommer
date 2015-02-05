Physics(function(world){
  var viewWidth = 400;
  var viewHeight = 400;

  var snakeVel;

  var renderer = Physics.renderer('canvas', {
    el: 'viewport',
    width: viewWidth,
    height: viewHeight,
    meta: false, // don't display meta data
    debug: true,
    styles: {
        // set colors for the circle bodies
        'circle' : {
          angleIndicator: 'white'
        },
        'rectangle' : {
          fillStyle: '#333',
          angleIndicator: 'white'
        }
    }
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
    // mass: 0,    //how does the mass affect the state of the apple? apparently it chnages the way the snake interacts with the apple
    x: Math.floor((Math.random() * 380) + 6),
    y: Math.floor((Math.random() * 380) + 6),
    radius: 10,
    styles: {
      strokeStyle: '#351024',
      lineWidth: 1,
      fillStyle: 'red',
      angleIndicator: 'white',
      objectType: 'apple'
    }
  });

  world.add(apple);

  var newApple = Physics.body('circle', {
  radius: 10,
  styles: {
    fillStyle: 'green',
    angleIndicator: 'white',
    objectType: 'apple'
    }
  });
 

 //why does the radius of the apple still affect the physics engine?

  console.log(newApple);

  var snake = Physics.body('rectangle', {
    x: 200, // x-coordinate
    y: 250, // y-coordinate
    vx: 0.0,
    vy: 0.0,
    width: 10,
    height: 10,
    mass: 120000000000,
    styles: {
      fillStyle: 'black',
      angleIndicator: 'white'
    }

  });

  snake.sleep(true);

  world.add(snake);
  
  // constrain objects to these bounds
  world.add(Physics.behavior('edge-collision-detection', {
      aabb: viewportBounds,
      restitution: 0,
      cof: 1
  }));

  // ensure objects bounce when edge collision is detected
  world.add( Physics.behavior('body-impulse-response') );

  world.add(Physics.behavior('body-collision-detection'));

  world.add( Physics.behavior('sweep-prune') );


  // subscribe to ticker to advance the simulation
  Physics.util.ticker.on(function( time, dt ){
      world.step( time );
  });

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

  world.on('move', function(data, e) {
    
    var vel = snake.state.vel;
    if (data === 'left') {
      vel.set(-0.1, 0);
    } else if (data === 'right') {
      vel.set(0.1, 0);
    }
    else if (data === 'top') {
      vel.set(0, -0.1);
    }
    else {
      vel.set(0, 0.1);
    }

    snakeVel = vel;
  });

 var counter = 0;
  world.on('collisions:detected', function(data, e) {
    data.collisions[0].bodyA.sleep(true);
    data.collisions[0].bodyB.sleep(true);

   
    if (snake === data.collisions[0].bodyA && apple === data.collisions[0].bodyB || apple === data.collisions[0].bodyA && snake === data.collisions[0].bodyB) {
      console.log( "snake eats apple");
      world.removeBody(apple);
      
      newApple.state.pos.set(Math.floor((Math.random() * 380)+11), Math.floor((Math.random() * 380)+11));
    
      counter++;

      
      snake.state.vel = snakeVel;
      snake.sleep(false); 

      world.add(newApple);

      //make sure to see if i can't also create ("newSnakeBit") and apend to Snake...changing colors of said bit to verify...
      // function snakeGrows(){
      //     snake.Append();
      // };
      // Physics.util.extend.add(newApple);   could some manipulation of this code create a new instance of the apple?
    }

    else if (snake === data.collisions[0].bodyA && newApple === data.collisions[0].bodyB || newApple === data.collisions[0].bodyA && snake === data.collisions[0].bodyB) {
      console.log("snake eats NEW APPLE");
      world.removeBody(newApple);
      apple.state.pos.set(Math.floor((Math.random() * 380) + 11), Math.floor((Math.random() * 380) + 11));
      
      counter++;

      
      snake.state.vel = snakeVel;
      snake.sleep(false);
      
      world.add(apple);
    }


    // else if (snake === data.collisions[0].bodyA && snake === data.collisions[0].bodyB) {
    //   console.log( "snake eats self");

      // Physics.util.ticker.stop();

    //   disconnect: function(world){
    //         world.off( 'remove:snake');
    //         world.off( 'remove:apple');
    //         this.clear();
    //     }
    // }

    else  {
      console.log( "snake dies");
     
      Physics.util.ticker.stop();
    
    }
    console.log("Your score is " + (counter*7));
  });



// this.respond(data);


// compound body
// var chainSim = function(world){
//     // create chains...  
// }; 
// http://wellcaffeinated.net/PhysicsJS/basic-usage


// composite bodies still need to be built in. There's no easy way to do this, but you can create a custom body that creates other bodies (eg, custom body that extends a square, that creates two circles). Just add a "connect" and "disconnect" method to the custom body so you can add and remove the extra circle bodies when it's added to a world.

// Then you can use verlet constraints to attach them together.

// As for the appearance, you'd need to find a way to draw that yourself with canvas. If you wanted to have the physics of a curved polygon, you'd have to write that yourself. So it's probably easier to just skin it with an image. To do that just set "body.view = myImage"

// This is a bit outdated, but has some examples: http://flippinawesome.org/2013/12/02/building-a-2d-browser-game-with-physicsjs/
// http://stackoverflow.com/questions/23668005/agregate-bodies-in-physicsjs

// body.before-game:after {
//     content: 'press "z" to start';
// }
// body.lose-game:after {
//     content: 'press "z" to try again';                    BEFORE AFTER GAME!  (IN HTML)
// }
// body.win-game:after {
//     content: 'Win! press "z" to play again';
//http://modernweb.com/2013/12/02/building-a-2d-browser-game-with-physicsjs/

});