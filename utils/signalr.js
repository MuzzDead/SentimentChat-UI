import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
  .withUrl('https://localhost:7055/chathub')
  .withAutomaticReconnect()
  .build();

export default connection;
