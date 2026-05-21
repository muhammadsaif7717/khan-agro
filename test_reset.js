const income = [{amount: 100}];
const expense = [{amount: 40}];
let returnedCash = [];

function getGrandTotal(list) { return list.reduce((s, i) => s + i.amount, 0); }

const totalIncome = getGrandTotal(income);
const totalExpense = getGrandTotal(expense);
const profit = totalIncome - totalExpense;

let totalReturnedCash = getGrandTotal(returnedCash);
let returnedCashVal = (totalIncome - profit) - totalReturnedCash;

console.log("Before reset:", returnedCashVal);

// Reset
returnedCash.push({amount: returnedCashVal});
totalReturnedCash = getGrandTotal(returnedCash);
returnedCashVal = (totalIncome - profit) - totalReturnedCash;

console.log("After reset:", returnedCashVal);
