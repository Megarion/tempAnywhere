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

    // https://login.meteomatics.com/api/v1/token
    // https://meteomatics.com/url-creator/
    useEffect(() => {
        axios.get(`https://login.meteomatics.com/api/v1/token`, {
            headers: {'Authorization': 'Basic ' + btoa(username + ":" + password)}
        }).then(response => {
            console.log("SUCCESS", response.data.access_token);
            token = response.data.access_token
            axios.get(`https://api.meteomatics.com/2023-05-20T21:50:00.000+07:00/t_2m:C/${coords.lat},${coords.lng}/json?model=mix&access_token=${token}`, {
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

function LocationMarker() {
    const [lines, setLines] = useState<number[]>([]);
    const [coords, setCoords] = useState<LatLng[]>([]); 
    const [show, setShow] = useState<boolean[]>([]);
    const map = useMapEvents({
        click(e) {
            const pos = e.latlng;
            map.flyTo(pos, map.getZoom());
            setLines([...lines, lines.length]);
            setCoords([...coords, pos]);
            setShow([...show, true]);
        },
    });

    const renderElement = <div>{lines.map(m => show[m]? <TempMark key={m} remove={()=>{handleRemove(m)}} count={m} coords={coords[m]}></TempMark> : null)}</div>;

    function handleRemove(key:number) {
        let newShow = show.slice();
        newShow[key]=false;
        setShow(newShow);
    }

    return renderElement;
}

function Map() {
    return <>
    <div id='center'>
        <MapContainer center={[51.505, -0.09]} zoom={2} scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' 
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <LocationMarker/>
        </MapContainer>
    </div>
    </>;
}

export default Map