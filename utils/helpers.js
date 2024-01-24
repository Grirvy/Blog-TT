const handlebars = require('handlebars');

// Format a JavaScript Date object to a custom format
handlebars.registerHelper('formatDate', (date, format) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
});