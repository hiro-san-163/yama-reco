document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.home-record-image img').forEach((image) => {
    const updateImageRatio = () => {
      const imageFrame = image.closest('.home-record-image');
      if (!imageFrame || !image.naturalWidth || !image.naturalHeight) return;

      imageFrame.classList.toggle('is-square', image.naturalWidth <= image.naturalHeight);
    };

    image.addEventListener('load', updateImageRatio);
    if (image.complete) updateImageRatio();
  });
});
