// canvas
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// map
var Map = {
    TILE_SIZE: 32,
    data: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
           [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
           [1, 0, 0, 1, 0, 1, 0, 0, 0, 1],
           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
           [1, 0, 0, 0, 1, 1, 0, 1, 0, 1],
           [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],
    getTile: function(tileX, tileY) {
        if (tileY < 0 || tileY >= this.data.length || tileX < 0 || tileX >= this.data[tileY].length) { return -1; } // out of bounds
        return this.data[tileY][tileX];
    },
    render: function() {
        var x, y;
        ctx.fillStyle = '#000';
        for (y = 0; y < this.data.length; y++) {
            for (x = 0; x < this.data[y].length; x++) {
                if (this.getTile(x, y)) {
                    ctx.fillRect(this.TILE_SIZE * x, this.TILE_SIZE * y, this.TILE_SIZE, this.TILE_SIZE);
                }
            }
        }
    }
};

// sprites
var Sprite = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    hitbox: { x1: 0, y1: 0, x2: 20, y2: 20 },
    translateWithTileCollisions: function( dx, dy ) {
        var result;
        
        // reset all "touching" feedback booleans
        this.touchingBottom = false;
        this.touchingTop    = false;
        this.touchingLeft   = false;
        this.touchingRight  = false;
        
        // translate along x-axis
        result = this.translateWithTileCollisionsAlongAxis(dx, this.x, this.hitbox.x1, this.hitbox.x2, this.y, this.hitbox.y1, this.hitbox.y2, function(x, y) { return Map.getTile(x, y); });
        this.x = result.newPos;
        if (result.hit === -1) { this.touchingLeft   = true; }
        if (result.hit ===  1) { this.touchingRight  = true; }
        
        // translate along y-axis
        result = this.translateWithTileCollisionsAlongAxis(dy, this.y, this.hitbox.y1, this.hitbox.y2, this.x, this.hitbox.x1, this.hitbox.x2, function(y, x) { return Map.getTile(x, y); });
        this.y = result.newPos;
        if (result.hit === -1) { this.touchingTop    = true; }
        if (result.hit ===  1) { this.touchingBottom = true; }
      
    },
    
    // this function 
    translateWithTileCollisionsAlongAxis: function(deltaPos, u, u1, u2, v, v1, v2, tileGetter) {
        var tileSize = Map.TILE_SIZE;
        var deltaPosRemaining = deltaPos;
        var deltaPosSign      = deltaPos > 0 ? 1 : -1;
        while (deltaPosRemaining !== 0) {
            if (Math.abs(deltaPosRemaining) > tileSize) {
                u += tileSize * deltaPosSign;
                deltaPosRemaining -= tileSize * deltaPosSign;
            }
            else {
                u += deltaPosRemaining;
                deltaPosRemaining = 0;
            }
            
            var tileV1 = Math.floor(  (v + v1) / tileSize);
            var tileV2 = Math.ceil(   (v + v2) / tileSize) - 1;
            var tileU;
            if (deltaPos < 0) {
                tileU = Math.floor( (u + u1) / tileSize);
            }
            else {
                tileU = Math.ceil(  (u + u2) / tileSize) - 1;
            }
            for (var tileV = tileV1; tileV <= tileV2; tileV++) {
              
                var physicsTile = tileGetter(tileU, tileV);
                
                if (physicsTile > 0) {
                    if (deltaPos < 0) {
                        return { hit: -1, newPos: (tileU + 1) * tileSize - u1 };
                    }
                    else {
                        return { hit: 1, newPos: (tileU) * tileSize - u2 };
                    }
                }
            }
        }
        return { hit: 0, newPos: u };
    },
    render: function() {
        ctx.strokeStyle = '#f00';
        ctx.strokeRect(this.x + this.hitbox.x1, this.y + this.hitbox.y1, this.hitbox.x2 - this.hitbox.x1, this.hitbox.y2 - this.hitbox.y1);
    },
    update: function() {
        this.translateWithTileCollisions(this.vx, this.vy, Map.getTile);
        if (this.touchingTop || this.touchingBottom) { this.vy = -this.vy }
        if (this.touchingLeft || this.touchingRight) { this.vx = -this.vx }
        this.vy += 0.1;
    }
};

// main
{
    // create sprites
    var sprites = [];
    for (var i = 0; i < 30; i++) {
        var spr = Object.create(Sprite);
        spr.x = Math.random() * canvas.width;
        spr.y = Math.random() * canvas.height;
        spr.vx = (Math.random() - 0.5) * 10;
        spr.vy = (Math.random() - 0.5) * 10;
        sprites.push(spr);
    }    
    
    // loop forever, updating and rendering
    var mainLoop = function() {
        var key;
        ctx.fillStyle = '#ff0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (key in sprites) { sprites[key].update(); }
        Map.render();
        for (key in sprites) { sprites[key].render(); }
    }
    setInterval(mainLoop, 1000 / 30);
}
?