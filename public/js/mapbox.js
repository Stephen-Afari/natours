export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZGVtb3JnYW5hZmFyaSIsImEiOiJjbDd0ZHF0azgwZnVjM3dxbmljNXMyMmN1In0.ZSd25nqjQw_hQOJHcHN4vQ';
  //a
  var map = new mapboxgl.Map({
    container: 'map',
    scrollZoom: false,
    //   style: 'mapbox://styles/demorganafari/cl6hgewt3000g14ql2t8ito6c',
    //   center: [-118.113491, 34.111745],
    //   zoom: 10,
    //   interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((loc) => {
    //Create marker
    const el = document.createElement('div');
    el.className = 'marker';
    //Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    //Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    //extend the map bounds to include the current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
