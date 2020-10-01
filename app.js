  // BUDGET CONTROLLER
var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        } 
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
       var sum = 0;
        data.allItems[type].forEach(function(cur) {
           sum += cur.value; 
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0, 
        },
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            //ID = [1, 2, 3, 4, 5], next ID = 6;
            //But if, ID = [1, 2, 4, 6, 8], the next ID = 9, but ID.length + 1 = ID,ID = 6;
            
            // Create new ID
            if (data.allItems[type].length > 0) {
               ID = data.allItems[type][data.allItems[type].length - 1].ID + 1; 
            } else {
                ID = 0;
            }
            
            
            // Create new item based on 'inc' or 'exp'; 
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            //Push it into our datastructure;
            data.allItems[type].push(newItem);
            
            //Return the new element;
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            // id = 6
            // data.allItems[type][id];
            // ids = [1 2 4 6 8];
            // index = 3
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calculateBudget: function() {
            
            // Calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget: income - expense
            data.budget = data.totals.inc - data.totals.exp;
            
            // Calculate the percentage of income that we spend
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        
        calculatePercentages: function() {
            
            /*
            a = 20
            b = 30
            c = 50
            income = 100
            a% = 20/100 = 20%
            b% = 30/100 = 30%
            c% = 50/100 = 50%
            */
            
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };  
        },
        
        testing: function() {
            console.log(data);
        }
    };
    
})();



 // UI CONTROLLER
var UIController = (function() {
    
    var DOMStrings = {
      inputType: '.add__type',
      inputDescription: '.add__description',
      inputValue: '.add__value',
      inputBtn: '.add__btn',
      incomeContainer: '.income__list',
      expensesContainer: '.expenses__list',
      budgetLabel: '.budget__value',
      incomeLabel: '.budget__income--value',
      expensesLabel: '.budget__expenses--value',
      percentageLabel: '.budget__expenses--percentage',
      container: '.container',
      expensesPercentageLabel: '.item__percentage',
      dateLabel: '.budget__title--month'
    };
    
     var formatNumber = function(num, type) {
            var numSplit, int, dec, type;
            /*
            + or - before the number
            exactly 2 decimal points
            coma seperating the thousands
            
            */
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);// input 2314 = 2,314
                // input 23456 = 23,456
            }
            
            dec = numSplit[1];
            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
            
        };
    
    var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
    };
    
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,// Will be either inc or exp.
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, elements;
            // Create Html strings with placeHolders
            
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
            }
            // Repalce the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the Html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);   
        },
        
        deleteListItem: function(selectorID) {
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                 document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                 document.querySelector(DOMStrings.percentageLabel).textContent = '--';

            }
            
        },
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel)
            
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---'
                }
                
            });
            
        },
        
        displayMonth: function() {
            var now, months, year, month;
            
            now = new Date();
            
            months = ['January', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' + 
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },
        
        getDOMStrings: function() {
            return DOMStrings;
        }
        
    };
    
})();




// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        
        var DOM = UICtrl.getDOMStrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
        
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
        } 
    });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function() {
        
        // 1. Calculate the budget.
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget.
        var budget = budgetCtrl.getBudget();
        //console.log(budget);
        
        // 3. Display the budget in the UI.
        UICtrl.displayBudget(budget);
        
    };
    
    var updatePercentages = function() {
        
        // 1.Calculate the percentages.
        budgetCtrl.calculatePercentages();
        
        // 2. Read the percentsge from the function controller.
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percentages.
        UICtrl.displayPercentages(percentages);
        
    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        // !. Get the field input data.
        input = UICtrl.getInput();
        
        if (input.description !== '' && input.value > 0 && !isNaN(input.value)) {
            // 2. Add the item to the budget controller.
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
        // 3. Add the item to the UI.
        UICtrl.addListItem(newItem, input.type);
        
        // 4. Clear the Fields
        UICtrl.clearFields();
        
        // 5. Calculate and update budget;
        updateBudget();
        };
        
        // 6. Update the Percentages.
        updatePercentages();
        
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. Delete the item from the datastructure.
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete the item from the UI.
            UICtrl.deleteListItem(itemID);
            
            // 3. Update the budget.
            updateBudget();
            
            // 4. Update the percentages.
            updatePercentages();
            
        }
        
    };
    
    return {
        init: function() {
            console.log('Application has started!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);

controller.init();

var suck = function() {
    console.log('NIN NIN NIN NIN NIN');
};







