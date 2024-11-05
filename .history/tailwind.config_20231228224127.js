/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [],
}