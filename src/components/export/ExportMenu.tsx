import { Menu, MenuItem } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { utils, writeFile } from 'xlsx';

interface ExportMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  data: Array<any>;
  filename?: string;
  headers?: string[];
  transformData?: (data: any[]) => any[];
}

export default function ExportMenu({
  anchorEl,
  onClose,
  data,
  filename = 'export',
  headers,
  transformData,
}: ExportMenuProps) {
  const processedData = transformData ? transformData(data) : data;

  const exportToCSV = () => {
    const csvHeaders = headers || Object.keys(processedData[0]);
    const csvData = processedData.map(item => 
      csvHeaders.map(header => 
        typeof item[header] === 'object' ? JSON.stringify(item[header]) : item[header]
      )
    );

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    onClose();
  };

  const exportToExcel = () => {
    const worksheet = utils.json_to_sheet(processedData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    writeFile(workbook, `${filename}.xlsx`);
    onClose();
  };

  const exportToJSON = () => {
    downloadFile(
      JSON.stringify(processedData, null, 2),
      `${filename}.json`,
      'application/json'
    );
    onClose();
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <MenuItem onClick={exportToCSV}>
        <Iconify icon="hugeicons:csv-01" sx={{ mr: 2 }} />
        Export as CSV
      </MenuItem>
      <MenuItem onClick={exportToExcel}>
        <Iconify icon="vscode-icons:file-type-excel" sx={{ mr: 2 }} />
        Export as Excel
      </MenuItem>
      <MenuItem onClick={exportToJSON}>
        <Iconify icon="vscode-icons:file-type-json" sx={{ mr: 2 }} />
        Export as JSON
      </MenuItem>
    </Menu>
  );
} 