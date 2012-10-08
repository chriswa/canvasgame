var SpriteGroup = {
  collection: null,
  init: function() {
    this.collection = {};
  },
  update: function(dt) {
    _.each(this.collection, function(spr) {
      spr.update(dt);
    });
  },
  render: function() {
    _.invoke(this.collection, 'render');
  },
  each: function(iter) {
    _.each(this.collection, iter);
  },
  invoke: function(methodName) {
    _.invoke(this.collection, methodName);
  },
};
