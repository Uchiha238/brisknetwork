const xlsx = require('xlsx');

const filePath = 'C:\\Users\\shambu\\OneDrive\\Desktop\\omcourier\\Copy of PINCODE_03062022.xlsb';

try {
  const workbook = xlsx.readFile(filePath);
  console.log('Sheet Names:', workbook.SheetNames);
  
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  console.log('Headers:', data[0]);
  for (let i = 1; i <= 10; i++) {
    console.log(`Row ${i}:`, data[i]);
  }
} catch (e) {
  console.error("Error reading file", e);
}
