class behaviour {
  constructor(name,module_ref,attention) {
    this.name = name;
    this.module = module_ref;
    this.attention = attention;
  }
  disable() {
    this.attention = 0;
  }
  increase() {
    this.attention++;
  }
  decrease() {
    this.attention--;
  }
}

module.exports = behaviour;
