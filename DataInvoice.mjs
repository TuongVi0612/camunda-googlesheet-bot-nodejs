import {
    Client,
    logger
  } from "camunda-external-task-client-js";
  import { GoogleSpreadsheet } from "google-spreadsheet";
  
// Replace these values with your own
const CAMUNDA_BASE_URL = "http://localhost:8080/engine-rest";
const PRIVATE_KEY = "YOUR-PRIVATE-KEY";
const CLIENT_EMAIL = "YOUR-SERVICE-EMAIL-ACCOUNT";
const SHEET_ID = "YOUR-SPEADSHEED-ID";
  
  // Configure the client
  const config = { baseUrl: CAMUNDA_BASE_URL, use: logger };
  const client = new Client(config);
  
  // Subscribe to a topic
  client.subscribe("DataInvoice", async function ({ task, taskService }) {
    try{
    // Get the data from the Camunda form    
    const date = task.variables.get('date');
    const place = task.variables.get('place');
    const name = task.variables.get('name');
    const quantity = task.variables.get('quantity');
    const total = task.variables.get('total');
  
    // Initialize the sheet
    const doc = new GoogleSpreadsheet(SHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY,
    });
    await doc.loadInfo();
  
    // Get the first sheet
    const sheet = doc.sheetsByIndex[0];
  
    // Append a new row with the data from the Camunda form
    await sheet.addRow({
      "Ngày nhập hàng": date,
      "Chi nhánh": place,
      "Tên mặt hàng": name,
      "Số lượng nhập": quantity,
      "Thành tiền": total,
    });
  
    // Complete the task in Camunda
    await taskService.complete(task);
    console.log("Task completed successfully!");
  } catch (error) {
    console.log(error);
  
    // Handle any errors and fail the external task
    await taskService.handleFailure(task, {
      errorMessage: 'Failed to upload data',
      errorDetails: error.message,
      retries: 0
    });
  }
  });
  