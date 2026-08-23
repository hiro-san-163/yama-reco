document.addEventListener('DOMContentLoaded', () => {

  const returnButton = document.getElementById('recordsReturnButton');

  if (!returnButton) return;

  returnButton.addEventListener('click', (event) => {
    event.preventDefault();

        window.location.href = '/yama-reco/records/';
    }
  });

});
