import './App.css';
import Map from './Map';
import { useState, useEffect } from 'react';

function App() {
    let [time, setTime] = useState<string>("");
    let [ac, setAc] = useState<boolean>(false);

    function updateDate() {
        let time = new Date();
        let hour = time.getUTCHours();
        setTime(`Update time: ${time.toLocaleDateString()} ${hour.toString().length == 1? "0" : ""}${hour}:00:00 (UTC)`);
    }

    setInterval(updateDate, 60000);
    useEffect(updateDate, []);

    return <>
    <div className='center full'>
        <div>
            <div className='inlineDisplay center'>
                <img src="/sun-behind-rain-cloud.svg" alt="hi there" className='imgFit' />
                <div className='center' style={{width: "40vw",display: ac? "none":"flex"}}>
                    <div>
                        <h2 className='centerText'>Temperature Anywhere</h2>
                        <h3 className='centerText'>{time}</h3>
                    </div>
                </div>
                <div className='center' style={{width: "40vw",display: !ac? "none":"flex"}}>
                    <div>
                        <button className="inlineButton">Undo</button>
                        <button className="inlineButton">Redo</button><br/>
                        <button className="inlineButton">Clear</button>
                        <button className="inlineButton">Save</button>
                    </div>
                </div>
                <div className='center'>
                    <button onClick={() => {
                        setAc(!ac);
                    }}>Toggle actions</button>
                </div>
            </div>
            <Map />
        </div>
    </div>
    </>;
}

export default App
