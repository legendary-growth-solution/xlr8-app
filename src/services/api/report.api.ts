import { API_ENDPOINTS, createEndpoint } from './endpoints';

export type ReportProgressCallback = (processed: number, total: number, status: string) => void;

async function fetchReportHttp(path: string, payload: Record<string, any>): Promise<string> {
  const token = localStorage.getItem('accessToken') || '';
  const response = await fetch(createEndpoint(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'HTTP export failed');
  }

  const data = await response.json();
  return data.csv_data ?? '';
}

function buildReportWS(
  wsUrl: string,
  httpPath: string,
  firstMessage: Record<string, any>,
  onProgress: ReportProgressCallback
): Promise<string> {
  return new Promise((resolve, reject) => {
    let ws: WebSocket | null = null;
    let isFinished = false;

    const doHttpFallback = async () => {
      if (isFinished) return;
      isFinished = true;
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        ws.onmessage = null;
        try {
          ws.close();
        } catch (e) {
          /* ignore */
        }
      }
      try {
        onProgress(0, 0, 'Downloading report...');
        const csvData = await fetchReportHttp(httpPath, firstMessage);
        resolve(csvData);
      } catch (err: any) {
        reject(err);
      }
    };

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (isFinished) return;
        const token = localStorage.getItem('accessToken') || '';
        ws?.send(JSON.stringify({ token, ...firstMessage }));
      };

      ws.onmessage = (event) => {
        if (isFinished) return;
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'started') {
            onProgress(0, 0, 'Starting...');
          } else if (msg.type === 'progress') {
            onProgress(msg.processed ?? 0, msg.total ?? 0, msg.status ?? 'Processing...');
          } else if (msg.type === 'completed') {
            isFinished = true;
            if (ws) {
              ws.onclose = null;
              ws.onerror = null;
              ws.onmessage = null;
            }
            resolve(msg.csv_data ?? '');
          } else if (msg.type === 'error') {
            doHttpFallback();
          }
        } catch (err) {
          doHttpFallback();
        }
      };

      ws.onerror = () => {
        if (!isFinished) {
          doHttpFallback();
        }
      };

      ws.onclose = (event) => {
        if (!isFinished && event.code !== 1000 && event.code !== 1001) {
          doHttpFallback();
        }
      };
    } catch (e) {
      if (!isFinished) {
        doHttpFallback();
      }
    }
  });
}

export const reportApi = {
  downloadUserReport: (
    selectedFieldsOrProgress?: string[] | ReportProgressCallback,
    filters?: Record<string, any>,
    onProgress?: ReportProgressCallback
  ): Promise<string> => {
    let activeFields: string[] | undefined;
    let callback: ReportProgressCallback = () => {};

    if (typeof selectedFieldsOrProgress === 'function') {
      callback = selectedFieldsOrProgress;
    } else {
      activeFields = selectedFieldsOrProgress;
      if (onProgress) callback = onProgress;
    }

    return buildReportWS(
      API_ENDPOINTS.REPORTS.USER_REPORT_WS,
      '/api/export/user-report',
      { selected_fields: activeFields, filters },
      callback
    );
  },

  downloadFinanceReport: (
    startDate: string,
    endDate: string,
    selectedFieldsOrProgress?: string[] | ReportProgressCallback,
    filters?: Record<string, any>,
    onProgress?: ReportProgressCallback
  ): Promise<string> => {
    let activeFields: string[] | undefined;
    let callback: ReportProgressCallback = () => {};

    if (typeof selectedFieldsOrProgress === 'function') {
      callback = selectedFieldsOrProgress;
    } else {
      activeFields = selectedFieldsOrProgress;
      if (onProgress) callback = onProgress;
    }

    return buildReportWS(
      API_ENDPOINTS.REPORTS.FINANCE_REPORT_WS,
      '/api/export/finance-report',
      { start_date: startDate, end_date: endDate, selected_fields: activeFields, filters },
      callback
    );
  },

  downloadDiscountReport: (
    selectedFieldsOrProgress?: string[] | ReportProgressCallback,
    filters?: Record<string, any>,
    onProgress?: ReportProgressCallback
  ): Promise<string> => {
    let activeFields: string[] | undefined;
    let callback: ReportProgressCallback = () => {};

    if (typeof selectedFieldsOrProgress === 'function') {
      callback = selectedFieldsOrProgress;
    } else {
      activeFields = selectedFieldsOrProgress;
      if (onProgress) callback = onProgress;
    }

    return buildReportWS(
      API_ENDPOINTS.REPORTS.DISCOUNT_REPORT_WS,
      '/api/export/discount-report',
      { selected_fields: activeFields, filters },
      callback
    );
  },

  downloadUtilizationReport: (
    startDate: string,
    endDate: string,
    selectedFieldsOrProgress?: string[] | ReportProgressCallback,
    filters?: Record<string, any>,
    onProgress?: ReportProgressCallback
  ): Promise<string> => {
    let activeFields: string[] | undefined;
    let callback: ReportProgressCallback = () => {};

    if (typeof selectedFieldsOrProgress === 'function') {
      callback = selectedFieldsOrProgress;
    } else {
      activeFields = selectedFieldsOrProgress;
      if (onProgress) callback = onProgress;
    }

    return buildReportWS(
      API_ENDPOINTS.REPORTS.UTILIZATION_REPORT_WS,
      '/api/export/utilization-report',
      { start_date: startDate, end_date: endDate, selected_fields: activeFields, filters },
      callback
    );
  },

  downloadLeaderboardReport: (
    selectedFieldsOrProgress?: string[] | ReportProgressCallback,
    filters?: Record<string, any>,
    onProgress?: ReportProgressCallback
  ): Promise<string> => {
    let activeFields: string[] | undefined;
    let callback: ReportProgressCallback = () => {};

    if (typeof selectedFieldsOrProgress === 'function') {
      callback = selectedFieldsOrProgress;
    } else {
      activeFields = selectedFieldsOrProgress;
      if (onProgress) callback = onProgress;
    }

    return buildReportWS(
      API_ENDPOINTS.REPORTS.LEADERBOARD_REPORT_WS,
      '/api/export/leaderboard-report',
      { selected_fields: activeFields, filters },
      callback
    );
  },
};

export function triggerCsvDownload(csvData: string, filename: string) {
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
