const generator = async (prompts, validationRegExes, about, dir, cmd, mergeScript, removeDefault, chalk, fs) => {
    const { prompt, confirm, numeral, toggle, select, multiSelect } = prompts
    const { identifier, repository} = validationRegExes

    const path = require('path')

    const generatorName = await prompt('Generator name (without nautus-)', '', identifier, false)
    const description = await prompt('Description', 'A kelp generator for ' + generatorName, null, true)
    if (!about.githubUsername) about.githubUsername = await prompt('Username')
    const explanations = await confirm('Would you like explanation comments?')
    let repo = null
    
    const license = await prompt('License', 'MIT', validationRegExes.license)

    if (await confirm('Do you have a GitHub repo?')) {
        repo = await prompt('Repository', `${about.githubUsername}/${generatorName}`, repository)
    }

    // Generate package.json
    const pkgJSON = {
        name: `nautus-${generatorName}`,
        version: '0.1.0',
        description,
        main: 'main.js',
        scripts: {
            test: "echo \"Error: no test specified\" && exit 1"
        },
        keywords: [
            "nautus",
            "kelp",
            "generator",
            "boilerplate"
        ],
        author: `${about.name||about.githubUsername} (https://github.com/${about.githubUsername})`,
        license,
        dependencies: {}
    }
    if (repo) {
        pkgJSON.repository = {
            type: 'git',
            url: `git+https://github.com/${repo}.git`
        }
        pkgJSON.bugs = {
            url: `https://github.com/${repo}/issues`
        }
        pkgJSON.homepage = `https://github.com/${repo}#readme`
    }
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkgJSON))

    // main.js
    if (explanations) {
        fs.copyFileSync(path.join(__dirname, 'templates', 'main.js'), path.join(dir, 'main.js'))
    } else {
        fs.copyFileSync(path.join(__dirname, 'templates', 'main.min.js'), path.join(dir, 'main.js'))
    }

    // @Run.js
    removeDefault('Run') // Removes the default error message
    mergeScript('Run', `exit(await spawn('nautus', ['kelp-try', "${dir.replace(/\\/g, '/')}"]))`)

    // @Release.js
    removeDefault('Release')
    mergeScript('Release', fs.readFileSync(path.join(__dirname, 'templates', '@Release.js')))

}

module.exports = {
    generator,
    use: generator,
    commands: () => {},
    gitIgnore: `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# Snowpack dependency directory (https://snowpack.dev/)
web_modules/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional stylelint cache
.stylelintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
# Comment in the public line in if your project uses Gatsby and not Next.js
# https://nextjs.org/blog/next-9-1#public-directory-support
# public

# vuepress build output
.vuepress/dist

# vuepress v2.x temp and cache directory
.temp
.cache

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*
`
}
