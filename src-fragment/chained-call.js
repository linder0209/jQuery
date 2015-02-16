function ChainedCall() {
}

ChainedCall.prototype = {
  init: function () {
    /* code */
    console.info('init');
    return this;
  },
  name: function () {
    /* code */
    console.info('name');
    return this;
  }
};

new ChainedCall().init().name();