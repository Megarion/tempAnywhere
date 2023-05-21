import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { useState, useEffect, } from 'react'
import { LatLng } from 'leaflet';
import axios from 'axios'

// @ts-ignore
function TempMark(props) {
    const {coords,remove} = props;

    // .env later
    const username=import.meta.env.VITE_USERNAME;
    const password=import.meta.env.VITE_PASSWORD;

    let token = "";

    let [temp, setTemp] = useState(null);

    let time = new Date();
    let year = time.getUTCFullYear();
    let month = time.getUTCMonth()+1;
    let day = time.getUTCDate();
    let hour = time.getUTCHours();

    // https://login.meteomatics.com/api/v1/token
    // https://meteomatics.com/url-creator/
    useEffect(() => {
        axios.get(`https://login.meteomatics.com/api/v1/token`, {
            headers: {'Authorization': 'Basic ' + btoa(username + ":" + password)}
        }).then(response => {
            token = response.data.access_token
            axios.get(`https://api.meteomatics.com/${year}-${month.toString().length == 1? "0" : ""}${month}-${day.toString().length == 1? "0" : ""}${day}T${hour.toString().length == 1? "0" : ""}${hour}:00:00.000Z/t_2m:C/${coords.lat},${coords.lng}/json?model=mix&access_token=${token}`, {
                headers: {}
            }).then(dataresponse => {
                console.log("SUCCESS", dataresponse);
                setTemp(dataresponse.data.data[0].coordinates[0].dates[0].value);
    
            }).catch(error => {
                console.log(error);
            });
    
        }).catch(error => {
            console.log(error);
        });
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

// @ts-ignore
function LocationMarker(props) {
    const { remove, show, isShown } = props
    const [lines, setLines] = useState<number[]>([]);
    const [coords, setCoords] = useState<LatLng[]>([]); 
    const map = useMapEvents({
        click(e) {
            const pos = e.latlng;
            map.flyTo(pos, map.getZoom());
            setLines([...lines, lines.length]);
            setCoords([...coords, pos]);
            show();
        },
    });

    const renderElement = <div>{lines.map(m => isShown[m]? <TempMark key={m} remove={()=>{remove(m)}} count={m} coords={coords[m]}></TempMark> : null)}</div>;

    return renderElement;
}

// @ts-ignore
function Map(props) {
    const {remove, show, isShown} = props;
    return <>
    <MapContainer center={[51.505, -0.09]} zoom={2} scrollWheelZoom={true}>
        <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' 
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <LocationMarker remove={remove} show={show} isShown={isShown}/>
    </MapContainer>
    </>;
}

export default Map