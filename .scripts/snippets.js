const glob = require('glob-all')
const fs = require('fs')
const docblockParser = require('coffeekraken-docblock-parser')
const docblockParserInstance = docblockParser({
	language: 'php'
})

const res = {};

const files = glob.sync([
	'../wp-stack/src/functions/**/*.php'
])

files.forEach((file) => {
	const content = fs.readFileSync(file, 'utf8')
	const json = docblockParserInstance.parse(content)
	json.forEach((docblock) => {

		const args = [];
		if (docblock.params) {
			docblock.params.forEach((param, idx) => {
				let p = `\${${idx+1}:${param.types.map((p) => p.toLowerCase()).join('|')} ${param.name.replace('$','\\$')}`
				if (param.default) {
					p += ` = ${param.default}`
				}
				p += '}'
				args.push(p)
			})
		}

		let body = `WPS::${docblock.name}(${args.join(', ')})`;
		let description = docblock.body

		res[`WPS::${docblock.name}`] = {
			prefix: `WPS::${docblock.name}`,
			body,
			description
		}
	})
})

fs.writeFileSync('snippets/snippets.json', JSON.stringify(res, null, 2));
