import { google } from 'googleapis';

/**
 * Mengambil data dari sheet "Master"
 */
export async function getSheetData() {
  try {
    const sheets = google.sheets({
      version: 'v4',
      auth: process.env.GOOGLE_SHEETS_API_KEY,
    });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Master!A:O', // Ambil data dari Kolom A sampai O di sheet "Master"
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return [];
    }

    // Ambil header (baris pertama) untuk dijadikan key object
    const headers = rows[0];
    const data = rows.slice(1).map((row) => {
      let rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index] || null; // Beri nilai null jika sel kosong
      });
      return rowData;
    });

    return data;
  } catch (err) {
    console.error('The API returned an error (Master): ' + err);
    throw new Error('Failed to fetch sheet data');
  }
}

/**
 * Mengambil data dari sheet "PEMASUKAN"
 */
export async function getPemasukanData() {
  try {
    const sheets = google.sheets({
      version: 'v4',
      auth: process.env.GOOGLE_SHEETS_API_KEY,
    });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'PEMASUKAN!A:C', // Ambil data dari sheet "PEMASUKAN"
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No pemasukan data found.');
      return [];
    }

    const headers = rows[0];
    const data = rows.slice(1).map((row) => {
      let rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index] || null;
      });
      return rowData;
    });

    return data;
  } catch (err) {
    console.error('The API returned an error (Pemasukan): ' + err);
    throw new Error('Failed to fetch pemasukan sheet data');
  }
}