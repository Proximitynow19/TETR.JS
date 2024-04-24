<p align="center">
  <img width="80%" src="https://raw.githubusercontent.com/tetrjs/TETR.JS/stable/images/large_shadow.png">
</p>

<p align="center">
 An API Wrapper For <a href="https://tetr.io/">TETR.IO</a>
</p>

<p align="center">
  <!-- Flat style -->
  <a href="https://www.typescriptlang.org/" rel="TypeScript"><img src="https://img.shields.io/badge/TypeScript-v5.3.3-blue"></a>
  <a href="https://www.npmjs.com/package/tetr.js" rel="NPM Size"><img src="https://img.shields.io/bundlephobia/min/tetr.js"></a>
  <a href="https://www.npmjs.com/package/tetr.js" rel="NPM Version"><img src=" https://img.shields.io/npm/v/tetr.js"></a>
</p>

- [Install](#install)
- [Example](#example)
- [Technologies](#technologies)
- [Contributing](#contributing)
- [Discord](#discord)
- [License](#license)
- [Disclaimer](#disclaimer)
- [Credits](#credits)

## Install

```sh
$ npm i tetr.js --save
```

## Example

```js
const { Client } = require("tetr.js");

(async () => {
  const client = new Client();

  await client.login("YOUR-TOKEN-HERE");

  console.log("Bot online");
})();
```

<!-- Find more examples [here](https://github.com/Proximitynow19/TETR.JS/tree/master/examples) -->

## Technologies

- [TypeScript](https://www.typescriptlang.org/)
- [TypeDoc](https://typedoc.org//)

## Contributing

Feedback and PRs are welcome!

## Discord

<p align="center">
  <a href="https://discord.gg/e3vFHq9WZz">
    <img src="https://discordapp.com/api/guilds/827703471822078002/widget.png?style=banner3"/>
  </a>
</p>

## License

This project is licensed under the MIT License. See [LICENSE](https://github.com/tetrjs/TETR.JS/blob/stable/LICENSE.txt) for details.

## Disclaimer

TETR.JS is not associated with TETR.IO or osk. The token provided must match an account that has been approved as a bot account. Contact [TETR.IO Support](https://tetr.io/about/support/) to request a bot account.

## Credits

Special thanks to [Poyo-SSB](https://github.com/Poyo-SSB) for documenting how the [TETR.IO Ribbon system](https://github.com/Poyo-SSB/tetrio-bot-docs) operates.
