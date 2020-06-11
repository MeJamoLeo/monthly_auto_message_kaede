
const send_manthly_task = () => {
  const sheet_name = "【毎月】タスク"

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet_name)
  const sheet_data = sheet.getDataRange().getValues()
  // 行や列を配列として捉える　0スタート
  const first_row = 3 - 1;
  const room_id_column = 1 - 1;
  const task_column = 2 - 1;
  const sending_date_column = 3 - 1;
  const limit_column = 4 - 1;
  const member_column = 5 - 1;

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
    const room_id = sheet_data[row_n][room_id_column]
    const task_body = sheet_data[row_n][task_column]
    const sending_date = sheet_data[row_n][sending_date_column]
    // ルームIDがなければcontinue
    if (room_id == "") {
      continue
    }

    // タスク内容がなければcontinue
    if (task_body == "") {
      continue
    }

    // 今日の日付と設定した日付が一致しなければcontinue
    if (dd_num != sending_date) {
      continue
    }

    //　「タスクの期限」の有無による条件分岐
    const limit_days = sheet_data[row_n][limit_column]
    const get_limit_obj = (limit_days, today) => {

      if (limit_days == "") {
        const limit_obj = {
          deadline: "0",
          type: "none"
        }
        return limit_obj
      }
      // タスクを追加日＋期限
      const limit_days_unix = limit_days * (60 * 60 * 24)
      const unix_time = Math.floor(today.getTime() / 1000) + limit_days_unix;
      const limit_obj = {
        deadline: unix_time.toString(),
        type: "date"
      }
      return limit_obj
    }

    const limit_obj = get_limit_obj(limit_days, today)
    // 担当者のIDを取得する
    const member_ids_str = get_member_ids_str(room_id)

    cw_send_task(room_id, task_body, limit_obj.deadline, limit_obj.type, member_ids_str)
  }
}



const cw_send_task = (room_id, task_body, limit, limit_type, to_ids) => {
  const CW_API_TOKEN = PropertiesService.getScriptProperties().getProperty('CW_TOKEN');
  const options = {
    "method": "post",
    "headers": {
      "X-ChatWorkToken": CW_API_TOKEN
    },
    "payload": {
      "body": task_body,
      "limit": limit,
      "limit_type": limit_type,
      "to_ids": to_ids
    }
  };
  const apiUrl = "https://api.chatwork.com/v2/rooms/" + room_id + "/tasks";
  const response = UrlFetchApp.fetch(apiUrl, options);
};


const get_member_ids_str = (room_id) => {

  // チャットワークのルームからメンバーの情報を取得
  const get_member_info = (room_id) => {
    const CW_API_TOKEN = PropertiesService.getScriptProperties().getProperty('CW_TOKEN');
    const options = {
      "method": "get",
      "headers": {
        "X-ChatWorkToken": CW_API_TOKEN
      }
    }
    const apiUrl = "https://api.chatwork.com/v2/rooms/" + room_id + "/members";
    const response = UrlFetchApp.fetch(apiUrl, options)
    const jsons = JSON.parse(response.getContentText());

    return jsons
  }


  // メンバーの情報からchatwork_idのみを配列で返す
  const get_chatwork_ids = (jsons) => {
    let member_ids = [];
    const my_cw_id = PropertiesService.getScriptProperties().getProperty('CW_ID')
    for (let n = 0; n < jsons.length; n++) {
      const json = jsons[n];
      const chatwork_id = json.account_id
      if (chatwork_id == my_cw_id) {
        continue;
      }
      member_ids.push(chatwork_id)
    }
    return member_ids
  }


  const chatwork_id_str = get_chatwork_ids(get_member_info(room_id)).join(",")
  console.log(chatwork_id_str)
  return chatwork_id_str


}