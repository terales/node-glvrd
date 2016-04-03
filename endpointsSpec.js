export default {
  "baseUrl": "https://api.glvrd.ru/v2",
  "endpoints": {
    "getStatus": {
      "name": "/status/",
      "method": "get",
      "queryParams": ["app"],
      "body": [],
      "responseExample": {
        "status": "ok",
        "max_text_length": 10000,
        "max_hints_count": 25
      }
    },
    "postStatus": {
      "name": "/status/",
      "method": "post",
      "queryParams": ["app", "session"],
      "body": [],
      "responseExample": {
        "status": "ok",
        "max_text_length": 10000,
        "max_hints_count": 25
      }
    },
    "postSession": {
      "name": "/session/",
      "method": "post",
      "queryParams": ["app"],
      "body": [],
      "responseExample": {
        "status": "ok",
        "session": "b7e99fd7-4d97-4042-9a0b-df6b1de1af35",
        "lifespan": 3600
      }
    },
    "postProofread": {
      "name": "/proofread/",
      "method": "post",
      "queryParams": ["app", "session"],
      "body": ["text"],
      "textExample": "Можно ли представить современный мир без ссылок? Едва ли. И до недавнего времени сервис «Главред» никак не отвечал на вызовы времени, связанные с необходимостью создания гипертекстовых связей в Глобальной паутине.",
      "responseExample": {
        "status": "ok",
        "fragments": [
          {"start": 5, "hint_id": "r772367523480", "end": 25},
          {"start": 26, "hint_id": "r741067498476", "end": 37},
          {"start": 54, "hint_id": "r772592703516", "end": 61},
          {"start": 65, "hint_id": "r600555156012", "end": 85},
          {"start": 112, "hint_id": "r772817883552", "end": 137},
          {"start": 139, "hint_id": "r661353765732", "end": 165},
          {"start": 199, "hint_id": "r585918453672", "end": 217}
        ]
      }
    },
    "postHints": {
      "name": "/hints/",
      "method": "post",
      "queryParams": ["app", "session"],
      "body": ["ids"],
      "responseExample": {
        "status": "ok",
        "hints": {
          "r585918453672": {"name": "Газетный штамп", "description": "Напишите «интернет» без&nbsp;кавычек. Можно даже с&nbsp;заглавной"},
          "r661353765732": {"name": "Сложный синтаксис", "description": "Упростите"},
          "r772592703516": {"name": "Газетный штамп", "description": "Если вы&nbsp;не провинциальный журналист, замените на&nbsp;одно простое слово"},
          "r741067498476": {"name": "Необъективная оценка", "description": "Удалите или докажите фактами"},
          "r772367523480": {"name": "Газетный штамп", "description": "Манерно, попробуйте проще"},
          "r772817883552": {"name": "Газетный штамп", "description": "Если вы&nbsp;не провинциальный журналист, замените на&nbsp;одно простое слово"},
          "r600555156012": {"name": "Паразит времени", "description": "Уберите, уточните или противопоставьте прошлому или будущему"}
        }
      }
    }
  },
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
};
