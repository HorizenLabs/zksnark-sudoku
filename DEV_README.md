# Developer Guide

## Project Overview

This project is a zkSNARK Sudoku verifier using Circom for circuit compilation and Sindri for proof generation. It's structured as a monorepo with separate packages for the circuit and the application.

## Pre-requisites

1. Install Rust (required for Circom):

   ```shell
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. Install Circom (zkSNARK circuit compiler):

   ```shell
   cargo install --locked --git https://github.com/iden3/circom.git circom
   ```

3. Download the Powers of Tau file (required for circuit setup):

   ```shell
   curl -o powersOfTau28_hez_final_16.ptau https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau
   ```

   If updating snarkjs also run

   ```shell
   terser packages/app/node_modules/snarkjs/build/snarkjs.js -o packages/app/public/snarkjs.min.js
   ```

## Install

1. Install dependencies (use legacy peer deps due to potential compatibility issues):

   ```shell
   npm install --legacy-peer-deps
   ```

2. If using a locally built zkverifyjs, you may need to clean and reinstall:

   ```shell
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

3. If needed, manually install zkverifyjs from a local .tgz file:

   ```shell
   npm install ./packages/zkverifyjs/zkverifyjs-1.0.0.tgz
   ```

## Migrating to zkVerify

1. Make sure snarkjs version is the latest
2. Use the Rust version of Circom v2 + `circom --version` and not a js package implementation.
3. Import zkverifyjs latest version.
4. Can often require `rm -rf node_modules package-lock.json` & `npm cache clean --force` before doing an npm install or manually add from a tgz with `npm install ./packages/zkverifyjs/zkverifyjs-1.0.0.tgz`

## Circuit Creation and Compilation

1. The main circuit is located in `packages/circuit/circuits/sudoku.circom`. If you need to modify the circuit, edit this file.

2. After modifying the circuit (or when setting up for the first time), navigate to the circuit directory:

   ```shell
   cd packages/circuit
   ```

3. Run the compilation script:

   ```shell
   ./compile_circuit.sh
   ```

   This script performs the following steps:

   - Compiles the circuit using Circom
   - Generates the witness
   - Sets up the proving key
   - Exports the verification key

4. After compilation, you need to create the circuit on Sindri.

5. Run the circuit creation script:

   ```shell
   npx tsx compile.ts
   ```

   > Ensure you have the necessary dependencies installed: `npm install sindri tsx`
   > Set your Sindri API key as an environment variable: `export SINDRI_API_KEY=<your-api-key>`

6. Note the `circuitId` and `circuitName` returned by the script. You'll need to update this in your application code.

## Sindri Integration

Sindri is used for proof generation. To set it up:

1. Sign up at [Sindri.app](https://sindri.app/)

2. Add your Sindri API key to `packages/app/.env`:

   ```shell
   SINDRI_API_KEY=<your-api-key>
   NEXT_PUBLIC_USE_SINDRI=true
   ```

3. The Sindri configuration is in `packages/circuit/sindri.json`:

4. Update the `circuitIdentifier` in [sindri.ts](packages/app/pages/api/sindri.ts) with the `circuitName` or `circuitId` you received when creating the circuit.

5. To test proof generation with Sindri, run:

   ```shell
   cd packages/circuit
   npx sindri@latest proof create --input input.json
   ```

## Troubleshooting

- If you encounter issues after updating dependencies, try clearing the cache and reinstalling:

  ```shell
  npm cache clean --force
  rm -rf node_modules package-lock.json
  npm install --legacy-peer-deps
  ```

- Ensure all dependencies are up to date, including snarkjs, sindri, and circom.

- After deploying a new version or changing the zkverify .tgz file, force refresh the browser.

## Additional Notes

- The main Sudoku circuit is in `packages/circuit/circuits/sudoku.circom`.
- Proof generation is handled in `packages/app/pages/api/sindri.ts`.
- The React hook for interacting with Sindri is in `packages/app/src/hooks/useSindri.ts`.
