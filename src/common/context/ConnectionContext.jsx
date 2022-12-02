import {
  createContext, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { getStorageItem } from '../../utils';
import bc from '../services/breathecode';
import useAuth from '../hooks/useAuth';
import axiosInstance from '../../axios';
import modifyEnv from '../../../modifyEnv';

export const ConnectionContext = createContext({ usersConnected: [] });

const OnlineContext = ({ children }) => {
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const [usersConnected, setUsersConnected] = useState([]);
  const accessToken = getStorageItem('accessToken');
  const { isLoading } = useAuth();
  const [temporalToken, setTemporalToken] = useState(null);
  const hasLoaded = !isLoading;

  const BREATHECODE_WS = String(BREATHECODE_HOST).replace('https://', '');

  useEffect(() => {
    if (hasLoaded && accessToken) {
      axiosInstance.defaults.headers.common.Authorization = `Token ${accessToken}`;
      setTimeout(() => {
        bc.auth()?.temporalToken()
          .then(({ data }) => {
            setTemporalToken(data);
          });
      }, 800);
    }
  }, [isLoading, accessToken]);

  const actions = {
    connected: (data) => {
      if (usersConnected.includes(data.id)) return;
      setUsersConnected((prev) => [...prev, data.id]);
    },
    disconnected: (data) => setUsersConnected((prev) => prev.filter((id) => id !== data.id)),
  };

  useEffect(() => {
    if (hasLoaded && temporalToken !== null && temporalToken?.token) {
      // console.log('temporal_token:', temporalToken);
      const client = new W3CWebSocket(`wss://${BREATHECODE_WS}/ws/online?token=${temporalToken.token}`);

      client.onopen = () => {
        console.log('WebSocket Client Connected');
        setUsersConnected((prev) => [...prev, temporalToken.user_id]);
      };

      client.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (!actions[data.status] || typeof actions[data.status] === 'object') { return; }
        if (!data || typeof data !== 'object') return;

        actions[data.status](data);
      };
    }
  }, [isLoading, temporalToken]);

  return (
    <ConnectionContext.Provider
      value={{
        usersConnected,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

OnlineContext.propTypes = {
  children: PropTypes.node.isRequired,
};

export default OnlineContext;
