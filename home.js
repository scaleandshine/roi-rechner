// Buchungsformular: kein eigenes Backend, leitet mit vorausgefüllten Daten zu Calendly weiter.
const CALENDLY_URL = 'https://calendly.com/funnelguru/kostenloses-vorgesprach';

const form = document.getElementById('booking-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('bf-name').value.trim();
  const email = document.getElementById('bf-email').value.trim();
  const url = new URL(CALENDLY_URL);
  if (name) url.searchParams.set('name', name);
  if (email) url.searchParams.set('email', email);
  window.location.href = url.toString();
});
