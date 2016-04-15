# node-glvrd - WIP (разрабатывается, пользоваться нельзя)

Библиотека для подключения ко второй версии [API Главреда](https://glvrd.ru/api/). Берет на себя детали реализации, вам останется только подключить ее в node-приложение. Пока работает только для серверов.

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]
[![MIT License][license-image]][license-image]

```js
import nodeGlvrd from 'node-glvrd';
var glvrd = new nodeGlvrd('Your app name/1.0');

glvrd.proofread('Текст!!!').then(fragments => console.log(fragments));

// Result:
{
    start: 1,
    end: 2,
    hint: {
        id: 'r123456789',
        name: 'Многократное восклицание',
        description: 'Никогда не используйте более одного восклицательного знака подряд.'
    }
}
```


## Установка

    npm install --save node-glvrd

## API

### `new nodeGlvrd(appName)`

#### `appName` <sup>(обязательный, строка)</sup>

Заранее регистрировать appName не нужно, выбирайте любой разумный вариант. Предлагаемый формат и примеры значений:

* Super-duper/1.0
* GreatPlugin/0.2.3beta
* Example/0.1 (http://example.ru)

### `glvrd.checkStatus()`

Проверит статус сервера Главреда, используйте только в разработке. Все сетевые ошибки `node-glvrd` вернет в виде исключений (например, 500-й код http-ответа) или корректно обработает. 

## Лицензия

MIT © [Aleksander Terekhov](http://terales.info)

### Работа в Node.js 0.10

Для запуска в приложении под Node.js 0.10, нужно добавить [полифил Promise]:

```js
require('es6-promise').polyfill();
var postcss = require('postcss');
```

[полифил Promise]: https://github.com/jakearchibald/es6-promise

[npm-url]: https://npmjs.org/package/node-glvrd
[npm-image]: https://img.shields.io/npm/v/node-glvrd.svg?style=flat-square

[travis-url]: https://travis-ci.org/terales/node-glvrd
[travis-image]: https://img.shields.io/travis/terales/node-glvrd.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/terales/node-glvrd
[coveralls-image]: https://img.shields.io/coveralls/terales/node-glvrd.svg?style=flat-square

[depstat-url]: https://david-dm.org/terales/node-glvrd
[depstat-image]: https://david-dm.org/terales/node-glvrd.svg?style=flat-square

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg

