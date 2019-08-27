//set up UI first
class sceneUI extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'UIScene', active: true });

        this.score = 0;
    }

    create ()
    {
        //  Our Text objects to display
        projectileText = this.add.text(16, 16, projectilename + ' : 0', { fontSize: '32px', fill: '#ffffff' });

        timeText = this.add.text(400, 16, 'Time : 0', { fontSize: '32px', fill: '#ffffff' });
        console.log(this.time)
    }

    update(){
        timeText.setText('Time : ' + ((this.time.now)/1000).toFixed(0));
    }
}

class sceneLevelOne extends Phaser.Scene {

    constructor ()
    {
        super('GameScene');
    }

/**
 * Load up our image assets.
 */
    preload () {
        this.load.image('momentiteone', 'assets/tiles/props/momentiteonepile.png');
        this.load.image('momentitetwo', 'assets/tiles/props/momentitetwopile.png');
        this.load.image('momentitethree', 'assets/tiles/props/momentitethreepile.png');
        this.load.image('teleporter', 'assets/tiles/props/teleporter.png');
        this.load.image('mininglaser', 'assets/tiles/interactables/yellowlaserextension.png');
        this.load.image('rock', 'assets/rock.png');
        this.load.image('tiles', 'assets/tiletest3.png');
        this.load.image('asteroid', 'assets/tiles/asteroid/asteroidtiles.png' );
        this.load.image('all_lasers', 'assets/tiles/interactables/newlasers.png' );
        this.load.tilemapTiledJSON('mymap', 'assets/maplvl1.json');
        this.load.multiatlas('spaceman', '/assets/tiles/character/spacesprite2.json', 'assets/tiles/character');
        this.load.image('momentitepile', 'assets/tiles/props/momentitetiles.png');
    }

    create () {

        //-- MAP LOADING --
        const map = this.make.tilemap({ key: "mymap" });

        // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
        // Phaser's cache (i.e. the name you used in preload)
        const tileset1 = map.addTilesetImage("tiletest3", "tiles");
        const tileset2 = map.addTilesetImage("asteroidtiles", "asteroid");
        const yellow_laser_tiles = map.addTilesetImage("newlasers", "all_lasers");
        const momentite_tiles = map.addTilesetImage('freshprops', 'momentitepile');
        
        // Parameters: layer name (or index) from Tiled, tileset, x, y
        const layer = map.createStaticLayer("Tile Layer 1", tileset1,0,0);
        const flayer = map.createStaticLayer("Tile Layer 2", tileset2,0,0);
        
        
        //enable collisions on all tiles in below layers
        layer.setCollisionBetween(tileset1.firstgid, tileset1.firstgid+tileset1.total -1);
        flayer.setCollisionBetween(tileset2.firstgid, tileset2.firstgid +tileset2.total -1);

        //make sprites from Tiled map. (Possibly a hacky method)
        var yellowlasers = map.createStaticLayer("Yellow Laser", yellow_laser_tiles,0,0);
        yellowlaser1 = this.physics.add.group();
        yellowlaser1.addMultiple(map.createFromTiles(arrayFromRange(yellow_laser_tiles.firstgid+3, yellow_laser_tiles.firstgid+6), null, {key: 'mininglaser'},this,this.cameras.main,yellowlasers));
        var teleporter = this.physics.add.group();
        teleporter.addMultiple(map.createFromTiles(yellow_laser_tiles.firstgid+13, null, {key: 'teleporter'}, this, this.cameras.main, proplayer));
        yellowlasers.destroy();

        var yellowlasers2 = map.createStaticLayer("Yellow Laser 2", yellow_laser_tiles,0,0);
        yellowlaser2 = this.physics.add.group();
        yellowlaser2.addMultiple(map.createFromTiles(arrayFromRange(yellow_laser_tiles.firstgid+3, yellow_laser_tiles.firstgid+6), null, {key: 'mininglaser'},this,this.cameras.main,yellowlasers2));
        yellowlasers2.destroy();

        var proplayer = map.createStaticLayer("Props", momentite_tiles, 0 ,0);
        var momentiteone = this.physics.add.group();
        momentiteone.addMultiple(map.createFromTiles(momentite_tiles.firstgid, null, {key: 'momentiteone'}, this, this.cameras.main, proplayer));
        var momentitetwo = this.physics.add.group();
        momentitetwo.addMultiple(map.createFromTiles(momentite_tiles.firstgid+1, null, {key: 'momentitetwo'}, this, this.cameras.main, proplayer));
        var momentitethree = this.physics.add.group();
        momentitethree.addMultiple(map.createFromTiles(momentite_tiles.firstgid+2, null, {key: 'momentitethree'}, this, this.cameras.main, proplayer));
        proplayer.destroy();


        // -- group identical sprites into arrays --
        allyellowlasers = [yellowlaser1, yellowlaser2];
        

        // -- PLAYER LOADING --
        player = this.physics.add.sprite(200, 200, 'spaceman');

        //player anims
        var confusedframes = this.anims.generateFrameNames('spaceman', {
            start: 1, end: 4, zeroPad: 3,
            prefix: 'astropantsed', suffix: '.png'
        });
        this.anims.create({ key: 'confused', frames: confusedframes, frameRate: 4, repeat: -1 });

        var rightframes = this.anims.generateFrameNames('spaceman', {
            start: 1, end: 4, zeroPad: 3,
            prefix: 'astroturnright', suffix: '.png'
        });
        this.anims.create({ key: 'turnright', frames: rightframes, frameRate: 4, repeat: 0 });

        var leftframes = this.anims.generateFrameNames('spaceman', {
            start: 1, end: 4, zeroPad: 3,
            prefix: 'astroturnleft', suffix: '.png'
        });
        this.anims.create({ key: 'turnleft', frames: leftframes, frameRate: 4, repeat: 0 });

        //start player
        player.anims.play('confused', true);            

        player.setCollideWorldBounds(false);
        player.setActive(true);
        player.setBounce(0);
        player.setData('cling', 'INITIAL',);
        playerDirection = 'UP';


        //-- PHYSICS RULES --
        projectiles = this.physics.add.group();
        this.physics.add.collider(player, layer, clingToWorld, null, this);
        this.physics.add.collider(player, flayer, clingToWorld, null, this);
        //can we do this with the allyellowlasers array?
        this.physics.add.overlap(player, yellowlaser1, yellowEffects, null, this);
        this.physics.add.overlap(player, yellowlaser2, yellowEffects, null, this);
        this.physics.add.overlap(player, momentiteone, hitOneGeode, null, this)
        this.physics.add.overlap(player, momentitetwo, hitTwoGeode, null, this)
        this.physics.add.overlap(player, momentitethree, hitThreeGeode, null, this)

        //-- INPUT CONTROLS --
        cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-SPACE', attemptJumpThrow, null);
        
        //-- CAMERA SETTINGS --
        this.cameras.main.setSize(screenWidth, screenHeight);
        this.cameras.main.startFollow(player, 1, 0.04, 0.04);

        //-- LEVEL 1 SETTINGS --
        setProjectileCount(5);
        laserspeed1 = 300;
        gamebounds = [96, 7584];
        playerspeed = 500;
        yellowlaser1.setVelocityX(-laserspeed1);
        yellowlaser2.setVelocityX(laserspeed1);
        
    }

    update () {
            playerDirection = currentDirection();
        
            if (cursors.left.isDown && (player.getData('cling')) && player.getData('cling') != 'left')
            {
                player.setVelocityX(-playerspeed);
                player.setVelocityY(0);
                player.setData('cling', null);
        
            }
            else if (cursors.right.isDown &&(player.getData('cling')) && player.getData('cling') != 'right')
            {
                player.setVelocityX(playerspeed);
                player.setVelocityY(0);
                player.setData('cling', null);
        
            }
        
            if (cursors.up.isDown && (player.getData('cling')) && player.getData('cling') != 'up')
            {
                player.setVelocityY(-playerspeed);
                player.setVelocityX(0);
                player.setData('cling', null);
            }
        
            if (cursors.down.isDown && (player.getData('cling')) && player.getData('cling') != 'down')
            {
                player.setVelocityY(playerspeed);
                player.setVelocityX(0);
                player.setData('cling', null);
            }
            allyellowlasers.forEach(a => reverseSpritesAtBoundaries(a, gamebounds, 1.1));        
    }
}

//game initialisation
const screenWidth = 800;
const screenHeight = 600;

const config = {
    type: Phaser.AUTO,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: 'rgb(20,20,20)',
    parent: 'container',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [sceneLevelOne, sceneUI]
};

//global variable declarations

var player;
var playerDirection;
var projectiles;
var projectilecount;
var projectileText;
var cursors;
var timeText;
var playerspeed;
var gamebounds;
var allyellowlasers;
var yellowlaser1;
var yellowlaser2;
var projectilename = 'Momentite';
var laserspeed1;

var game = new Phaser.Game(config);


//FUNCTIONS (COULD BE SEPERATE FILE & GROUPED)

function setProjectileCount(newnum){
    projectilecount = newnum
    projectileText.setText(projectilename + " : " + projectilecount);
}

function adjustProjectileCount(adjustment){
    projectilecount+= adjustment;
    projectileText.setText(projectilename +  " : " + projectilecount);
}

function clingToWorld(){
    //blocked applies to Tile objects whilst touching applies to sprites.
    console.log(player.body.blocked);
    if (player.body.blocked.down){
        player.setData('cling', 'down');
    }
    if (player.body.blocked.left){
        player.setData('cling','left');
    }
    if (player.body.blocked.up){
        player.setData('cling', 'up');
    }
    if (player.body.blocked.right){
        player.setData('cling', 'right');
    }
}

//yellow lasers disintegrate all of your minerals.
function yellowEffects(){
    console.log("hit YELLOW laser");
    setProjectileCount(0);
    this.cameras.main.flash(1, 255,255,0);
}

function destroyProjectile(projectile, wall) {
    projectile.destroy();
}

function currentDirection() {
    if (cursors.up.isDown) return 'UP';
    if (cursors.down.isDown) return 'DOWN';
    if (cursors.left.isDown) return 'LEFT';
    if (cursors.right.isDown) return 'RIGHT';
    return playerDirection;
}

function anyCursorHeld() {
    return cursors.up.isDown || cursors.down.isDown || cursors.left.isDown || cursors.right.isDown;
}


function reverseSpritesAtBoundaries(spritegroup, levelbounds, factor){
    if (spritegroup.getFirstAlive().x < levelbounds[0]){
        spritegroup.setVelocityX(laserspeed1*factor);
    }
    else if (spritegroup.getFirstAlive().x > levelbounds[1]){
        spritegroup.setVelocityX(-laserspeed1*factor);
    }
}
function attemptJumpThrow(context) {

    if (anyCursorHeld() && projectilecount > 0) {
        direction = playerDirection;
        adjustProjectileCount(-1);

        var r = projectiles.create(player.x, player.y, 'rock').setScale(0.05);

        switch (playerDirection) {
            case 'UP':
                player.setVelocityY(-playerspeed);
                player.setVelocityX(0);
                r.setVelocityY(600);
                break;
            case 'DOWN':
                player.anims.play('confused', true);
                player.setVelocityY(playerspeed);
                player.setVelocityX(0);
                r.setVelocityY(-600);
                break;
            case 'LEFT':
                player.anims.play('turnleft', true);
                player.setVelocityY(0);
                player.setVelocityX(-playerspeed);
                r.setVelocityX(600);
                break;
            case 'RIGHT':
                player.anims.play('turnright', true);
                player.setVelocityY(0);
                player.setVelocityX(playerspeed);
                r.setVelocityX(-600);
                break;
        }

        player.setData('cling', null);
    }
}

function arrayFromRange(start, end){
    var myarray = []
    for (var x = start; x <= end; x++){
        myarray.push(x);
    }
    return myarray;
}

function hitOneGeode(myplayer, mygeode){
    adjustProjectileCount(1);
    mygeode.destroy();
}

function hitTwoGeode(myplayer, mygeode){
    adjustProjectileCount(2);
    mygeode.destroy();
}

function hitThreeGeode(myplayer, mygeode){
    adjustProjectileCount(3);
    mygeode.destroy();
}