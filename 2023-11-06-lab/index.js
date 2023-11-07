const email = 'tj@dsedu';
const phone = '(978)-569-4644';
const url = 'google.com';

// Regex
const phoneNumberRegex = /^(\(\d{3}\) \d{3} \d{4}|\(\d{3}\)-\d{3}-\d{4}|\d{3}-\d{3}-\d{4}|\d{10}|\d{3} \d{3} \d{4})$/;







const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const urlRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+(\.[a-zA-Z]{2,6})(\/[\w.-]*)*$/;

const isValidEmail = (email) => {
  return emailRegex.test(email);
};

console.log(email+" " + isValidEmail(email));

const isValidPhoneNumber = (phoneNumber) => {
    return phoneNumberRegex.test(phoneNumber);};

console.log(phone+" " + isValidPhoneNumber(phone));

const isValidURL = (url) => {
  return urlRegex.test(url);
};

console.log(url+" " + isValidURL(url));

function validateForm() {
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const url = document.getElementById('url').value;

  // Validate email
  if (!isValidEmail(email)) {
    alert('Invalid email address');
    return false;
  }

  // Validate phone number
  if (!isValidPhoneNumber(phone)) {
    alert('Invalid phone number');
    return false;
  }

  // Validate URL
  if (!isValidURL(url)) {
    alert('Invalid URL');
    return false;
  }

  return true; // Form submission will proceed if all fields are valid
}
