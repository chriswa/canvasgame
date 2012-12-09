var SpriteGroup = {
  collection: null,
  init: function() {
    this.collection = {};
  },
  each: function(iter, context) {
    _.each(this.collection, iter, context);
  },
  invoke: function(methodName, context) {
    _.invoke(this.collection, methodName, context);
  },
  render: function(renderOffsetX, renderOffsetY) {
    this.each(function(spr) {
      spr.render(renderOffsetX, renderOffsetY);
    });
  },
  update: function(dt) {
    _.each(this.collection, function(spr) {
      spr.update(dt);
    });
  },
  cull: function() {
    _.invoke(_.filter(this.collection, function(spr) { return !spr.alive; }), '_destroy');
  },
  count: function() {
    return _.keys(this.collection).length;
  }
};
