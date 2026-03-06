if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(
      function(registration) {
        console.log('Nexus ServiceWorker: Enregistré avec succès !');
      },
      function(err) {
        console.log('Nexus ServiceWorker: Échec de l\\\'enregistrement.', err);
      }
    );
  });
}
