<p align="center">
<img alt='Due Helper Logo' width="400"  src='https://s4.ax1x.com/2021/12/30/TWW1u6.png'/>
<br/>
<span>A free & open-source software for managing tasks. Optimized for tasks with due dates under categories.</span>
<br/>
<span>Made by <a href="https://github.com/BenjaminYe36">Guangyin Ye</a></span>
</p>

## Testing & Building
### Pre-req for testing

- NodeJs & npm
- yarn

### Testing instructions
1. git clone this repo or download source code and extract
2. run `npm install` under project folder
3. if you don't have `yarn`, run `npm install --global yarn`
4. run `npm run electron:dev` for dev build testing
5. see [package.json](https://github.com/BenjaminYe36/Due-Helper/blob/main/package.json) scripts part for more commands
6. see [template_readme.md](https://github.com/BenjaminYe36/Due-Helper/blob/main/template_readme.md) to understand the project directory structure

### Building
run command `npm run electron:build` for creating distribution for your platform

## Many Thanks to the following template for React-TypeScript-Electron

- https://github.com/yhirose/react-typescript-electron-sample-with-create-react-app-and-electron-builder
