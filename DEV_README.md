# Developer Guide

## Pre-requisites

1. Install Rust
```shell
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
2. Install Circom
```shell
cargo install --locked --git https://github.com/iden3/circom.git circom
```
3. Add powers of tau to `circuit/circuits` directory, git ignored due to size.
```shell
curl -o powersOfTau28_hez_final_16.ptau https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau
```

If updating snarkjs also run

terser packages/app/node_modules/snarkjs/build/snarkjs.js -o packages/app/public/snarkjs.min.js


Force refresh the browser after deploying new version, especially if changing zkverify tgz file.

## Install

1. The legacy peer deps is required on install:

```shell
npm install --legacy-peer-deps
```

2. Development using a locally built zkverifyjs tgz file (placed in `packages/zkverifyjs`) might require removing and reinstalling dependencies

```shell
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Migrating to zkVerify

1. Make sure snarkjs version is the latest
2. Use the Rust version of Circom v2 + `circom --version` and not a js package implementation.
3. Import zkverifyjs latest version.
4. Can often require `rm -rf node_modules package-lock.json` & `npm cache clean --force` before doing an npm install or manually add from a tgz with `npm install ./packages/zkverifyjs/zkverifyjs-1.0.0.tgz`