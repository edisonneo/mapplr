import React from 'react'
import ReactDOM from 'react-dom'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

class Application extends React.Component {

  constructor(props: Props) {
    super(props);
    this.state = {
      steps: [],
      map: {},
      lng: 103.8522,
      lat: 1.2962 , 
      zoom: 16,
      locations:[
        {
          name:"Bencoolen MRT",
          id: 'bencoolen',
          type: 'landmark',
          lng: 103.850520,
          lat: 1.299069,
          coordinates: [
              103.850520,
              1.299069
          ],
          properties: {
              textSize: 'txt-s',
              iconSize: 'wmax36',
              iconLink: "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-256.png",
              bgColor: 'bg-white',
              textColor: 'color-black',
              opacity: 'opacity50'
          }
        },
        {
          name: "Bras Basah MRT",
          id: 'brasBasah',
          type: 'landmark',
          lng: 103.850791,
          lat: 1.296970,
          coordinates: [
              103.850791,
              1.296970
          ],
          properties: {
              textSize: 'txt-s',
              iconSize: 'wmax36',
              iconLink: "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-256.png",
              bgColor: 'bg-white',
              textColor: 'color-black',
              opacity: 'opacity50'
          }
        },
        {
          name: "YMCA Bus Stop",
          id: 'ymca',
          type: 'landmark',
          lng: 103.847830,
          lat: 1.298076,
          coordinates: [
              103.847830,
              1.298076
          ],
          properties: {
              textSize: 'txt-s',
              iconSize: 'wmax36',
              iconLink: "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-256.png",
              bgColor: 'bg-white',
              textColor: 'color-black',
              opacity: 'opacity50'
          }
        },
        {
          name: "National Museum of Singapore",
          id: 'nms',
          type: 'target',
          lng: 103.848509,
          lat: 1.296646,
          coordinates: [
              103.848509,
              1.296646
          ],
          properties: {
              textSize: 'txt-m',
              iconSize: 'wmax60',
              iconLink: "https://cdn2.iconfinder.com/data/icons/flat-style-svg-icons-part-1/512/location_marker_pin-256.png",
              bgColor: 'bg-black',
              textColor: 'color-white',
              opacity: 'opacity100'
          }
        }
      ]
    };
  }

  componentDidMount() {
    const { lng, lat, zoom } = this.state;

    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/dark-v9',
      center: [lng, lat],
      zoom
    });

    this.setState({map:map}) 

    map.on('move', () => {
      const { lng, lat } = map.getCenter();

      this.setState({
        lng: lng.toFixed(4),
        lat: lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      });
    });

    // add markers to map
    this.state.locations.forEach(location => {
        
        
        // create DOM elements for the marker
        var el = document.createElement('div');
        var title = document.createElement('h1');
        var icon = document.createElement('img');
        
        // create icon
        icon.className = "flex-child mx-auto mb12 " + location.properties.iconSize 
        icon.src = location.properties.iconLink
        
        // create title 
        title.innerHTML = location.name
        title.className = "txt-bold py12 px12 txt-nowrap align-center flex-child round " + location.properties.textSize + " " + location.properties.bgColor + " " + location.properties.textColor
        
        // create the parent div and attach icon and title
        el.className = "marker flex-parent flex-parent--column flex-parent--center-main cursor-pointer opacity100-on-hover transition " + location.properties.opacity;
        el.dataset.id = location.id;
        if(location.type === 'landmark'){ el.classList.add('marker--landmark')}
        el.appendChild(icon);
        el.appendChild(title);

        // Add Event Click Listener
        el.addEventListener('click', (e) => {
            
            let landmarks = document.querySelectorAll(".marker--landmark");
            let locationID = e.currentTarget.dataset.id

            // Adjust opacity for active markers
            landmarks.forEach(landmark => landmark.classList.remove('opacity100') )
            e.currentTarget.classList.add('opacity100')

            // Fetch the directions
            this._getDirections(locationID)
        });

        // add marker to map
        new mapboxgl.Marker(el)
            .setLngLat(location.coordinates)
            .addTo(map);
    });     
  }

  _getDirections(locationID){

    let location = this.state.locations.find(location => location.id === locationID);
    let target  = this.state.locations.find(location => location.type === 'target')

    // Only for landmark locations
    if(location.type === 'target'){
      return false;
    }

    // Check if geoJSON layer exists on map and remove if it exists 
    if(this.state.map.getSource('route')){
      this.state.map.removeLayer('route')
      this.state.map.removeSource('route')
    }

    // Call Mapbox API
    fetch('https://api.mapbox.com/directions/v5/mapbox/walking/'+ location.lng +','+ location.lat +';'+ target.lng +','+ target.lat +'.json?access_token=pk.eyJ1IjoiZWRpbmVvNjIiLCJhIjoiY2plc25heHdpNDBwaTJ3bWVnaXN2dGhkaiJ9.Huknv81PJ2WLJo2CKD_eUA&steps=true&overview=simplified&geometries=geojson')
      .then(response => response.json().then(data=> {

              // Add geoJSON layer to the map 
              this.state.map.addLayer({
                "id": "route",
                "type": "line",
                "source": {
                    "type": "geojson",
                    "data": {
                        "type": "Feature",
                        "properties": {},
                        "geometry": data.routes[0].geometry
                    }
                },
                "layout": {
                    "line-join": "round",
                    "line-cap": "round"
                },
                "paint": {
                    "line-color": "#f00",
                    "line-width": 8
                }
            })

            // Show directions header
            let directionsHeader = document.querySelectorAll('.directions__header');
            directionsHeader[0].innerHTML = location.name + " --- " + target.name
            directionsHeader[0].classList.remove('none')
            directionsHeader[0].classList.add('block')
            
            // Collate steps instructions and distance information 
            let stepsData = data.routes[0].legs[0].steps
            let steps = stepsData.map(step=> { 
              let instruction = step.maneuver.instruction
              let distance = Math.ceil(step.distance)

              return {instruction, distance}
            })
            
            this.setState({steps: steps})


        }
    ))

  }

  render() {

    return (
      <div>
        <div className="directions py24 px24 absolute top left z5 hmax600 scroll-auto">
          <div>
            <h4 className="directions__header py12 px12 mb12 round bg-white txt-bold txt-s none">Directions</h4>
          </div>
          <ul className="directions__list">
            {this.state.steps.map(function(step){
              if(step.distance > 0){
                return <li className="directions__list-item round py6 px12 bg-darken75 color-white txt-xs mb6">{step.instruction} ({step.distance}m)</li>;
              }
              else{
                return <li className="directions__list-item round py6 px12 bg-darken75 color-white txt-xs mb6">{step.instruction}</li>;                
              }              
            })}
          </ul>
        </div>
        <div ref={el => this.mapContainer = el} className="absolute top right left bottom" />
      </div>
    );
  }
}

ReactDOM.render(<Application />, document.getElementById('app'));
