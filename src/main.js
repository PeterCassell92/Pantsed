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
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var playerDirection;
var projectiles;
var projectilecount;
var cursors;

var game = new Phaser.Game(config);

/**
 * Load up our image assets.
 */
function preload () {
    this.load.image('background', 'assets/background.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('rock', 'assets/rock.png');
    this.load.image('tiles', 'assets/tiletest3.png')
    this.load.image('asteroid', 'assets/tiles/asteroid/asteroidtiles.png' )
    this.load.tilemapTiledJSON('mymap', 'assets/maplvl1.json');
    this.load.multiatlas('spaceman', '/assets/tiles/character/spacesprite2.json', 'assets/tiles/Character');

}

function create () {

    //-- MAP LOADING --
    const map = this.make.tilemap({ key: "mymap" });

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset1 = map.addTilesetImage("tiletest3", "tiles");
    const tileset2 = map.addTilesetImage("asteroidtiles", "asteroid");
    
    
    // Parameters: layer name (or index) from Tiled, tileset, x, y
    //background layer (no collisions)
   // const bg = map.createStaticLayer("background", tileset1, 0, 0);
    //world layer  (collisions enabled)
    const layer = map.createStaticLayer("Tile Layer 1", tileset1,0,0);
    const flayer = map.createStaticLayer("Tile Layer 2", tileset2,0,0);
    layer.setCollisionBetween(0,230, true);
    flayer.setCollisionBetween(0,230, true); 


    // -- PLAYER LOADING --
    player = this.physics.add.sprite(100, 100, 'spaceman');

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

    //this.physics.add.collider(player, layer, stickToWall);
    //this.physics.add.collider(projectiles, layer, destroyRock);

    //-- INPUT CONTROLS --
    cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', attemptJumpThrow, null);
      
    //-- CAMERA SETTINGS --
    this.cameras.main.setSize(screenWidth, screenHeight);
    this.cameras.main.startFollow(player, 1, 0.04, 0.04);

    //-- LEVEL 1 SETTINGS --
    projectilecount = 5;
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

function attemptJumpThrow(context) {

    if (anyCursorHeld() && projectilecount > 0) {
        direction = playerDirection;
        projectilecount--;

        var r = projectiles.create(player.x, player.y, 'rock').setScale(0.05);

        switch (playerDirection) {
            case 'UP':
                player.setVelocityY(-300);
                player.setVelocityX(0);
                r.setVelocityY(600);
                break;
            case 'DOWN':
                player.anims.play('confused', true);
                player.setVelocityY(300);
                player.setVelocityX(0);
                r.setVelocityY(-600);
                break;
            case 'LEFT':
                player.anims.play('turnleft', true);
                player.setVelocityY(0);
                player.setVelocityX(-300);
                r.setVelocityX(600);
                break;
            case 'RIGHT':
                player.anims.play('turnright', true);
                player.setVelocityY(0);
                player.setVelocityX(300);
                r.setVelocityX(-600);
                break;
        }

        player.setData('cling', null);
    }
}

function update () {
    playerDirection = currentDirection();

    if (cursors.left.isDown && (player.getData('cling')) && player.getData('cling') != 'left')
    {
        player.setVelocityX(-300);
        player.setVelocityY(0);
        player.setData('cling', null);

    }
    else if (cursors.right.isDown &&(player.getData('cling')) && player.getData('cling') != 'right')
    {
        player.setVelocityX(300);
        player.setVelocityY(0);
        player.setData('cling', null);

    }

    if (cursors.up.isDown && (player.getData('cling')) && player.getData('cling') != 'up')
    {
        player.setVelocityY(-330);
        player.setVelocityX(0);
        player.setData('cling', null);
    }

    if (cursors.down.isDown && (player.getData('cling')) && player.getData('cling') != 'down')
    {
        player.setVelocityY(330);
        player.setVelocityX(0);
        player.setData('cling', null);
    }

}
