// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import getComputerLocation from './getComputerLocation';
import haversine from './haversine';
import { isMobileDevice } from './utils';
import './App.css';

const App = () => {
  const [computerLocation, setComputerLocation] = useState({ latitude: null, longitude: null });
  const [phoneLocation, setPhoneLocation] = useState({ latitude: null, longitude: null });
  const [distance, setDistance] = useState(null);
  const [deviceType, setDeviceType] = useState('desktop');
  const ws = useRef(null);

  useEffect(() => {
    setDeviceType(isMobileDevice() ? 'mobile' : 'desktop');
  }, []);

  useEffect(() => {
    const fetchComputerLocation = async () => {
      if (deviceType === 'desktop') {
        const location = await getComputerLocation();
        setComputerLocation(location);
      }
    };

    if (deviceType === 'desktop') {
      fetchComputerLocation();
    }
  }, [deviceType]);

  useEffect(() => {
    if (deviceType === 'mobile' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPhoneLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error fetching phone location:", error);
        }
      );
    }
  }, [deviceType]);

  // WebSocket connection to synchronize locations
  useEffect(() => {
    ws.current = new WebSocket('ws://10.32.22.3:8080');

    ws.current.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'location') {
        if (message.deviceType === 'desktop') {
          setComputerLocation(message.location);
        } else if (message.deviceType === 'mobile') {
          setPhoneLocation(message.location);
        }
      }
    };

    // Cleanup
    return () => {
      ws.current.close();
    };
  }, [deviceType]);

  useEffect(() => {
    const sendLocation = () => {
      if (ws.current.readyState === WebSocket.OPEN) {
        if (deviceType === 'desktop' && computerLocation.latitude) {
          ws.current.send(JSON.stringify({
            type: 'location',
            deviceType,
            location: computerLocation,
          }));
        }
        if (deviceType === 'mobile' && phoneLocation.latitude) {
          ws.current.send(JSON.stringify({
            type: 'location',
            deviceType,
            location: phoneLocation,
          }));
        }
      }
    };

    // Check WebSocket state and send location every 5 seconds if connected
    const intervalId = setInterval(() => {
      if (ws.current.readyState === WebSocket.OPEN) {
        sendLocation();
      }
    }, 5000);

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, [deviceType, computerLocation, phoneLocation]);

  useEffect(() => {
    if (
      computerLocation.latitude &&
      computerLocation.longitude &&
      phoneLocation.latitude &&
      phoneLocation.longitude
    ) {
      const dist = haversine(
        computerLocation.latitude,
        computerLocation.longitude,
        phoneLocation.latitude,
        phoneLocation.longitude
      );
      setDistance(dist);
    }
  }, [computerLocation, phoneLocation]);

  return (
    <div className="App">
      <h1>Live Distance Calculator</h1>
      <p>Device Type: {deviceType}</p>
      {deviceType === 'desktop' && (
        <p>Computer Location: {computerLocation.latitude}, {computerLocation.longitude}</p>
      )}
      {deviceType === 'mobile' && (
        <p>Phone Location: {phoneLocation.latitude}, {phoneLocation.longitude}</p>
      )}
      <p>Distance: {distance !== null ? `${distance.toFixed(2)} km` : 'Calculating...'}</p>
    </div>
  );
};

export default App;
