'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2024-01-22T17:01:17.194Z',
    '2024-01-23T23:36:17.929Z',
    '2024-01-24T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const startLogOutTimer = function () {
  // tick will be a separate function because we want to call it before calling it from setInterval method in order to skip the interwal metod delay
  const tick = function () {
    // set time to 5 mins
    let mins = Math.trunc(time / 60)
      .toString()
      .padStart(2, 0);
    let secs = (time % 60).toString().padStart(2, 0);

    // assign time to timer label
    labelTimer.textContent = `${mins}:${secs}`;

    // if time is 0:00 = log out user
    if (time === 0) {
      clearInterval(startLogOutTimer);
      // Display UI and message
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // decrease 1 sec
    time--;
  };

  let time = 300;
  // call timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

const daysPassed = function (date1, date2) {
  return Math.round(Math.abs((date1 - date2) / 1000 / 60 / 60 / 24));
};

const formatCur = function (number, locale, cur) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: `${cur}`,
  }).format(number);
};

const formatMovmentDate = function (date, locale) {
  if (new Date().getDate() === date.getDate()) return 'today';
  if (new Date().getDate() - 1 === date.getDate()) return 'yesterday';
  if (daysPassed(new Date(), date) <= 5)
    return `${daysPassed(new Date(), date)} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movements = acc.movements;
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    // if ( daysPassed(new Date(), date)<1)

    const dateStr = formatMovmentDate(date, acc.locale);

    const formatedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${dateStr}</div>
        <div class="movements__value">${formatedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0).toFixed(2);
  const formatedBalance = formatCur(acc.balance, acc.locale, acc.currency);
  labelBalance.textContent = formatedBalance;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  const formatedIncomes = formatCur(incomes, acc.locale, acc.currency);
  labelSumIn.textContent = formatedIncomes;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  const formatedOut = formatCur(out, acc.locale, acc.currency);
  labelSumOut.textContent = formatedOut;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  const formatedInterest = formatCur(interest, acc.locale, acc.currency);
  labelSumInterest.textContent = formatedInterest;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// /// WIP fake always logged in
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

// LOGIN
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Current date
    const now = new Date();
    const options = {
      day: 'numeric',
      month: '2-digit',
      year: 'numeric',
      minute: 'numeric',
      hour: 'numeric',
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      `${currentAccount.locale}`,
      options
    ).format(now);
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hours = `${now.getHours()}`.padStart(2, 0);
    // const mins = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hours}:${mins}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

// TRANSFER
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
  clearInterval(timer);
  timer = startLogOutTimer();
});

// LOAN
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(() => {
      // Add movement
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      console.log(currentAccount);
      // Update UI
      updateUI(currentAccount);
    }, 3000);
  }
  inputLoanAmount.value = '';
  clearInterval(timer);
  timer = startLogOutTimer();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// false in JS due to how JS represents floating point numbers internally, its uning binary floating point
console.log(0.1 + 0.2 === 0.3);

//
console.log(Number('23'));
console.log(+'23');

//Parsing
console.log(Number.parseInt('253uom')); // 253
console.log(Number.parseInt('2.53uom')); // 2
console.log(Number.parseFloat('2.53uom')); // 253

// check if value is NaN
console.log(Number.isNaN('2.53uom')); // false
console.log(Number.isNaN(+'2.53uom')); // true

// check if value is a Number
console.log(Number.isFinite(20)); // true - best way to check if a value is a number

// if the number is integer
console.log(Number.isInteger(3.33));

// Math class

// sq root
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2)); // sq root
console.log(125 ** (1 / 3)); // cube root

// max min value
console.log(Math.max(12, 55, 2, 567, 22));
console.log(Math.min(12, 55, 2, 567, 22));

// random () - 0-1 random value
console.log(Math.random());

const randomInt = (min, max) =>
  Math.trunc(Math.random() * (max - min + 1) + min);
console.log(randomInt(100, 200));

// rounding integers
console.log(Math.trunc(2.3)); // removes desimals
console.log(Math.round(2.3)); // rounds to nearest int
console.log(Math.ceil(2.3)); // rounds up
console.log(Math.floor(2.3)); // rounds down

// rounding decimals
console.log((2.653).toFixed(0));
console.log((2.653).toFixed(1));
console.log((2.653).toFixed(2));
console.log((2.653).toFixed(3));

// changing the color of every second row in the movements section
labelBalance.addEventListener('click', function (e) {
  e.preventDefault();
  const allRows = [...document.querySelectorAll('.movements__row')];
  console.log(allRows);
  allRows.forEach((cur, i) => {
    if (i % 2 === 0) {
      cur.style.backgroundColor = 'rgba(50, 170, 168, 0.1)';
    }
  });
});

// biggest number JS can store

console.log(2 ** 53 - 1); // 53 == number of bits
console.log(Number.MAX_SAFE_INTEGER);

console.log(32985923853948503487); // not a safe number
console.log(32985923853948503487n); // bigInt type - allowes to store numbers > Max_safe_number

// // Date time
// // create using constructor
// const now = new Date();
// console.log(now);

// // parce from string
// console.log(new Date('2/11/2020'));

// // month is zero based
// console.log(new Date(2020, 1, 1));

// // miliceconds after initial unix time
// console.log(new Date(0));
// console.log(new Date(366 * 24 * 60 * 60 * 1000));

// console.log(now.getFullYear());
// console.log(now.getMonth());
// console.log(now.getDate());
// console.log(now.getDay());
// console.log(now.getHours());
// console.log(now.getMinutes());
// console.log(now.getSeconds());
// console.log(now.toISOString());
// console.log(now.toDateString());
// console.log(now.getTime());

// console.log(new Date().getMonth());

const now1 = new Date();
console.log(+now1);
const future = new Date(2040, 1, 1);
console.log(Math.trunc((future - now1) / 1000 / 60 / 60 / 24 / 365));

console.log(daysPassed(future, now1));

// will pull iso code from the browser
console.log(navigator.language);

const number = 2353254.23;
console.log(Intl.NumberFormat(navigator.language).format(number));
const options = {
  style: 'unit',
  unit: 'mile-per-hour',
};
console.log(Intl.NumberFormat(navigator.language, options).format(number));

//TIMERS

const waitTimer = setTimeout(
  time => console.log(`${time} has passed`),
  5000,
  '5 seconds'
);
console.log('time has not passed yet');
clearTimeout(waitTimer);

// const dateTimer = setInterval(function () {
//   const date = new Date();
//   const hours = date.getHours();
//   const mins = date.getMinutes();
//   const seconds = date.getSeconds();
//   console.log(`${hours}:${mins}:${seconds}`);
// }, 1000);
