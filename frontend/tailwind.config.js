export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#eef9f4',100:'#d6f0e5',200:'#a8dfc9',300:'#6dc8a7',400:'#38ac85',500:'#1d9e75',600:'#0f6e56',700:'#085041',800:'#04342c',900:'#02201b' },
        surface: { DEFAULT:'#ffffff', secondary:'#f8fafb', tertiary:'#f1f5f4' },
      },
      fontFamily: { sans:['Inter','system-ui','sans-serif'], display:['Plus Jakarta Sans','sans-serif'] },
      boxShadow: { card:'0 1px 3px 0 rgb(0 0 0/0.06)', 'card-hover':'0 4px 12px 0 rgb(0 0 0/0.10)', glow:'0 0 24px 0 rgb(29 158 117/0.18)' },
      animation: { 'fade-in':'fadeIn 0.4s ease-out', 'slide-up':'slideUp 0.4s ease-out' },
      keyframes: {
        fadeIn:  {'0%':{opacity:'0'},'100%':{opacity:'1'}},
        slideUp: {'0%':{opacity:'0',transform:'translateY(16px)'},'100%':{opacity:'1',transform:'translateY(0)'}},
      },
    },
  },
  plugins: [],
}
