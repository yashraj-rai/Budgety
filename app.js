var dataController = (function () {

  var Expenses = function(Id, description, value) {
    this.Id = Id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

Expenses.prototype.calcPercent = function (totalInc) {
  if (totalInc > 0) {
    this.percentage = Math.round((this.value / totalInc) * 100);
  } else {
    this.percentage = -1;
  }
};

Expenses.prototype.getPercent = function () {
  return this.percentage;
};

  var Incomes = function(Id, description, value) {
    this.Id = Id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum=0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems : {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val){
      var ID, newItem;

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].Id + 1;
      } else {
        ID = 0;
      }

      if (type === 'exp') {
        newItem = new Expenses(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Incomes(ID, des, val);
      }

      data.allItems[type].push(newItem);

      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;

      ids = data.allItems[type].map(function(current){
        return current.Id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      //Calculate total expenses and income
      calculateTotal('inc');
      calculateTotal('exp');

      //Calculate Budget
      data.budget = data.totals.inc - data.totals.exp;

      //Calculate Percentage
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    calculatePercent: function() {
      data.allItems.exp.forEach(function(cur){
        cur.calcPercent(data.totals.inc);
      });
    },

    getPercenta: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercent();
      });
      return allPerc;
    },

    testing: function () {
      console.log(data);
    }
  }
}) ();


var UIController = (function () {

  var DOMstring = {
    inputType: '.add__type',
    inputDesc: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetTitle: '.budget__value',
    incomeTitle: '.budget__income--value',
    expensesTitle: '.budget__expenses--value',
    percentage: '.budget__expenses--percentage',
    container: '.container',
    itemPercent: '.item__percentage',
    dateTitle: '.budget__title--month'
  };

  var formatNumber = function(num, type) {
    var numarr, int, dec;
    num = Math.abs(num);  //absolute value
    num = num.toFixed(2); //decimal point

    numarr = num.split('.');
    int = numarr[0];

    if (int.length > 3) {
      int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3, 3);
     }
    dec = numarr[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var percentForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i],i);
    }
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstring.inputType).value,
        description: document.querySelector(DOMstring.inputDesc).value,
        value: parseFloat(document.querySelector(DOMstring.inputValue).value)
      };
    },
    addListItem: function(obj, type) {
      var html, newHtml, element;
      //create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMstring.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if (type === 'exp') {
        element = DOMstring.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }

      //replace the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.Id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      //insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

    },

    deleteListItem: function (selectorId) {
      var el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldsArr;
      fields = document.querySelectorAll(DOMstring.inputDesc + ',' + DOMstring.inputValue);

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      var type;

      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstring.budgetTitle).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstring.incomeTitle).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstring.expensesTitle).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstring.percentage).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstring.percentage).textContent = '---';
      }
    },

    displayPercent:function(percent) {

      var fields = document.querySelectorAll(DOMstring.itemPercent);

      percentForEach(fields, function(current, index) {
        if (percent[index] > 0) {
          current.textContent = percent[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    displayDate: function() {
      var date, months, month, year;
      date = new Date();

      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = date.getMonth();
      year = date.getFullYear();

      document.querySelector(DOMstring.dateTitle).textContent = months[month] + ' ' + year;
    },

    changedType: function() {
      var fields = document.querySelectorAll(
        DOMstring.inputType + ',' +
        DOMstring.inputDesc + ',' +
        DOMstring.inputValue
      );

      percentForEach(fields, function(cur){
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstring.inputBtn).classList.toggle('red');
    },

    getDOMstrings: function () {
      return DOMstring;
    }
  };

}) ();


var controller = (function (UICntrl, dataCntrl) {

  var setupEventListeners = function() {

    var DOM = UICntrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', addBtnCntrl);

    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        addBtnCntrl();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', delBtnCntrl);

    document.querySelector(DOM.inputType).addEventListener('change', UICntrl.changedType);
  };

  var updateBudget = function() {
    //Calculate the budget
    dataCntrl.calculateBudget();
    //Return the budget
    var budget = dataCntrl.getBudget();
    //Display the budget in UI
    UICntrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    //Calculate percentage
    dataCntrl.calculatePercent();

    //get percentage
    var percentage = dataCntrl.getPercenta();

    //update UI
    UICntrl.displayPercent(percentage);

  };

  var addBtnCntrl = function () {
    var input, newItem;

    //1. Get the field input data
    input = UICntrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

    //Add the item to the budget controller
    newItem = dataCntrl.addItem(input.type, input.description, input.value);

    //Add the item to the UI
    UICntrl.addListItem(newItem, input.type);

    //Clear the fields
    UICntrl.clearFields();

    //Calculate and update budget
    updateBudget();

    //Calculate and update percentage
    updatePercentages();
  }
};

var delBtnCntrl = function(event) {
  var itemId, splitId, type, Id, data;

  itemId = event.target.parentNode.parentNode.parentNode.id;

  if (itemId) {
    splitId = itemId.split('-');
    type = splitId[0];
    //console.log(type);
    Id = parseInt(splitId[1]);
    //console.log(Id);
  }

  //Delete the item from the data structure
  dataCntrl.deleteItem(type, Id);

  //Delete the item from the UI
  UICntrl.deleteListItem(itemId);

  //update budget
  updateBudget();

  //Calculate and update percentage
  updatePercentages();
};

  return {
    init: function(){
      console.log('Application has started.');
      UICntrl.displayDate();
      UICntrl.displayBudget({budget: 0,
      totalInc: 0,
      totalExp: 0,
      percentage: -1});
      setupEventListeners();
    }
  };

}) (UIController, dataController);

controller.init();
