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
                <div className='center'>
                    <img src="/sun-behind-rain-cloud.svg" alt="image" />
                </div>
                <div className='center' style={{display: ac? "none":"flex"}}>
                    <div className='centerV'>
                        <div>
                            <h2 className='centerText'>Temperature Anywhere</h2>
                            <h3 className='centerText'>{time}</h3>
                        </div>
                    </div>
                </div>
                <div className='center'>
                    <div className='centerV'>
                        <button onClick={() => {
                            setAc(!ac);
                        }}>Toggle actions</button>
                    </div>
                </div>
            </div>
            <Map />
        </div>
    </div>
    </>;
}

export default App
