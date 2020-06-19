import React, { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'
import Notification from './Components/Notification'
import './App.css'

const ENDPOINT = 'http://localhost:4001'

function App() {
	const [response, setResponse] = useState('')
	const [notification, setNotification] = useState(false)
	const socket = socketIOClient(ENDPOINT)

	useEffect(() => {
		socket.on('new_ticket_msg', (data) => {		
			setResponse(data)			
			setNotification(!notification)
		})
		return () => {
			socket.disconnect()
		}
	}, [notification, socket])

	return (
		<>
			<h1>Welcome!</h1>
			{notification ? (
				<>
				<Notification message={response.message}/>
				<button onClick={() => setNotification(false)}>Dismiss</button>
				</>
			) : null}
			<button onClick={() => setNotification(!notification)}>Click</button>
		</>
	)
}

export default App
