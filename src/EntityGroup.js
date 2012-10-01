var EntityGroup = {
  collection: null,
  init: function() {
    this.collection = {};
  },
  update: function() {
    _.invoke(this.collection, 'update');
  },
  render: function(stepInterpolation) {
    _.each(this.collection, function(entity) {
      entity.render(stepInterpolation);
    });
  },
  each: function(iter) {
    _.each(this.collection, iter);
  },
};
