workbox.routing.registerRoute(
    new RegExp('.*\.js'),
    new workbox.strategies.NetworkFirst()
  );
  
  workbox.routing.registerRoute(
    new RegExp('.*\.css'),
    new workbox.strategies.NetworkFirst()
  );
  
  // Cache the API request for weather data
  workbox.routing.registerRoute(
    new RegExp('https://api.openweathermap.org/data/2.5/weather.*'),
    new workbox.strategies.StaleWhileRevalidate()
  );