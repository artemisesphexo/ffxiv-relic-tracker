/** @type {import('tailwindcss').Config} */
module.exports = {
  // Every file that uses Tailwind classes. Add new trackers here automatically
  // by keeping them in <tracker>/index.html and <tracker>/src/*.js.
  content: ["./index.html", "./*/index.html", "./*/src/*.js"],
  theme: {
    extend: {},
  },
  plugins: [],
};
