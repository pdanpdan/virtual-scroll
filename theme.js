const theme = localStorage.getItem('vs-theme');
if (theme === 'light' || theme === 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
}
