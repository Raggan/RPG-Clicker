var game = new Phaser.Game(800, 600, Phaser.AUTO, '');

game.state.add('play', {
    preload: function() {
      this.game.load.image('aerocephal', 'assets/allacrost_enemy_sprites/aerocephal.png');
  		this.game.load.image('arcana_drake', 'assets/allacrost_enemy_sprites/arcana_drake.png');
  		this.game.load.image('aurum-drakueli', 'assets/allacrost_enemy_sprites/aurum-drakueli.png');
  		this.game.load.image('bat', 'assets/allacrost_enemy_sprites/bat.png');
  		this.game.load.image('daemarbora', 'assets/allacrost_enemy_sprites/daemarbora.png');
  		this.game.load.image('deceleon', 'assets/allacrost_enemy_sprites/deceleon.png');
  		this.game.load.image('demonic_essence', 'assets/allacrost_enemy_sprites/demonic_essence.png');
  		this.game.load.image('dune_crawler', 'assets/allacrost_enemy_sprites/dune_crawler.png');
  		this.game.load.image('green_slime', 'assets/allacrost_enemy_sprites/green_slime.png');
  		this.game.load.image('nagaruda', 'assets/allacrost_enemy_sprites/nagaruda.png');
  		this.game.load.image('rat', 'assets/allacrost_enemy_sprites/rat.png');
  		this.game.load.image('scorpion', 'assets/allacrost_enemy_sprites/scorpion.png');
  		this.game.load.image('skeleton', 'assets/allacrost_enemy_sprites/skeleton.png');
  		this.game.load.image('snake', 'assets/allacrost_enemy_sprites/snake.png');
  		this.game.load.image('spider', 'assets/allacrost_enemy_sprites/spider.png');
  		this.game.load.image('stygian_lizard', 'assets/allacrost_enemy_sprites/stygian_lizard.png');

      this.game.load.image('gold_coin', 'assets/496_RPG_icons/I_GoldCoin.png');
  		this.game.load.image('forest', 'assets/Background/Forrest.png');
  	},
    create: function() {

		var state = this;

		var bg = state.game.add.tileSprite(0, 0, state.game.world.width,
		    state.game.world.height, 'forest');
		//bg.tileScale.setTo(4,4);


    this.dmgTextPool = this.add.group();
    var dmgText;
    for (var d=0; d<50; d++) {
        dmgText = this.add.text(0, 0, '1', {
            font: '64px Arial Black',
            fill: '#fff',
            strokeThickness: 4
        });
        // start out not existing, so we don't draw it yet
        dmgText.exists = false;
        dmgText.tween = game.add.tween(dmgText)
            .to({
                alpha: 0,
                y: 100,
                x: this.game.rnd.integerInRange(100, 700)
            }, 2000, Phaser.Easing.Cubic.Out);

        dmgText.tween.onComplete.add(function(text, tween) {
            text.kill();
        });
        this.dmgTextPool.add(dmgText);
    }

    // create a pool of gold coins
    this.coins = this.add.group();
    this.coins.createMultiple(50, 'gold_coin', '', false);
    this.coins.setAll('inputEnabled', true);
    this.coins.setAll('goldValue', 1);
    this.coins.callAll('events.onInputDown.add', 'events.onInputDown', this.onClickCoin, this);

    var monsterData = [
        {name: 'Aerocephal',        image: 'aerocephal',        maxHealth: 10},
        {name: 'Arcana Drake',      image: 'arcana_drake',      maxHealth: 20},
        {name: 'Aurum Drakueli',    image: 'aurum-drakueli',    maxHealth: 30},
        {name: 'Bat',               image: 'bat',               maxHealth: 5},
        {name: 'Daemarbora',        image: 'daemarbora',        maxHealth: 10},
        {name: 'Deceleon',          image: 'deceleon',          maxHealth: 10},
        {name: 'Demonic Essence',   image: 'demonic_essence',   maxHealth: 15},
        {name: 'Dune Crawler',      image: 'dune_crawler',      maxHealth: 8},
        {name: 'Green Slime',       image: 'green_slime',       maxHealth: 3},
        {name: 'Nagaruda',          image: 'nagaruda',          maxHealth: 13},
        {name: 'Rat',               image: 'rat',               maxHealth: 2},
        {name: 'Scorpion',          image: 'scorpion',          maxHealth: 2},
        {name: 'Skeleton',          image: 'skeleton',          maxHealth: 6},
        {name: 'Snake',             image: 'snake',             maxHealth: 4},
        {name: 'Spider',            image: 'spider',            maxHealth: 4},
        {name: 'Stygian Lizard',    image: 'stygian_lizard',    maxHealth: 20}
    ];

    // the main player
    this.player = {
        clickDmg: 1,
        gold: 0
    };


    this.playerGoldText = this.add.text(30, 30, 'Gold: ' + this.player.gold, {
        font: '24px Arial Black',
        fill: '#fff',
        strokeThickness: 4
    });
		this.monsters = this.game.add.group();

		var monster;
		monsterData.forEach(function(data) {
			// create a sprite for them off screen
			monster = state.monsters.create(2000, state.game.world.centerY, data.image);
			// center anchor
			monster.anchor.setTo(0.5);
			// reference to the database
			monster.details = data;

      // use the built in health component
      monster.health = monster.maxHealth = data.maxHealth;

      // hook into health and lifecycle events
      monster.events.onKilled.add(state.onKilledMonster, state);
      monster.events.onRevived.add(state.onRevivedMonster, state);

			//enable input so we can click it!
			monster.inputEnabled = true;
			monster.events.onInputDown.add(state.onClickMonster, state);
		});


		this.currentMonster = this.monsters.getRandom();
		this.currentMonster.position.set(this.game.world.centerX, this.game.world.centerY);

    this.monsterInfoUI = this.game.add.group();
    this.monsterInfoUI.position.setTo(this.game.world.centerX - 150, this.game.world.centerY + 150);
    this.monsterNameText = this.monsterInfoUI.addChild(this.game.add.text(0, 0, this.currentMonster.details.name, {
        font: '48px Arial Black',
        fill: '#fff',
        strokeThickness: 4
    }));
    this.monsterHealthText = this.monsterInfoUI.addChild(this.game.add.text(0, 60, this.currentMonster.health + ' HP', {
        font: '32px Arial Black',
        fill: '#ff0000',
        strokeThickness: 4
    }));
	},
    render: function() {
        },



	onClickMonster: function(monster,pointer) {
    // apply click damage to monster
    this.currentMonster.damage(this.player.clickDmg);
    this.monsterHealthText.text = this.currentMonster.alive ? this.currentMonster.health + ' HP' : 'DEAD';

    var dmgText = this.dmgTextPool.getFirstExists(false);
      if (dmgText) {
        dmgText.text = this.player.clickDmg;
        dmgText.reset(pointer.positionDown.x, pointer.positionDown.y);
        dmgText.alpha = 1;
        dmgText.tween.start();
      }
	},

  onKilledMonster: function(monster) {
    // move the monster off screen again
    monster.position.set(2000, this.game.world.centerY);

    // pick a new monster
    this.currentMonster = this.monsters.getRandom();
    // make sure they are fully healed
    this.currentMonster.revive(this.currentMonster.maxHealth);

    var coin;
    // spawn a coin on the ground
    coin = this.coins.getFirstExists(false);
    coin.reset(this.game.world.centerX + this.game.rnd.integerInRange(-100, 100), this.game.world.centerY);
    coin.goldValue = 1;
    this.game.time.events.add(Phaser.Timer.SECOND * 3, this.onClickCoin, this, coin);
    if (!coin.alive) {
    return;
}

  },



  onRevivedMonster: function(monster) {
    monster.position.set(this.game.world.centerX, this.game.world.centerY);
    // update the text display
    this.monsterNameText.text = monster.details.name;
    this.monsterHealthText.text = monster.health + 'HP';
  },


  onClickCoin: function(coin) {
      // give the player gold
      this.player.gold += coin.goldValue;
      // update UI
      this.playerGoldText.text = 'Gold: ' + this.player.gold;
      // remove the coin
      coin.kill();
  }
});

game.state.start('play');
