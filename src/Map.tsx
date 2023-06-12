import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useMap } from 'react-leaflet';
import Locate from "leaflet.locatecontrol";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

// @ts-ignore
function TempMark(props) {
    const {coords,remove,info} = props;

    const KEY=import.meta.env.VITE_KEY;

    let [loc, setLoc] = useState<string|null>(null);
    let [datasave, setDatasave] = useState(null);

    // let time = new Date();
    // let year = time.getUTCFullYear();
    // let month = time.getUTCMonth()+1; // +1 because it's 1 off
    // let day = time.getUTCDate();

    // // https://www.weatherapi.com/docs/
    // /* 
    // Get data from past 2 days
    // http://api.weatherapi.com/v1/history.json?key=${KEY}&q=${coords.lat},${coords.lng}&dt=${year}-${month.toString().length == 1? "0" : ""}${month}-${day.toString().length == 1? "0" : ""}${day-1}&end_dt=${year}-${month.toString().length == 1? "0" : ""}${month}-${day.toString().length == 1? "0" : ""
    // */
    useEffect(() => {
        axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${KEY}&q=${coords.lat},${coords.lng}&days=7`, {headers: {}}).then(dataresponse => {
            setDatasave(dataresponse.data);
            setLoc(`${dataresponse.data.location.name}, ${dataresponse.data.location.country}`);
        }).catch(error => {
            console.log(error);
        });
    }, []);

    return <Marker position={coords}
    eventHandlers={{
        mouseover: (event) => event.target.openPopup(),
        mouseout: (event) => event.target.closePopup(),
        mousedown: (event)=>{
            if (event.originalEvent.button==0){info(datasave)}
            if (event.originalEvent.button==2){event.originalEvent.preventDefault(); remove();}
        }
    }}
    >
        <Popup>
            {loc}<br/><i>Click to see more details</i>
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
    const { remove, show, isShown, coords, lines, info } = props
    const mapEvents = useMapEvents({
        click(e) {
            const pos = e.latlng;
            mapEvents.flyTo(pos, mapEvents.getZoom());
            show(pos);
        },
    });

    // @ts-ignore
    const renderElement = <div>{lines.map(m => isShown[m]? <TempMark key={m} remove={()=>{remove(m)}} count={m} coords={coords[m]} info={info}></TempMark> : null)}</div>;

    return renderElement;
}

// @ts-ignore
function Map(props) {
    const {remove, show, isShown, coords, setCoords, lines, setLines} = props;
    const [popup, showPopup] = useState(false);
    const [mode, setMode] = useState<number>(0);
    const [display, setDisplay] = useState<any[]|null>(null);
    const [location, setLocation] = useState("")

    function showInfo(data:any) {
        const forecast = data.forecast.forecastday

        // Set info
        let fa = [];
        for (const fc of forecast) {
            const wday = fc.day;
            const hours = fc.hour; // 0 to 23
            const date = fc.date;

            let day = [{
                temp_c: wday.avgtemp_c,
                temp_f: wday.avgtemp_f,
                condition_text: wday.condition.text,
                condition_icon: wday.condition.icon,
                date: date
            }]
            
            // @ts-ignore
            day = day.concat(hours.map(h => {return {
                temp_c: h.temp_c,
                temp_f: h.temp_f,
                condition_text: h.condition.text,
                condition_icon: h.condition.icon,
                date: date
            }}));
            
            fa.push(day);
        }

        setDisplay(fa);
        setLocation(`${data.location.name}, ${data.location.country}`)

        // show popup
        showPopup(true);
        modifyMode(0);
    }

    function hideInfo() {
        showPopup(false);
    }

    useEffect(() => {
        // define a custom handler function
        // for the contextmenu event
        // @ts-ignore
        const handleContextMenu = (e) => {
            // prevent the right-click menu from appearing
            e.preventDefault()
        }

        // attach the event listener to 
        // the document object
        document.addEventListener("contextmenu", handleContextMenu)

        // clean up the event listener when 
        // the component unmounts
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu)
        }
    }, []);

    function mode2text(mode:number) {
        return mode==0? "Entire day" : `${(mode-1)%12+1}${mode>11 && mode<24? "PM" : "AM"}`
    }

    function modifyMode(inc:1|0|-1) {
        let newMode = mode;
        newMode+=inc;
        if (newMode<0) {
            newMode=24;
        }
        if (newMode>24) {
            newMode=0;
        }
        setMode(newMode);
    }

    return <>
    <div className='popup' style={{display: popup? "flex" : "none", overflowY: "auto"}}>
    <div className='centerText nosel' style={{height: "100vh"}}>
        <h1>{location}</h1>
        <div style={{fontSize: "25px", display: "flex"}} className='center'>
            <FontAwesomeIcon icon={faChevronLeft} className='arrow' onClick={()=>{modifyMode(-1)}} />
            <div style={{width: "200px"}}>{mode2text(mode)}</div>
            <FontAwesomeIcon icon={faChevronRight} className='arrow' onClick={()=>{modifyMode(1)}} />
        </div>
        <br/>
        <div style={{width: "100vw"}}>
            {
                display == null? null :
                <>
                    <div className='box centerText'>
                        <b>{display[0][mode].date}</b><br/>
                        {display[0][mode].temp_c}&#176;C/{display[0][mode].temp_f}&#176;F<br/> 
                        <br/><img src={display[0][mode].condition_icon}/><br/>
                        {display[0][mode].condition_text}
                    </div>
                    <div className='box centerText'>
                        <b>{display[1][mode].date}</b><br/>
                        {display[1][mode].temp_c}&#176;C/{display[1][mode].temp_f}&#176;F<br/> 
                        <br/><img src={display[1][mode].condition_icon}/><br/>
                        {display[1][mode].condition_text}
                    </div>
                    <div className='box centerText'>
                        <b>{display[2][mode].date}</b><br/>
                        {display[2][mode].temp_c}&#176;C/{display[2][mode].temp_f}&#176;F<br/> 
                        <br/><img src={display[2][mode].condition_icon}/><br/>
                        {display[2][mode].condition_text}
                    </div>
                    <div className='box centerText'>
                        <b>{display[3][mode].date}</b><br/>
                        {display[3][mode].temp_c}&#176;C/{display[3][mode].temp_f}&#176;F<br/> 
                        <br/><img src={display[3][mode].condition_icon}/><br/>
                        {display[3][mode].condition_text}
                    </div>
                    <div className='box centerText'>
                        <b>{display[4][mode].date}</b><br/>
                        {display[4][mode].temp_c}&#176;C/{display[4][mode].temp_f}&#176;F<br/> 
                        <br/><img src={display[4][mode].condition_icon}/><br/>
                        {display[4][mode].condition_text}
                    </div>
                    <div className='box centerText'>
                        <b>{display[5][mode].date}</b><br/>
                        {display[5][mode].temp_c}&#176;C/{display[5][mode].temp_f}&#176;F<br/> 
                        <br/><img src={display[5][mode].condition_icon}/><br/>
                        {display[5][mode].condition_text}
                    </div>
                    <div className='box centerText'>
                        <b>{display[6][mode].date}</b><br/>
                        {display[6][mode].temp_c}&#176;C/{display[6][mode].temp_f}&#176;F<br/> 
                        <br/><img src={display[6][mode].condition_icon}/><br/>
                        {display[6][mode].condition_text}
                    </div>
                </>
            }
        </div>
        <br/>
        <button onClick={hideInfo}>Close</button>
    </div>
    </div>
    <MapContainer center={[51.505, -0.09]} zoom={2} scrollWheelZoom={true}>
        <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' 
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <LocationMarker remove={remove} show={show} isShown={isShown} coords={coords} setCoords={setCoords} lines={lines} setLines={setLines} info={showInfo}/>
        <LocationSetter/>
    </MapContainer>
    </>;
}

export default Map