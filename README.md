# messages in bottles

* `npm start` starts the server. once it's up, you can do `i` in that terminal window and it'll pop open the xcode simulator
* `npm test` runs the tests (if you are getting weird type failures, try running `npm test -- --no-cache` and go make yourself some coffee)
* `npm run-script test:watch` will run the tests on `watch`
* `npm run-script docs` will generate documentation
* `npm run-script nuke` deletes `node_modules`, reinstalls everything, then restarts the Expo server with a flag telling it to clear its cache

* [Quick Docs](#quick-docs)
* [running](#running)
  * [users](#users)
  * [location](#location)
* [tools](#tools)
  * [react native](#react-native)
  * [expo](#expo)
  * [typescript](#typescript)
  * [jest](#jest)
    * [mocking](#mocking)
  * [testing-library](#testing-library)
    * [about the queries](#about-the-queries)
  * [react-navigation](#react-navigation)
* [config files](#config-files)
* [misc](#misc)
  * [gotchas](#gotchas)

## Quick Docs

* [React Native](https://facebook.github.io/react-native/docs/)
  * [API, builtins](https://facebook.github.io/react-native/docs/activityindicator)
* [Expo](https://docs.expo.io/versions/v33.0.0/)
  * [Location](https://docs.expo.io/versions/v33.0.0/sdk/location/)
  * [Permissions](https://docs.expo.io/versions/v33.0.0/sdk/permissions/)
* [Native Testing Library](https://www.native-testing-library.com/docs)
  * [queries](https://www.native-testing-library.com/docs/api-queries)
  * [firing events](https://www.native-testing-library.com/docs/api-events)
* [TypeScript](http://www.typescriptlang.org/docs/home.html)
* [React Navigation](https://reactnavigation.org/docs/en/getting-started.html)
* [Jest](https://jestjs.io/)

## running

* (first time only) `npm install`
* `npm start`
* open app by...
  * on device by scanning QR code in terminal or browser
  * in xcode simulator by selecting "Run on iOS simulator" in browser
    * If you get an error, try running `sudo xcode-select -s /Applications/Xcode.app`. Nothing will change visibly, but once you've done that try pressing the "Run on iOS simulator" button again.
    * if you get an error about the device being booted/etc, just try again.

If you are not using VSCode or a different editor that hooks into the Typescript compiler and you want the typechecking live as you work, open another terminal tab and run `npm run-script typecheck:watch`. Otherwise, you can run `npm run-script typecheck` to compile the whole project. By default, `ts-jest` fails tests if type errors are found.

(VSCode is in no way a requirement, nor is any particular editor; it just happens to have particularly good integration with TypeScript.)

### users

To change users, or to run the app without a profile (say to test to signup flow), right now you need to go into `<project_root>/src/navigation/routes.tsx` and change the `INITIAL_APP_USER`  to be the user you want, or `null` if you want to be someone without an account.

The tests will run with a randomly generated default user.

### location

Right now we aren't accessing the location off the device, we're using fake generated location data.

TODO: location stuff

## tools

### react native

https://facebook.github.io/react-native/docs/

**Why?:** <del>Move fast, break things</del> It allows for real quick development and is more familiar to folks who know React and JS than, you know, Swift. Only one toolchain-ish necessary for cross-platform.

RN is certainly different in a bunch of ways in the everything around it -- on the actual *React* parts it's basically the same.

### expo

https://docs.expo.io/versions/v33.0.0/

**Why?:** Similar to `create-react-app` and actually made by the team who made the RN version of CRA. Good docs. Definitely heavy, but good API and a *lot* of built-in conveniences, and legit made it mostly painless to get up and running quickly.

Similar to CRA, there is an `eject` feature.

### typescript

http://www.typescriptlang.org/docs/home.html

**Why?:** Because fuck null and hell yeah type safety. Serious answer: it's growing in use and the type-safety features make refactoring alone much easier as the compiler will yell at you. In particular with data that has a structured shape, it's nice to be able to enforce that consistently, and know that if we change it one place we'll have to deal with it, ahead of time, on purpose, elsewhere.

### jest

* [`__tests__`](./__tests__)
* [`__mocks__`](./__mocks__)

https://jestjs.io/

**Why?:** probably the biggest/most well-known one for JS. which isn't necessarily a good thing, but the API is reasonable and friendly, similar to many testing libs, `expect/describe/it/test` etc.

* `npm test -- --watch` runs the tests on watch
  * the watcher can get weird -- if you run into an issue where it's failing because, say, some exponent doesn't exist in the file, trying pressing `a` to force it to rerun the full suite, or run it without the cache.

First run takes a thousand years, as does running it without the cache. Decently fast after that though.

#### mocking

_we have to do more mocking than I like overall. thankfully, TS means we can enforce the interfaces, which helps._

Jest will automatically mock any modules in a `__mocks__` folder in relation to where it is.
Basically we need to preserve the folder structure for where Jest needs to look for mocks so that all paths/etc stay correct. eg:

* mocking `expo`
  * `expo` is a module in our `node_modules` folder,
  * the path to it is `<project_root>/node_modules/expo`
  * then mock expo needs to be `<project_root>/__mocks__/expo`
* mocking `<project_root>/src/api/message.ts` (which we don't do but)
  * the path to `message.ts` is `<project_root>/src/api/message.ts`
  * the folder is `<project_root>/src/api`
  * then mock should be `<project_root>/src/__mocks__/message.ts`

If we were mocking out `src/api/message.ts`, we'd need to create `src/__mocks__/message.ts`.

If we wanted **to override a mock and instead use the real module, you'd do `jest.requireActual('src/api/message.ts')`**.

### testing-library

https://www.native-testing-library.com/

**why?:** tl;dr: way simpler API, does a better job of testing for UX purposes, way lighter, way friendlier, also that whale mascot is hella cute

**Why this over enzyme?** Couple of reasons.

why *not* enzyme?

1. Enzyme is heavy
2. their API is confusing/hard to remember/complex
3. to get setup, they require a lot of surrounding tooling -- most of which is not suited to RN, and is a series of awkward monkey-patches, like rendering a fake window and fake dom to start, etc.
4. the level of mocking etc to get things working removes a lot of confidence that you're even testing things the way they are in the app

why this one instead?

1. hella cute whale mascot
2. I agree with their basic premise: for UI/app testing (so not unit tests here), you shouldn't be asserting or testing against implementation details. My tests shouldn't fail if I rename the `MessageList` component to be `FancyMessageList` -- users don't care. They should fail if after being given some messages, one of which has the string "hello world" in it, that nothing can be found that says "hello world" on the page. that is, it forces you to write tests in a way a user can look at your app.
3. much simpler and more consistent

#### about the queries

(The site has [nice docs](https://www.native-testing-library.com/docs/api-queries) on this, too.)

There's 2 main ways to find things: by text or by testID. Test IDs are what they sound like; they're a global prop on React Native elements for this exact purpose. "By text" is also what it sounds like, and you can pass in a string or a string and options, etc, to do fuzzy matching. I think you can do a regex as well. (There are other ways to find things, I've just not used them and haven't needed to.)

Based on those, there are 3 main *kinds* of finding that relate to your tests themselves:

* `getBy...` will throw an error if nothing is found
* `findBy...` is like `getBy`, but asynchronous -- this is what you want when you're doing things that involve changing screens, waiting for effects, etc. so you can do `await findByText('Home')` to assert that sometime within the next few ms that should be true, otherwise it'll throw.
* `queryBy...`: looks for a node via the selector given (eg, `byText`, etc);

### react-navigation

**Why?:** It's the only one I found/is mentioned in the docs.

https://reactnavigation.org/docs/en/getting-started.html

I'm not thrilled with this so far, and there's some decent criticism of it re accessibility, etc. Other options are experimental or more `react-router`y which I also dislike interface-wise.

There's another option, `react-native-navigation`, which is well-supported and popular, but requires much heavier lifting by the devs in the native front -- interfacing with gradle, xcode, etc. If we truly need other things we have to eject for then I'd like to give it a shot, but until then, it's not fair to everyone else just because I'm surly about weird router APIs.

## config files

* `app.json`: config file for the app itself, which Expo uses
* `babel.config.js`: babel
* `jest.config.js`: test runner setup options
* `rn-cli.config.js`: not sure tbh
* `tsconfig.json`: options for the compiler itself

## misc

### gotchas

* > `error TS1208: Cannot compile namespaces when the '--isolatedModules' flag is provided.`
  means that you are in a file that neither exports nor imports anything. It's a weird error and there's no way around it, but it's basically the compiler going "So you realize that this file is sort of not interacting with anything from what we can tell?" Adding an `import` or `export` fixes it though.
* > `Requiring unknown module "1111".If you are sure the module is there, try restarting Metro Bundler. You may also want to run `yarn`, or `npm install` (depending on your environment).
  this came from me renaming a file with the server running, and in the log you get an ENOENT

* > Unable to resolve module `react-native-gesture-handler` from ...: Module `react-native-gesture-handler` does not exist in the Haste module map
  > This might be related to https://github.com/facebook/react-native/issues/4968
  > To resolve try the following:
  >  1. Clear watchman watches: `watchman watch-del-all`.
  >  2. Delete the `node_modules` folder: `rm -rf node_modules && npm install`.
  >  3. Reset Metro Bundler cache: `rm -rf /tmp/metro-bundler-cache-*` or `npm start -- --reset-cache`.
  >  4. Remove haste cache: `rm -rf /tmp/haste-map-react-native-packager-*`.
