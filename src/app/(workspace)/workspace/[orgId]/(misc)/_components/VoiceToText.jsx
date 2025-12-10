'use client'
import React, { useEffect, useState } from 'react'
import { Mic, Play, Square, SquarePause } from 'lucide-react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
export const VoiceToText = ({ onChange }) => {
    const [started, setStarted] = useState(false)
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();


    useEffect(() => {
        onChange(transcript)
    }, [transcript])


    useEffect(() => {
        //setAppointmentData({ ...appointmentData, note: transcript })
    }, [listening])

    const startListning = () => {
        //setListning(!listning)
        SpeechRecognition.startListening({ continuous: true, language: 'en-IN' })
    }

    const pauseListning = () => {
        console.log('Pause Listning')
        SpeechRecognition.stopListening()
    }

    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
    }


    return (
        <div className='flex flex-row gap-2 '>
            <Mic
                className={`cursor-pointer ${started && 'text-red-600 font-bold animate-ping'}`}
                size={18}
                onClick={() => {
                    startListning()
                    setStarted(true)
                }}
            />
            {
                started && (
                    <div className='flex flex-row gap-2'>
                        {!listening && <Play size={18} className='cursor-pointer text-green-500' onClick={() => {
                            SpeechRecognition.startListening()
                        }} />}
                        {listening && <SquarePause size={18} className='cursor-pointer' onClick={() => {
                            SpeechRecognition.stopListening()
                            //SpeechRecognition.stopListening()
                        }} />}
                        <Square size={18} className='cursor-pointer text-red-600' onClick={() => {
                            SpeechRecognition.abortListening()
                            setStarted(false)
                        }} />
                    </div>
                )
            }

        </div>
    )
}
