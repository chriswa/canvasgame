var EntityGroup = {
  collection: null,
  init: function() {
    this.collection = {};
  },
  update: function(dt) {
    _.each(this.collection, function(entity) {
      entity.update(dt);
    });
  },
  render: function() {
    _.invoke(this.collection, 'render');
  },
  each: function(iter) {
    _.each(this.collection, iter);
  },
};
