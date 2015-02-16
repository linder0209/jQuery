//构造函数
var Person = function (name, age) {
  this.name = name;
  this.age = age;
};

//原型
Person.prototype = {
  getName: function () {
    return this.name;
  },
  getAge: function () {
    return this.age;
  }
};

var man = new Person('Linder', 30);
man.getName();// Linder





var Person = function (name, age) {
  return new Person.prototype.init(name, age);
};

Person.hobby = '睡觉';

Person.prototype = {
  init: function (name, age) {
    this.name = name;
    this.age = age;
    return this;
  },
  age: 20,
  getName: function () {
    return this.name;
  },
  getAge: function () {
    return this.age;
  }
};

Person('Linder', 30).age;//30
Person('Linder', 30).hobby;//睡觉
Person('Linder', 30).getName();//TypeError: Person(...).getName is not a function













var Person = function (name, age) {
  return new Person.prototype.init(name, age);
};

Person.hobby = '睡觉';

Person.prototype = {
  init: function (name, age) {
    this.name = name;
    this.age = age;
    return this;
  },
  age: 20,
  getName: function () {
    return this.name;
  },
  getAge: function () {
    return this.age;
  }
};

//Person 的原型覆盖了init构造器的原型，所以init中的this指向的是Person.prototype
Person.prototype.init.prototype = Person.prototype;

Person('Linder', 30).age;//30
Person('Linder', 30).hobby;//undefined
Person('Linder', 30).getName();// Linder
