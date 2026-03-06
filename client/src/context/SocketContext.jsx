import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

export const SocketContext = createContext({ notifications: [], iotAlerts: [], cityAlerts: [], markAllRead: () => { }, socket: null });

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [iotAlerts, setIotAlerts] = useState([]);
  const [cityAlerts, setCityAlerts] = useState([]);

  useEffect(() => {
    if (!user) return;

    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('join_room', user._id);

    socketRef.current.on('issue_updated', (data) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          message: `Issue status updated to "${data.status}"${data.remark ? ': ' + data.remark : ''}`,
          read: false,
          issueId: data.issueId,
        },
        ...prev,
      ]);
    });

    socketRef.current.on('status_updated', (data) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          message: `Cluster status updated to "${data.status}"`,
          read: false,
          clusterId: data.clusterId,
        },
        ...prev,
      ]);
    });

    socketRef.current.on('iot_ghost_report', (data) => {
      setIotAlerts((prev) => [{ ...data, read: false }, ...prev].slice(0, 20));
    });

    // City alert events
    socketRef.current.on('city_alert_new', (data) => {
      setCityAlerts((prev) => [data, ...prev].slice(0, 30));
      setNotifications((prev) => [
        { id: Date.now(), message: `🚨 New city alert: ${data.title}`, read: false },
        ...prev,
      ]);
    });

    socketRef.current.on('city_alert_updated', (data) => {
      setCityAlerts((prev) => prev.map(a => a._id === data._id ? data : a));
    });

    socketRef.current.on('city_alert_resolved', (data) => {
      setCityAlerts((prev) => prev.filter(a => a._id !== data._id));
    });

    socketRef.current.on('announcement_new', (data) => {
      setNotifications((prev) => [
        { id: Date.now(), message: `📢 New announcement: ${data.title}`, read: false },
        ...prev,
      ]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, notifications, iotAlerts, cityAlerts, markAllRead }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

