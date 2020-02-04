function crafting () {}

crafting.prototype.GetTable = function () {
  gathering.Find(1,'Wood');
};


module.exports = crafting;
