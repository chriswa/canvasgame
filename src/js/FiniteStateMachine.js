var FiniteStateMachine = {
  
  activeState: null,
  
  queuedState: undefined,
  queueState: function(newState) {
    this.queuedState = Array.prototype.slice.call(arguments, 0);
  },
  updateState: function() {
    if (this.queuedState) {
      this.setState.apply(this, this.queuedState);
      this.queuedState = undefined;
    }
  },
  setState: function(newState) {
    if (this.activeState && this.activeState.onleavestate) { this.activeState.onleavestate(newState); }
    this.activeState = newState;
    if (!newState) { console.trace(); }
    if (this.activeState.onenterstate) { this.activeState.onenterstate.apply(this.activeState, Array.prototype.slice.call(arguments, 1)); }
  }
  
};
