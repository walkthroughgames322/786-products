function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Products");
  const rows = sheet.getDataRange().getValues();
  const products = rows.slice(1).map(r => ({
    id: r[0],
    name: r[1],
    link: r[2],
    playlist: r[3],
    image: r[4]
  }));
  return ContentService.createTextOutput(JSON.stringify(products)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Products");
  const data = JSON.parse(e.postData.contents);
  
  if (data.action === "add") {
    sheet.appendRow([data.id, data.name, data.link, data.playlist, data.image]);
    return ContentService.createTextOutput("Added");
  }
  
  if (data.action === "update") {
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.id) {
        sheet.getRange(i + 1, 2, 1, 4).setValues([[data.name, data.link, data.playlist, data.image]]);
        return ContentService.createTextOutput("Updated");
      }
    }
    return ContentService.createTextOutput("Not found");
  }

  if (data.action === "delete") {
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.id) {
        sheet.deleteRow(i + 1);
        return ContentService.createTextOutput("Deleted");
      }
    }
    return ContentService.createTextOutput("Not found");
  }

  return ContentService.createTextOutput("Invalid action");
}
