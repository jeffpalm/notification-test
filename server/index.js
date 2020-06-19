require('dotenv').config()
const express = require('express'),
	massive = require('massive'),
	app = express(),
	server = require('http').Server(app),
	io = require('socket.io')(server),
	EventEmitter = require('events'),
	util = require('util'),
	{ Client } = require('pg'),
	{ SERVER_PORT, CONNECTION_STRING } = process.env,
	client = new Client({
		connectionString: CONNECTION_STRING,
		ssl: { rejectUnauthorized: false }
	})

app.use(express.json())

function DbEventEmitter() {
	EventEmitter.call(this)
}

util.inherits(DbEventEmitter, EventEmitter)
const dbEventEmitter = new DbEventEmitter()

dbEventEmitter.on('new_ticket_msg', (msg) => {
	console.log(`New message: ${msg}`)
})

massive({
	connectionString: CONNECTION_STRING,
	ssl: { rejectUnauthorized: false }
}).then((db) => {
	app.set('db', db)
	console.log('Database in place')
	app.listen(SERVER_PORT, () =>
		console.log(`Observin and servin port ${SERVER_PORT}`)
	)
})

server.listen(4001)

client.connect().then(() => {
	io.on('connection', (socket) => {
		console.log(socket.id)

		client.on('notification', (msg) => {
			let payload = JSON.parse(msg.payload)
			dbEventEmitter.emit(msg.channel, payload)
			socket.emit('new_ticket_msg', payload)
		})
		console.log('New Client Connected')
		client.query('LISTEN new_ticket_msg')
		socket.on('disconnect', () => {
			console.log('Client Disconnected')
		})
	})
})
