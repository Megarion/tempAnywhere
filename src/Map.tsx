import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { useState, useEffect} from 'react'
import axios from 'axios'
import { useMap } from 'react-leaflet';
import Locate from "leaflet.locatecontrol";

// @ts-ignore
function TempMark(props) {
    const {coords,remove} = props;

    // .env later
    const username=import.meta.env.VITE_USERNAME;
    const password=import.meta.env.VITE_PASSWORD;

    let [temp, setTemp] = useState(null);

    let time = new Date();
    let year = time.getUTCFullYear();
    let month = time.getUTCMonth()+1;
    let day = time.getUTCDate();
    let hour = time.getUTCHours();

    // https://login.meteomatics.com/api/v1/token
    // https://meteomatics.com/url-creator/
    useEffect(() => {
        let token = "";
        axios.get(`https://login.meteomatics.com/api/v1/token`, {
            headers: {
                'Authorization': 'Basic ' + btoa(username + ":" + password), 
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(response => {
            token = response.data.access_token
            axios.get(`https://api.meteomatics.com/${year}-${month.toString().length == 1? "0" : ""}${month}-${day.toString().length == 1? "0" : ""}${day}T${hour.toString().length == 1? "0" : ""}${hour}:00:00.000Z/t_2m:C/${coords.lat},${coords.lng}/json?model=mix&access_token=${token}`, {
                headers: {}
            }).then(dataresponse => {
                // console.log("SUCCESS", dataresponse);
                setTemp(dataresponse.data.data[0].coordinates[0].dates[0].value);
    
            }).catch(error => {
                console.log(error);
            });
    
        }).catch(error => {
            console.log(error);
        });

        // axios.get(`https://${username}:${password}@api.meteomatics.com/${year}-${month.toString().length == 1? "0" : ""}${month}-${day.toString().length == 1? "0" : ""}${day}T${hour.toString().length == 1? "0" : ""}${hour}:00:00.000Z/t_2m:C/${coords.lat},${coords.lng}/json?model=mix`, {
        //     headers: {}
        // }).then(dataresponse => {
        //     // console.log("SUCCESS", dataresponse);
        //     setTemp(dataresponse.data.data[0].coordinates[0].dates[0].value);

        // }).catch(error => {
        //     console.log(error);
        // });
    }, []);

    return <Marker position={coords}
    eventHandlers={{
        mouseover: (event) => event.target.openPopup(),
        mouseout: (event) => event.target.closePopup(),
        mousedown: () => remove()
    }}
    >
        <Popup>
            {`${temp}\u00B0C`}
        </Popup>
    </Marker>;
    // (${coords.lat}, ${coords.lng})
}

function LocationSetter() {
    const [displayed, setDisplay] = useState(false);
    if (!displayed) {
        const map = useMap();
        // @ts-ignore
        const lc = new Locate({flyTo: true});
        lc.addTo(map);
        setDisplay(true);
    }
    return null;
}

// @ts-ignore
function LocationMarker(props) {
    const { remove, show, isShown, coords, lines } = props
    const mapEvents = useMapEvents({
        click(e) {
            const pos = e.latlng;
            mapEvents.flyTo(pos, mapEvents.getZoom());
            show(pos);
        },
    });

    // @ts-ignore
    const renderElement = <div>{lines.map(m => isShown[m]? <TempMark key={m} remove={()=>{remove(m)}} count={m} coords={coords[m]}></TempMark> : null)}</div>;

    return renderElement;
}

// @ts-ignore
function Map(props) {
    const {remove, show, isShown, coords, setCoords, lines, setLines} = props;
    return <>
    <MapContainer center={[51.505, -0.09]} zoom={2} scrollWheelZoom={true}>
        <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' 
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <LocationMarker remove={remove} show={show} isShown={isShown} coords={coords} setCoords={setCoords} lines={lines} setLines={setLines}/>
        <LocationSetter/>
    </MapContainer>
    </>;
}

export default Map