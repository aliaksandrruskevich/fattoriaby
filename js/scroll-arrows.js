document.addEventListener('DOMContentLoaded', () => {
  const scrollContainer = document.querySelector('.projects-scroll-container');
  const leftBtn = document.querySelector('.scroll-btn.left-btn');
  const rightBtn = document.querySelector('.scroll-btn.right-btn');

  if (!scrollContainer || !leftBtn || !rightBtn) return;

  const scrollAmount = 300;

  leftBtn.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  rightBtn.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
});
