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
  render: function(context) {
    this.invoke('render', context);
  },
  update: function(dt) {
    _.each(this.collection, function(spr) {
      spr.update(dt);
    });
  },
};
