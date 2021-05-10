import React, { useEffect, useRef, useState } from 'react';

const PlayButton = ({onClick, style, className}) => <svg fill="white" onClick={onClick} className={"testimonial-play-btn " + className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M4.378.003A4.546 4.546 0 0 0 0 4.543v90.905c0 3.378 3.555 5.577 6.578 4.067L97.492 54.06c3.344-1.677 3.344-6.45 0-8.127L6.578.476a4.546 4.546 0 0 0-2.2-.473z"></path>
</svg>;

const DurationBar = ({duration, currentTime}) => {
    duration = duration || 1;
    currentTime = currentTime || 0;
    const widthPercent = (currentTime / duration) * 100;
    return <div className="position-absolute w-100 duration-bar" style={{background:"rgba(0.5, 0.5, 0.5, 0.5)", bottom:1}}>
        <div className="position-absolute" style={{top:0, height:"100%", left:0, width:widthPercent + "%", background:"red"}}/>
    </div>
}

const TestimonialPlayer = ({src}) => {

    const vid = useRef(null);
    const [play, setPlay] = useState(false);
    const [time, setTime] = useState(0);
    const duration = vid.current && vid.current.duration;


	const height = vid.current ? (vid.current.clientHeight < 500 ? vid.current.clientHeight : 500) : 0;
	const width = height && ((vid.current.clientWidth / vid.current.clientHeight) * height);

	const isVerticalVid = height > width;

    const playVid = () => {
        vid.current.play();
    };
    const pauseVid = () => {
        vid.current.pause();
    };

    const updatePlay = (toPlay) => {
        if (toPlay) playVid();
        else pauseVid();
    }

    return <div className="testimonial-video position-relative my-2 mx-auto" style={{background:"rgba(0,0,0,0.3)", width: width || "unset", height: height || "unset"}}>
        <video src={src} className="w-100" ref={vid}
            onTimeUpdate={() =>setTime(vid.current ? vid.current.currentTime : 0)}
            onPlay={() => setPlay(true)}
            onPause={() => setPlay(false)}/>
        <PlayButton style={{position:"absolute", top: "50%", left:"50%", height:isVerticalVid ? "30%" : "70%"}} className={play ? "playing" : "paused"}/>
        <div className="position-absolute" style={{top:0, left:0, bottom:0, right:0, cursor:"pointer"}} onClick={() => updatePlay(!play)}/>
        <DurationBar duration={duration} currentTime={time}/>
    </div>;
}

export default TestimonialPlayer;
