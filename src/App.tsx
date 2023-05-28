import './App.css';
import Map from './Map';
import { useState, useEffect } from 'react';
import { LatLng } from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotateLeft, faRotateRight, faTrash, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

// @ts-ignore
function App() {
    const [time, setTime] = useState<string>("");
    const [show, setShow] = useState<boolean[]>([]);
    const [coords, setCoords] = useState<LatLng[]>([]);
    const [lines, setLines] = useState<number[]>([]);
    // Is an array of pairs
    // First element in pair:
    // 1: Remove, 2: Add, 3: Clear
    const [interactions, setInteractions] = useState<(number|boolean[])[][]>([]);
    const [step, setStep] = useState<number>(0);

    function updateDate() {
        let ttime = new Date();
        let hour = ttime.getUTCHours();
        setTime(`${ttime.toLocaleDateString()} ${hour.toString().length == 1? "0" : ""}${hour}:00:00 (UTC)`);
    }

    setInterval(updateDate, 60000);
    useEffect(updateDate, []);

    useEffect(()=>{
        clear();
        load();
    }, []);

    function load() {
        const data = localStorage.getItem("coords");
        if (data==null) {
            return;
        }
        const newCoords = JSON.parse(data);
        
        for (const i of newCoords) {
            handleShow(i, false);
        }
    }

    function newInteraction(interaction:(number|boolean[])[]) {
        setStep(step+1);
        let newInteractions = interactions
        newInteractions.splice(step);
        newInteractions.push(interaction);
        setInteractions(newInteractions);
    }

    function undo() {
        if (step<=0) {
            return;
        }
        setStep(step-1);
        reverseInteraction();
    }

    function redo() {
        if (step >= interactions.length) {
            return;
        }
        setStep(step+1);
        reverseInteraction(false);
    }

    function reverseInteraction(r=true) {
        const i = interactions[r? step-1 : step];
        switch (i[0]) {
            case 1:
                if (r) {
                    // @ts-ignore
                    handleAdd(i[1]);
                } else {
                    // @ts-ignore
                    handleRemove(i[1], false);
                }
                break;

            case 2:
                if (!r) {
                    // @ts-ignore
                    handleAdd(i[1]);
                } else {
                    // @ts-ignore
                    handleRemove(i[1], false);
                }
                break;

            case 3:
                if (r) {
                    // @ts-ignore
                    setShow(i[1]);
                } else {
                    // @ts-ignore
                    clear(false);
                }
                break;

            default:
                break;
        }
    }

    function handleAdd(key:number) {
        let newShow = show.slice();
        newShow[key]=true;
        setShow(newShow);
    }

    function handleRemove(key:number, interact=true) {
        let newShow = show.slice();
        newShow[key]=false;
        setShow(newShow);
        if (interact) {
            newInteraction([1, key]);
        }
    }

    function handleShow(pos:LatLng, interact=true) {
        if (interact) {
            newInteraction([2, show.length]);
        }
        setShow(current => [...current, true]);
        setLines(current => [...current, current.length]);
        setCoords(current => [...current, pos]);
    }

    function clear(interact=true) {
        const beforeClear = show;
        setShow(Array(show.length).fill(false));
        if (interact) {
            newInteraction([3, beforeClear]);
        }
    }

    function save() {
        const newCoords = [];

        for(const i in show){
            if (show[i]){
                newCoords.push(coords[i]);
            }
        }

        localStorage.setItem("coords", JSON.stringify(newCoords));
    }

    window.addEventListener("beforeunload", (ev) => {
        ev.preventDefault();
        save();
    });
    
    return (<>
    <div className='top'><a href='https://megarion.github.io' target='_blank'>Megarion</a></div>
    <div className='center full'>
        <div>
            <div className='inlineDisplay center'>
                <img src="/sun-behind-rain-cloud.svg" title="hi there" className='imgFit' />
                <div className='center' style={{width: "40vw"}}>
                    <div>
                        {/* <button onClick={undo} className="inlineButton">Undo</button>
                        <button onClick={redo} className="inlineButton">Redo</button>
                        <button onClick={clear} className="inlineButton">Clear</button> */}
                        <div className='center'>
                            <FontAwesomeIcon icon={faRotateLeft} className='inlineButton' title='Undo' onClick={undo}/>
                            <FontAwesomeIcon icon={faRotateRight} className='inlineButton' title='Redo' onClick={redo}/>
                            {/* @ts-ignore */}
                            <FontAwesomeIcon icon={faTrash} className='inlineButton' title='Clear' onClick={clear}/>
                            <FontAwesomeIcon icon={faQuestion} className='inlineButton' title='Help' data-tooltip-id="popup" data-tooltip-content="Click on the map to get temperature of a location. Click the marker to remove it."/>
                        </div>
                        <p className='centerText'><b>Update time: </b>{time}</p>
                    </div>
                </div>
            </div>
            <Map remove={handleRemove} show={handleShow} isShown={show} coords={coords} setCoords={setCoords} lines={lines} setLines={setLines}/>
            <Tooltip id='popup'/>
        </div>
    </div>
    </>);
}

export default App
