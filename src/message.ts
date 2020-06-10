const send_monthly_msg = () => {
  const sheet_name = "【毎月】メッセージ"
  const room_id = "*********"

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet_name)
  const sheet_data = sheet.getDataRange().getValues()
  // 行や列を配列として捉える　0スタート
  const first_row = 2 - 1;
  const room_id_column = 1 - 1;
  const message_column = 2 - 1;
  const sending_date_column = 3 - 1;

  interface request_message_obj {
    room_id: string;
    mssage_body: string;
    fixed_date: number;
  }

  const cw_send_message = (room_id, text) => {
    const CW_API_TOKEN = PropertiesService.getScriptProperties().getProperty('CW_TOKEN');
    console.log(CW_API_TOKEN)
    const options = {
      "method": "post",
      "headers": {
        "X-ChatWorkToken": CW_API_TOKEN
      },
      "payload": {
        "body": text
      }
    };
    const apiUrl = "https://api.chatwork.com/v2/rooms/" + room_id + "/messages";
    const response = UrlFetchApp.fetch(apiUrl, options);
  };

  for (let row_n = sheet.getLastRow() - 1; row_n > first_row; row_n--) {
    // ルームIDがなければcontinue
    if (sheet_data[row_n][room_id_column] == "") {
      continue
    }

    // メッセージ本文がなければcontinue
    if (sheet_data[row_n][message_column] == "") {
      continue
    }

    // メッセージの送信日がなければcontinue
    if (sheet_data[row_n][sending_date_column]) {
      continue
    }

    const message_body = sheet_data[row_n][message_column]
    cw_send_message(room_id, message_body)


  }


}