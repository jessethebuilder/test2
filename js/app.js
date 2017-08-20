//--- Angular View Rendering ----------------------------------------------------------------

var app = angular.module('accounts', []);

app.controller('accountsController', function($scope){
  $scope.accounts = [
    // Test data
    {owner: 'Jon', balance: 100, type: 'savings'},
    {owner: 'Jess', balance: 1040, type: 'checking', overdraw: 10},
    {owner: 'Jam', balance: 1010, type: 'savings'},
    {owner: 'Joon', balance: 10, type: 'checking', overdraw: 10},
    {owner: 'Jasp', balance: 15500, type: 'checking', overdraw: 1},
    {owner: 'Jeck', balance: 1002, type: 'savings'},
    {owner: 'Christine Appleton III', balance: 1020.32, type: 'checking', overdraw: 104},
  ];

  $scope.add = function(account){
    var act = new Account(account);
    var amount = act.add(account.change_amount);

    if(typeof amount === 'number'){
      account.balance = amount;
    } else {
      alert(amount);
    }

    account.change_amount = '';
  }

  $scope.subtract = function(account){
    var act = new Account(account);
    var amount = act.subtract(account.change_amount);
    var ret;

    if(typeof amount === 'number'){
      account.balance = amount;
      ret = true;
    } else {
      alert(amount);
      ret = false;
    }

    account.change_amount = '';

    return ret;
  }

  $scope.transfer = function(account){
    var transferee;

    $.each($scope.accounts, function(i, a){
      // Find the proper Transferee object
      if(a.$$hashKey == account.transferee){
        transferee = a;
      }
    });

    if(transferee){
      transferee.change_amount = account.change_amount;
      if($scope.subtract(account)){
        // There are no validations in Add that are not in Subtract
        $scope.add(transferee);
      }
    } else {
      alert('You must select a Transferee')
    }

    transferee.change_amount = '';
  }
});

//--- Account Objects --------------------------------------------------------------------

function SavingsAccount(props){
  this.props = props;
}

function CheckingAccount(props){
  this.props = props;
}

function Account(props){
  // Call new Account, no a new type. Shared methods are also housed in this class
  if(props.type === 'savings'){
    return new SavingsAccount(props);
  } else {
    return new CheckingAccount(props);
  }

}

Account.prototype.validatePositiveNumber = function(val){
  if(typeof val != 'number' || val <= 0){
    return false;
  } else {
    return true;
  }
}

Account.prototype.subtract = function(amt){
  if(!this.validatePositiveNumber(amt)){
    return 'Amount must be a positive number';
  } else if(!this.fundsAvailable(amt, this.props.overdraw)){
    return 'The Funds are not available for this transaction';
  } else {
    return this.props.balance - amt;
  }
}

Account.prototype.add = function(amt){
  // Same for both types of accounts
  if(this.validatePositiveNumber(amt)){
    return this.props.balance += amt;
  } else {
    return "Amount must be a positive number";
  }
}

Account.prototype.fundsAvailable = function(amt, overdraw){
  if(typeof overdraw === 'undefined'){ overdraw = 0; }

  var amount = this.props.balance - (amt + overdraw);

  return amount >= 0 ? true : false;
}

SavingsAccount.prototype = Object.create(Account.prototype);
CheckingAccount.prototype = Object.create(Account.prototype);
