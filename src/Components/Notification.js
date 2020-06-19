import React from 'react'

const Notification = (props) => {
	return (
		<>
			<h2>New Message!</h2>
			<p>{props.message}</p>
		</>
	)
}

export default Notification
