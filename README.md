![🏆](https://github.com/web3-master/zksnark-sudoku/blob/master/screen-capture.gif?raw=true)

# 🏆🏆🏆 zkSNARK Sudoku x zkVerify 🏆🏆🏆

Sudoku verifier using zkSNARK and zkVerify for proof verification.

## 📺 LIVE ON

https://zksnark-sudoku.surge.sh/

## 📜 zksnark

### ⚔️ Used technologies

> Groth16: zksnark implementation scheme.

> Circom: zksnark circuit compilation toolkit.

> snarkjs: zksnark library.

> zkVerifyJS: Proof verification on zkVerify 


### 📝 Description

## 📺 Application

### ⚔️ Used technologies

> antd: Excellent UI template library for react.js.

> React.js: For our front end building.

### 📝 Description

This is react.js based web application for sudoku game play and verify.
Now it has the following features.

1. Game play.
   Application will generate puzzles for you and you can solve it.
2. Proof generation.
   If you solve a puzzle, you can generate its proof.
3. Verify.
   You can make sure others that you have solved a puzzle without sharing your solution.

## 🚀 Deployed in Cloudflare Pages


> We have a `wrangler.toml` file that contains the Cloudflare deployment configuration.
> However, the build command is configured directly in the Cloudflare console.

It uses the following command to set up the environment and build the application:

```bash
npm install --legacy-peer-deps && cd packages/app && npx @cloudflare/next-on-pages@1.13.2
```

To test the application locally, replicating the cloudflare pages behavior:

```bash
npm run preview
```
