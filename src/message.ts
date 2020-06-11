const send_monthly_msg = () => {
  const sheet_name = "【毎月】メッセージ"

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet_name)
  const sheet_data = sheet.getDataRange().getValues()
  // 行や列を配列として捉える　0スタート
  const first_row = 3 - 1;
  const room_id_column = 1 - 1;
  const message_column = 2 - 1;
  const sending_date_column = 3 - 1;

  //今日の取得
  const today = new Date()
  const dd_num = Utilities.formatDate(today, 'Asia/Tokyo', 'dd')
  console.log(dd_num)


  interface request_message_obj {
    room_id: string;
    mssage_body: string;
    fixed_date: number;
  }

  for (let row_n = sheet.getLastRow() - 1; row_n >= first_row; row_n--) {
    let room_id = sheet_data[row_n][room_id_column]
    let message_body = sheet_data[row_n][message_column]
    let routine_day = sheet_data[row_n][sending_date_column]
    // ルームIDがなければcontinue
    if (room_id == "") {
      continue
    }

    // メッセージ本文がなければcontinue
    if (message_body == "") {
      continue
    }

    /*
    // メッセージの送信日がなければcontinue
    if (sheet_data[row_n][sending_date_column] == "") {
      continue
    }
    */

    // 今日の日付と設定した日付が一致しなければcontinue
    if (dd_num != routine_day) {
      continue
    }

    cw_send_message(room_id, message_body)


  }


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