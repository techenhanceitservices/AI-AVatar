import "./Avatar.css";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { createAvatarSynthesizer, createWebRTCConnection } from "./Utility";
import { avatarAppConfig } from "./config";
import { useState, useRef, useEffect } from "react";

export const Avatar = () => {
    const [avatarSynthesizer, setAvatarSynthesizer] = useState(null);
    const myAvatarVideoEleRef = useRef();
    const myAvatarAudioEleRef = useRef();
    const [mySpeechText, setMySpeechText] = useState("");

    var iceUrl = avatarAppConfig.iceUrl;
    var iceUsername = avatarAppConfig.iceUsername;
    var iceCredential = avatarAppConfig.iceCredential;

    const handleSpeechText = (event) => {
        setMySpeechText(event.target.value);
    }

    const handleOnTrack = (event) => {
        console.log("#### Printing handle onTrack ", event);

        // Update UI elements
        console.log("Printing event.track.kind ", event.track.kind);
        if (event.track.kind === 'video') {
            const mediaPlayer = myAvatarVideoEleRef.current;
            mediaPlayer.id = event.track.kind;
            mediaPlayer.srcObject = event.streams[0];
            mediaPlayer.autoplay = true;
            mediaPlayer.playsInline = true;
            mediaPlayer.addEventListener('play', () => {
                window.requestAnimationFrame(() => { });
            });
        } else {
            const audioPlayer = myAvatarAudioEleRef.current;
            audioPlayer.srcObject = event.streams[0];
            audioPlayer.autoplay = true;
            audioPlayer.playsInline = true;
            audioPlayer.muted = true;
        }
    };

    const stopSpeaking = () => {
        avatarSynthesizer.stopSpeakingAsync().then(() => {
            console.log("[" + (new Date()).toISOString() + "] Stop speaking request sent.")
        }).catch();
    }

    const stopSession = () => {
        try {
            // Stop speaking
            avatarSynthesizer.stopSpeakingAsync().then(() => {
                console.log("[" + (new Date()).toISOString() + "] Stop speaking request sent.")
                // Close the synthesizer
                avatarSynthesizer.close();
            }).catch();
        } catch (e) {
        }
    }

    const speakSelectedText = () => {
        // Start speaking the text
        const audioPlayer = myAvatarAudioEleRef.current;
        console.log("Audio muted status ", audioPlayer.muted);
        audioPlayer.muted = false;
        avatarSynthesizer.speakTextAsync(mySpeechText).then(
            (result) => {
                if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                    console.log("Speech and avatar synthesized to video stream.")
                } else {
                    console.log("Unable to speak. Result ID: " + result.resultId)
                    if (result.reason === SpeechSDK.ResultReason.Canceled) {
                        let cancellationDetails = SpeechSDK.CancellationDetails.fromResult(result)
                        console.log(cancellationDetails.reason)
                        if (cancellationDetails.reason === SpeechSDK.CancellationReason.Error) {
                            console.log(cancellationDetails.errorDetails)
                        }
                    }
                }
            }).catch((error) => {
                console.log(error)
                avatarSynthesizer.close()
            });
    }

    useEffect(() => {
        const startSession = () => {
            let peerConnection = createWebRTCConnection(iceUrl, iceUsername, iceCredential);
            console.log("Peer connection ", peerConnection);
            peerConnection.ontrack = handleOnTrack;
            peerConnection.addTransceiver('video', { direction: 'sendrecv' })
            peerConnection.addTransceiver('audio', { direction: 'sendrecv' })

            let avatarSynthesizer = createAvatarSynthesizer();
            setAvatarSynthesizer(avatarSynthesizer);
            peerConnection.oniceconnectionstatechange = e => {
                console.log("WebRTC status: " + peerConnection.iceConnectionState)

                if (peerConnection.iceConnectionState === 'connected') {
                    console.log("Connected to Azure Avatar service");
                }

                if (peerConnection.iceConnectionState === 'disconnected' || peerConnection.iceConnectionState === 'failed') {
                    console.log("Azure Avatar service Disconnected");
                }
            }

            avatarSynthesizer.startAvatarAsync(peerConnection).then((r) => {
                console.log("[" + (new Date()).toISOString() + "] Avatar started.")
            }).catch(
                (error) => {
                    console.log("[" + (new Date()).toISOString() + "] Avatar failed to start. Error: " + error)
                }
            );
        }

        startSession();

        return () => {
            stopSession();
        };
    }, []);

    return (
        <div className="container myAvatarContainer">
            <p className="myAvatarDemoText">Azure Avatar Demo</p>
            <div className="container myAvatarVideoRootDiv d-flex justify-content-around">
                <div className="myAvatarVideo">
                    <div id="myAvatarVideo" className="myVideoDiv">
                        <video className="myAvatarVideoElement" ref={myAvatarVideoEleRef}></video>
                        <audio ref={myAvatarAudioEleRef}></audio>
                    </div>
                </div>
                <div className="myTextArea">
                    <textarea className="myTextArea" onChange={handleSpeechText}></textarea>
                    <div className="myButtonGroup d-flex justify-content-around">
                        <button className="btn btn-success" onClick={speakSelectedText}>
                            Speak
                        </button>
                        <button className="btn btn-warning" onClick={stopSpeaking}>
                            Stop
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
