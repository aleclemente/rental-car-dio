const express = require('express');
const cors = require('cors');
const { DefaultAzureCredential } = require('@azure/identity');
const { ServiceBusClient } = require('@azure/service-bus');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/rent-a-car', async (req, res) => {
    const { name, email, carModel, rentalDurationInDays } = req.body;
    const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;

    try {
        const credential = new DefaultAzureCredential();
        const queueName = 'car-rental-queue';

        const sbClient = new ServiceBusClient(connectionString);
        const sender = sbClient.createSender('car-rental-queue');

        const messageBody = {
            name,
            email,
            carModel,
            rentalDate: new Date().toISOString(),
        };

        await sender.sendMessages({
            body: messageBody,
            contentType: "application/json",
            subject: 'Car Rental Request',
            label: 'car-rental-request',
            to: 'car-rental-queue',
            from: 'car-rental-service'
        });

        await sender.sendMessages(message);

        console.log('Message sent to Service Bus:', message);

        await sender.close();
        await sbClient.close();

        res.status(201).send('Car rental request sent successfully');
    } catch (error) {
        console.error('Error sending message to Service Bus:', error);
        res.status(500).send('Error sending car rental request');
    }
});

app.listen(3001, () => console.log("BFF rodando na porta 3001"));