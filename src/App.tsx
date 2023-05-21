import './App.css';
import Map from './Map';
import { useState, useEffect } from 'react';

// @ts-ignore
function App() {
    let [time, setTime] = useState<string>("");
    let [ac, setAc] = useState<boolean>(false);
    const [show, setShow] = useState<boolean[]>([]);

    function updateDate() {
        let time = new Date();
        let hour = time.getUTCHours();
        setTime(`Update time: ${time.toLocaleDateString()} ${hour.toString().length == 1? "0" : ""}${hour}:00:00 (UTC)`);
    }

    setInterval(updateDate, 60000);
    useEffect(updateDate, []);

    // Is an array of pairs
    // First element in pair:
    // 1: Remove, 2: Add, 3: Clear
    let interactions:number[] = [];
    let step = 0;

    function stepInteraction(interaction:number) {
        interactions.splice(step+1);
        interactions.push()
        step++;
    }

    function handleRemove(key:number) {
        let newShow = show.slice();
        newShow[key]=false;
        setShow(newShow);
        interactions.push([])
        stepInteraction()
    }

    function handleShow() {
        setShow([...show, true]);
    }

    function clear() {
        setShow(Array(show.length).fill(false));
    }

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
                        <button onClick={clear} className="inlineButton">Clear</button>
                        <button className="inlineButton">Save</button>
                    </div>
                </div>
                <div className='center'>
                    <button onClick={() => {
                        setAc(!ac);
                    }}>Toggle actions</button>
                </div>
            </div>
            <Map remove={handleRemove} show={handleShow} isShown={show}/>
            <div className='center'>
                <div>
                    <button className="inlineButton">Instructions</button>
                </div>
            </div>
        </div>
    </div>
    </>;
}

export default App
