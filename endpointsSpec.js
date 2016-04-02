export default {
  "endpointSpec": {
    "baseUrl": "https://api.glvrd.ru/v2/",
      "endpoints": [
      {
        "name": "status",
        "method": "GET",
        "queryParams": [ "app" ],
        "body": [],
        "responseExample": {
          "status": "ok",
          "max_text_length": 10000,
          "max_hints_count": 25
        }
      },
      {
        "name": "status",
        "method": "POST",
        "queryParams": [ "app", "session" ],
        "body": [],
        "responseExample": {
          "status": "ok",
          "max_text_length": 10000,
          "max_hints_count": 25
        }
      },
      {
        "name": "session",
        "method": "POST",
        "queryParams": [ "app" ],
        "body": [],
        "responseExample": {
          "status": "ok",
          "session": 10000,
          "lifespan": 3600
        }
      },
      {
        "name": "proofread",
        "method": "POST",
        "queryParams": [ "app", "session" ],
        "body": [ "text" ],
        "responseExample": {
          "status": "ok",
          "fragments": [
            {
              "start": 0,
              "end": 15,
              "hint_id": 123456
            },
            {
              "start": 56,
              "end": 62,
              "hint_id": 987654
            }
          ]
        }
      },
      {
        "name": "hints",
        "method": "POST",
        "queryParams": [ "app", "session" ],
        "body": [ "ids" ],
        "responseExample": {
          "status": "ok",
          "hints": [
            {
              "123456": { "name": "Необъективная оценка", "description": "Удалите или докажите фактами" }
            },
            {
              "987654": { "name": "Фраза с модальным глаголом", "description": "Уберите модальный, оставьте смысловой глагол" }
            }
          ]
        }
      }
    ],
      "errorsForCover": [
      {
        "status": "error",
        "code": "busy",
        "message": "Главред очень занят. Попробуйте снова через 10 секунд.",
        "repeat": 10
      },
      {
        "status": "error",
        "code": "too_many_requests",
        "message": "Слишком много букв. Попробуйте снова через 10 секунд.",
        "repeat": 10
      },
      {
        "status": "error",
        "code": "obsolete",
        "message": "Плагин устарел. Спросите у разработчика новую версию."
      },
      {
        "status": "error",
        "code": "bad_session",
        "message": "Попробуйте закрыть и снова открыть приложение."
      }
    ]
  }
};
