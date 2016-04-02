# node-glvrd

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]

> 

## Установка

    npm install --save node-glvrd

## Использование

```js
import nodeGlvrd from 'node-glvrd';

var glvrd = new nodeGlvrd('Super-duper/1.0');
```

## API

### `new nodeGlvrd(appName)`

#### `appName` <sup>(обязательный, строка)</sup>

Заранее регистрировать appName не нужно, выбирайте любой разумный вариант. Предлагаемый формат и примеры значений:

* Super-duper/1.0
* GreatPlugin/0.2.3beta
* Example/0.1 (http://example.ru)

## Лицензия

MIT © [Aleksander Terekhov](http://terales.info)

## Обозначения коммитов

| Обозначение | Код | Описание |
|:---:|---|---|
| :art: | `:art:` | when improving the **format**/structure of the code |
| :racehorse: | `:racehorse:` | when improving **performance** |
| :books: | `:books:` | when writing **docs** |
| :bug: | `:bug:` | when reporting a **bug** |
| :ambulance: | `:ambulance:` | when fixing a **bug** |
| :fire: | `:fire:` | when **removing code** or files |
| :white_check_mark: | `:white_check_mark:` | when adding **tests** |
| :green_heart: | `:green_heart:` | when fixing the **CI** build |
| :lock: | `:lock:` | when dealing with **security** |
| :arrow_up: | `:arrow_up:` | when upgrading **dependencies** |
| :arrow_down: | `:arrow_down:` | when downgrading **dependencies** |
| :shirt: | `:shirt:` | when removing **linter**/strict/deprecation warnings |
| :lipstick: | `:lipstick:` | when improving **UI**/Cosmetic |
| :construction: | `:construction:` | **WIP**(Work In Progress) Commits |
| :gem: | `:gem:` | New **Release** |
| :bookmark: | `:bookmark:` | Version **Tags** |
| :sparkles: | `:sparkles:` | when introducing **New** Features |
| :zap: | `:zap:` | when introducing **Backward-InCompatible** Features |
| :bulb: | `:bulb:` | New **Idea** |
| :rocket: | `:rocket:` | Anything related to Deployments/**DevOps** |
| :tada: | `:tada:` | **Initial** Commit |


[npm-url]: https://npmjs.org/package/node-glvrd
[npm-image]: https://img.shields.io/npm/v/node-glvrd.svg?style=flat-square

[travis-url]: https://travis-ci.org/terales/node-glvrd
[travis-image]: https://img.shields.io/travis/terales/node-glvrd.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/terales/node-glvrd
[coveralls-image]: https://img.shields.io/coveralls/terales/node-glvrd.svg?style=flat-square

[depstat-url]: https://david-dm.org/terales/node-glvrd
[depstat-image]: https://david-dm.org/terales/node-glvrd.svg?style=flat-square
