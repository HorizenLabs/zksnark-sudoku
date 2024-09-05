#!/bin/bash

# Define the circuit name and directories
CIRCUIT_NAME="sudoku"
CIRCUIT_DIR="circuits"
OUTPUT_DIR="../../app/public"
PTAU_FILE="powersOfTau28_hez_final_16.ptau"

# Navigate to the circuit directory
cd ${CIRCUIT_DIR}

# Check if the PTAU file exists
if [ ! -f ${PTAU_FILE} ]; then
    echo "Error: ${PTAU_FILE} not found. Please download it first."
    exit 1
fi

# Step 1: Compile the circuit
echo "Compiling the circuit..."
circom ${CIRCUIT_NAME}.circom --r1cs --wasm --sym

# Step 2: Start a new setup
echo "Starting the setup..."
snarkjs groth16 setup ${CIRCUIT_NAME}.r1cs ${PTAU_FILE} ${CIRCUIT_NAME}_0.zkey

# Step 3: Contribute to the ceremony
echo "Contributing to the ceremony..."
snarkjs zkey contribute ${CIRCUIT_NAME}_0.zkey ${CIRCUIT_NAME}_1.zkey --name="First contribution" -v

# Step 4: Export the verification key
echo "Exporting the verification key..."
snarkjs zkey export verificationkey ${CIRCUIT_NAME}_1.zkey ${CIRCUIT_NAME}_verify_key.json

# Step 5: Move the necessary files to the public folder
echo "Moving files to the app/public folder..."
mv ${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm ${OUTPUT_DIR}/
mv ${CIRCUIT_NAME}_1.zkey ${OUTPUT_DIR}/
mv ${CIRCUIT_NAME}_verify_key.json ${OUTPUT_DIR}/

# Cleanup
echo "Cleaning up intermediate files..."
rm ${CIRCUIT_NAME}.r1cs
rm ${CIRCUIT_NAME}.sym
rm ${CIRCUIT_NAME}_0.zkey

echo "Process completed successfully!"
