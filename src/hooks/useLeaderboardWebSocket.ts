import type { Leaderboard } from 'src/types/session';

import { useRef, useState, useEffect } from 'react';

import { BASE_URL } from 'src/services/api/endpoints';

interface LeaderboardWebSocketMessage {
  type: 'leaderboard_generated' | 'leaderboard_processing' | 'error';
  status: 'completed' | 'processing';
  leaderboard?: Leaderboard[];
  message?: string;
  session_id?: string;
}

interface UseLeaderboardWebSocketOptions {
  sessionId: string;
  onLeaderboardUpdate?: (leaderboard: Leaderboard[]) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
}

const getWebSocketUrl = (sessionId: string): string => {
  const wsProtocol = BASE_URL.startsWith('https') ? 'wss' : 'ws';
  const urlWithoutProtocol = BASE_URL.replace(/^https?:\/\//, '');
  return `${wsProtocol}://${urlWithoutProtocol}/ws/sessions/${sessionId}/leaderboard`;
};

export const useLeaderboardWebSocket = ({
  sessionId,
  onLeaderboardUpdate,
  onError,
  enabled = true,
}: UseLeaderboardWebSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  
  const onLeaderboardUpdateRef = useRef(onLeaderboardUpdate);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onLeaderboardUpdateRef.current = onLeaderboardUpdate;
    onErrorRef.current = onError;
  }, [onLeaderboardUpdate, onError]);

  useEffect(() => {
    if (!enabled || !sessionId) {
      return undefined;
    }

    if (wsRef.current) {
      return undefined;
    }

    const connect = () => {
      if (wsRef.current) {
        return;
      }

      try {
        const wsUrl = getWebSocketUrl(sessionId);
        const token = localStorage.getItem('accessToken');
        const wsUrlWithToken = token ? `${wsUrl}?token=${token}` : wsUrl;

        const ws = new WebSocket(wsUrlWithToken);

        ws.onopen = () => {
          setIsConnected(true);
          setIsProcessing(false);
          reconnectAttemptsRef.current = 0;
        };

        ws.onmessage = (event) => {
          try {
            const data: LeaderboardWebSocketMessage = JSON.parse(event.data);

            if (data.type === 'leaderboard_generated' && data.leaderboard) {
              const formattedLeaderboard = data.leaderboard.map((item, index) => ({
                ...item,
                rank: index + 1,
              }));
              onLeaderboardUpdateRef.current?.(formattedLeaderboard);
              setIsProcessing(false);
            } else if (data.type === 'leaderboard_processing') {
              setIsProcessing(true);
            } else if (data.type === 'error') {
              onErrorRef.current?.(data.message || 'An error occurred');
              setIsProcessing(false);
            }
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };

        ws.onclose = (event) => {
          setIsConnected(false);
          wsRef.current = null;

          if (event.code === 1000 || event.code === 1001) {
            return;
          }

          if (enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * (2 ** reconnectAttemptsRef.current), 10000);
            reconnectAttemptsRef.current += 1;

            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          }
        };

        wsRef.current = ws;
      } catch (err) {
        console.error('Failed to create WebSocket connection:', err);
        setIsConnected(false);
      }
    };

    connect();

    const cleanup = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      setIsConnected(false);
      setIsProcessing(false);
    };

    return cleanup;
  }, [sessionId, enabled]);

  return {
    isConnected,
    isProcessing,
  };
};

