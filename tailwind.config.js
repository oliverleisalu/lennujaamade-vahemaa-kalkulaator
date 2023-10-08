/** @type {import('tailwindcss').Config} */
export const content = ['./index.html', './src/**/*.{vue,js,ts}']
export const theme = {
  extend: {}
}
// eslint-disable-next-line no-undef
export const plugins = [require('@tailwindcss/forms')]
