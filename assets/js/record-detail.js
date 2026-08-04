document.addEventListener('DOMContentLoaded', () => {

  const returnButton = document.getElementById('recordsReturnButton');

  if (!returnButton) return;

  const returnUrl = sessionStorage.getItem('recordsReturnUrl');

  if (returnUrl) {
    returnButton.href = returnUrl;
  } else {
    returnButton.href = '/yama-reco/records/';
  }

});
