
var creatures;

const cw = 600;
const ch = 600;
let itemID=0;
let numCreatures = 10;
let numPlants = 100;
let day=0;

function startGame() {
    dayNumEl = document.getElementById("dayNum")
    creatures = _.range(0,numCreatures).map(()=>new Creature());
    plants = _.range(0,numPlants).map(()=> new Plant());
    console.log(creatures);
    console.log(plants);
    board.start();
}

var board = {
    updateTime: 20,
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = cw;
        this.canvas.height = ch;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        clearInterval(this.interval);
        this.interval = setInterval(updateGameArea, this.updateTime);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    pause: function() {
      clearInterval(this.interval)
    },
    resume: function() {
      this.interval = setInterval(updateGameArea, this.updateTime)
    }
}

function Creature() {
    this.id = itemID++;
    this.speed = _.random(0.1,4.);
    this.dir = _.random(0,2*Math.PI);
    this.size= _.random(5,30);
    this.age=0;
    this.maxAge = _.random(900,1100);
    this.reproductionAge = _.random(490,510);
    this.reproduced=false;
    this.lastAte = 0;
    this.maxDaysSinceEating = _.random(190,210);
    this.x =  _.random(0,cw);
    this.y =  _.random(0,ch);
    this.hue=255;
    this.newPos = function() {
        this.x += this.speed * Math.cos(this.dir);
        this.y += this.speed * Math.sin(this.dir);
        if (this.y <= 0 ) {
          this.dir = _.random(0,Math.PI);
        } else if (this.y >= ch-this.size) {
          this.dir = _.random(Math.PI,2*Math.PI);
        } else if (this.x <=0 ) {
          this.dir = _.random(-Math.PI/2, Math.PI/2);
        } else if (this.x >= cw-this.size) {
          this.dir = _.random(Math.PI/2, 3*Math.PI/2);
        }
        this.age++
    }
    this.reproduce = function() {
      const newCreature =new Creature()
      newCreature.x=this.x;
      newCreature.y=this.y;
      newCreature.speed = _.random(this.speed*0.8,this.speed*1.2);
      newCreature.size = _.random(newCreature.size*0.8,this.size*1.2);
      newCreature.dir = _.random(0,2*Math.PI);
      return newCreature;
    }
}

function Plant() {
  this.id = itemID++;
  this.x =  _.random(0,cw);
  this.y =  _.random(0,ch);
  this.size=5;
  this.hue = 125;
  this.age=0;
  this.maxAge = 10000;
  this.dead=false;
}

let dayNumEl;

function updateGameArea() {
    day++;
    dayNumEl.innerHTML = day;
    // console.log(day)
    board.clear();
    // spawn plants

    plants.map(x=>updateBoard(x));

    // move creatures
    creatures.map(function(x) {
      if (!x.dead) {
        x.newPos()
      }
    });
    creatures.map(function(x) {
      if (!x.dead) {
        updateBoard(x)
      }
    });
    // check for eating
    creatures.map(function(x) {
      if (!x.dead) {
      plants.map(function(y){
        if (!y.dead && isOverlapping(x,y)) {
          y.dead=true; // plant dead
          x.lastAte = 0; // create has eaten
        }
      })
       x.lastAte = x.lastAte + 1;
       if (x.lastAte >= x.maxDaysSinceEating) {
         x.dead=true;
         console.log(x.id+' starved to death');
       }
    }})
    // check for Creature reproduction
    let newCreatures = [];
    creatures.map(function(x) {
      if (!x.dead && x.age == x.reproductionAge && !x.reproduced) {
        console.log(x.id +' reproduced')
        newCreatures.push(x.reproduce())
      }
    })
    creatures = creatures.concat(newCreatures);
    // check for Plant reproduction
    if (day%500==0) {
      let newPlants = _.range(0,numPlants).map(()=> new Plant());
      plants = plants.concat(newPlants);
    }
}

function updateBoard(thing) {
  if (!thing.dead && thing.age == thing.maxAge) {
    thing.dead=true;
    console.log(thing.id+' died of old age')
  }
  if (!thing.dead) {
    ctx = board.context;
    const mde = thing.maxDaysSinceEating || 100;
    const la = thing.lastAte || 0;
    const ageColor = 40 + (90-40)/mde* la;
    ctx.fillStyle = 'hsl('+ thing.hue +',50%,'+ageColor+'%)';
    ctx.fillRect(thing.x, thing.y, thing.size, thing.size);
  }
}

function getEdges(thing) {
  return [thing.x,thing.x+thing.size, thing.y,thing.y+thing.size];
}

function isOverlapping(thing1,thing2) {
  var [x1a,x1b,y1a,y1b] = getEdges(thing1);
  var [x2a,x2b,y2a,y2b] = getEdges(thing2);
  let xOverlapping=false;
  let yOverlapping=false;
  if ((x1a<=x2a)&&(x1b>=x2a)) {
    xOverlapping=true;
  }
  if ((x2a<=x1a)&&(x2b>=x1a)) {
    xOverlapping=true;
  }
  if ((y1a<=y2a)&&(y1b>=y2a)) {
    yOverlapping=true;
  }
  if ((y2a<=y1a)&&(y2b>=y1a)) {
    yOverlapping=true;
  }
  return xOverlapping && yOverlapping;
}
