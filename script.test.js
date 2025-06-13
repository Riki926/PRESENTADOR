const presenter = require('./script');

document.body.innerHTML = `
  <input id="fileInput" />
  <div id="slideViewer">initial</div>
  <button id="btnAnterior"></button>
  <button id="btnSiguiente"></button>
  <button id="btnInicio"></button>
  <button id="btnIr"></button>
  <button id="btnRedireccionar"></button>
`;

presenter.setSlides(['a', 'b']);
presenter.setCurrentSlide(1);

presenter.resetSlides();

test('resetSlides clears state and viewer', () => {
  expect(presenter.getSlides()).toEqual([]);
  expect(presenter.getCurrentSlide()).toBe(0);
  expect(document.getElementById('slideViewer').innerHTML).toBe('');
});

